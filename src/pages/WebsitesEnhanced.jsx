import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientsAPI, crawlAPI } from '../api/clients';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Input } from '../components/primitives/Input';
import { Label } from '../components/primitives/Label';
import { Globe, Plus, Trash2, RefreshCw, ExternalLink, Calendar, FileText, X } from 'lucide-react';

export function Websites() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    baseUrl: '',
    domains: [{ url: '', type: 'main', specificPages: [], crawlSettings: {} }],
    crawlSettings: {
      maxPages: 100,
      crawlDelay: 1000,
      respectRobots: true,
      allowedPaths: [],
      excludedPaths: [],
      userAgent: 'RAG-Bot/1.0'
    },
    metadata: {
      industry: '',
      description: '',
      tags: []
    },
    noDataResponse: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [crawlJobs, setCrawlJobs] = useState({});
  const [allowedPathInput, setAllowedPathInput] = useState('');
  const [excludedPathInput, setExcludedPathInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.list();
      setWebsites(response.data.clients || []);
    } catch (err) {
      console.error('Failed to load websites:', err);
      setError('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      baseUrl: '',
      domains: [{ url: '', type: 'main', specificPages: [], crawlSettings: {} }],
      crawlSettings: {
        maxPages: 100,
        crawlDelay: 1000,
        respectRobots: true,
        allowedPaths: [],
        excludedPaths: [],
        userAgent: 'RAG-Bot/1.0'
      },
      metadata: {
        industry: '',
        description: '',
        tags: []
      },
      noDataResponse: ''
    });
    setAllowedPathInput('');
    setExcludedPathInput('');
    setTagInput('');
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      // Filter out empty domains and ensure at least the main domain is included
      const filteredDomains = formData.domains.filter(d => d.url && d.url.trim() !== '');

      // If no domains were manually added, don't send the domains array (let backend use domain field)
      const submitData = {
        ...formData,
        brokerId: `WEB${Date.now()}`,
      };

      // Only include domains array if user actually filled in the domains section
      if (filteredDomains.length === 0) {
        // Remove domains array, let backend use domain field instead
        delete submitData.domains;
      } else {
        submitData.domains = filteredDomains;
      }

      await clientsAPI.create(submitData);

      setShowAddForm(false);
      resetForm();
      await loadWebsites();
    } catch (err) {
      setError(err.error || 'Failed to add website');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWebsite = async (brokerId) => {
    if (!confirm('Are you sure you want to delete this website? This will also delete all crawled content.')) {
      return;
    }

    try {
      await clientsAPI.delete(brokerId);
      await loadWebsites();
    } catch (err) {
      setError(err.error || 'Failed to delete website');
    }
  };

  const handleStartCrawl = async (brokerId) => {
    try {
      setError('');
      const response = await crawlAPI.start(brokerId, {});
      setCrawlJobs(prev => ({
        ...prev,
        [brokerId]: response.data.jobId
      }));

      pollCrawlStatus(response.data.jobId, brokerId);
    } catch (err) {
      setError(err.error || 'Failed to start crawl');
    }
  };

  const pollCrawlStatus = async (jobId, brokerId) => {
    const interval = setInterval(async () => {
      try {
        const response = await crawlAPI.getStatus(jobId);
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(interval);
          setCrawlJobs(prev => {
            const updated = { ...prev };
            delete updated[brokerId];
            return updated;
          });
          await loadWebsites();
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 3000);
  };

  const addDomain = () => {
    setFormData({
      ...formData,
      domains: [...formData.domains, { url: '', type: 'additional', specificPages: [], crawlSettings: {} }]
    });
  };

  const removeDomain = (index) => {
    setFormData({
      ...formData,
      domains: formData.domains.filter((_, i) => i !== index)
    });
  };

  const updateDomain = (index, field, value) => {
    const newDomains = [...formData.domains];
    newDomains[index] = { ...newDomains[index], [field]: value };
    setFormData({ ...formData, domains: newDomains });
  };

  const addAllowedPath = () => {
    if (allowedPathInput.trim()) {
      setFormData({
        ...formData,
        crawlSettings: {
          ...formData.crawlSettings,
          allowedPaths: [...formData.crawlSettings.allowedPaths, allowedPathInput.trim()]
        }
      });
      setAllowedPathInput('');
    }
  };

  const removeAllowedPath = (index) => {
    setFormData({
      ...formData,
      crawlSettings: {
        ...formData.crawlSettings,
        allowedPaths: formData.crawlSettings.allowedPaths.filter((_, i) => i !== index)
      }
    });
  };

  const addExcludedPath = () => {
    if (excludedPathInput.trim()) {
      setFormData({
        ...formData,
        crawlSettings: {
          ...formData.crawlSettings,
          excludedPaths: [...formData.crawlSettings.excludedPaths, excludedPathInput.trim()]
        }
      });
      setExcludedPathInput('');
    }
  };

  const removeExcludedPath = (index) => {
    setFormData({
      ...formData,
      crawlSettings: {
        ...formData.crawlSettings,
        excludedPaths: formData.crawlSettings.excludedPaths.filter((_, i) => i !== index)
      }
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.metadata.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          tags: [...formData.metadata.tags, tagInput.trim()]
        }
      });
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        tags: formData.metadata.tags.filter((_, i) => i !== index)
      }
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading websites...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1200px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--spacing-xs)' }}>
            <Globe size={32} style={{ display: 'inline', marginRight: 'var(--spacing-sm)', verticalAlign: 'middle' }} />
            My Websites
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your websites and their crawling settings
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} style={{ marginRight: 'var(--spacing-xs)' }} />
          Add Website
        </Button>
      </div>

      {error && (
        <div style={{
          padding: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: 'var(--border-radius-md)',
          color: '#c00',
        }}>
          {error}
        </div>
      )}

      {showAddForm && (
        <Card style={{ marginBottom: 'var(--spacing-xl)' }}>
          <CardHeader>
            <CardTitle>Add New Website</CardTitle>
            <CardDescription>
              Configure your website and crawler settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWebsite}>
              <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>

                {/* Basic Information */}
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                    Basic Information
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    <div>
                      <Label htmlFor="name">Website Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="My Company Website"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="domain">Primary Domain *</Label>
                      <Input
                        id="domain"
                        type="text"
                        placeholder="example.com"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="baseUrl">Base URL *</Label>
                      <Input
                        id="baseUrl"
                        type="url"
                        placeholder="https://www.example.com"
                        value={formData.baseUrl}
                        onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Domains */}
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                    Domains to Crawl
                  </h3>
                  {formData.domains.map((domain, index) => (
                    <div key={index} style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                        <Label>Domain {index + 1} {index === 0 ? '(Main)' : ''}</Label>
                        {index > 0 && (
                          <Button type="button" variant="outline" onClick={() => removeDomain(index)} style={{ padding: '4px 8px' }}>
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                      <Input
                        type="url"
                        placeholder="https://subdomain.example.com"
                        value={domain.url}
                        onChange={(e) => updateDomain(index, 'url', e.target.value)}
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addDomain}>
                    <Plus size={16} style={{ marginRight: 'var(--spacing-xs)' }} />
                    Add Another Domain
                  </Button>
                </div>

                {/* Crawler Settings */}
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                    Crawler Settings
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                      <div>
                        <Label htmlFor="maxPages">Max Pages to Crawl</Label>
                        <Input
                          id="maxPages"
                          type="number"
                          min="1"
                          max="10000"
                          value={formData.crawlSettings.maxPages}
                          onChange={(e) => setFormData({
                            ...formData,
                            crawlSettings: { ...formData.crawlSettings, maxPages: parseInt(e.target.value) || 100 }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="crawlDelay">Crawl Delay (ms)</Label>
                        <Input
                          id="crawlDelay"
                          type="number"
                          min="0"
                          max="10000"
                          value={formData.crawlSettings.crawlDelay}
                          onChange={(e) => setFormData({
                            ...formData,
                            crawlSettings: { ...formData.crawlSettings, crawlDelay: parseInt(e.target.value) || 1000 }
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="userAgent">User Agent</Label>
                      <Input
                        id="userAgent"
                        type="text"
                        value={formData.crawlSettings.userAgent}
                        onChange={(e) => setFormData({
                          ...formData,
                          crawlSettings: { ...formData.crawlSettings, userAgent: e.target.value }
                        })}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <input
                        type="checkbox"
                        id="respectRobots"
                        checked={formData.crawlSettings.respectRobots}
                        onChange={(e) => setFormData({
                          ...formData,
                          crawlSettings: { ...formData.crawlSettings, respectRobots: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <Label htmlFor="respectRobots" style={{ margin: 0, cursor: 'pointer' }}>
                        Respect robots.txt
                      </Label>
                    </div>

                    {/* Allowed Paths */}
                    <div>
                      <Label>Allowed Paths (leave empty to allow all)</Label>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
                        <Input
                          type="text"
                          placeholder="/blog, /products"
                          value={allowedPathInput}
                          onChange={(e) => setAllowedPathInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowedPath())}
                        />
                        <Button type="button" onClick={addAllowedPath}>Add</Button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                        {formData.crawlSettings.allowedPaths.map((path, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.875rem' }}>
                            {path}
                            <button type="button" onClick={() => removeAllowedPath(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Excluded Paths */}
                    <div>
                      <Label>Excluded Paths</Label>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
                        <Input
                          type="text"
                          placeholder="/admin, /api, /private"
                          value={excludedPathInput}
                          onChange={(e) => setExcludedPathInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludedPath())}
                        />
                        <Button type="button" onClick={addExcludedPath}>Add</Button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                        {formData.crawlSettings.excludedPaths.map((path, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.875rem' }}>
                            {path}
                            <button type="button" onClick={() => removeExcludedPath(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                    Metadata & Settings
                  </h3>
                  <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        type="text"
                        placeholder="e.g., Technology, Finance, Healthcare"
                        value={formData.metadata.industry}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, industry: e.target.value }
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        placeholder="Brief description of your website"
                        value={formData.metadata.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, description: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          padding: 'var(--spacing-sm)',
                          borderRadius: 'var(--border-radius-md)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '0.875rem',
                          minHeight: '80px'
                        }}
                      />
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
                        <Input
                          type="text"
                          placeholder="Add tags..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag}>Add</Button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                        {formData.metadata.tags.map((tag, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'var(--purple-gradient)', color: 'white', borderRadius: '4px', fontSize: '0.875rem' }}>
                            {tag}
                            <button type="button" onClick={() => removeTag(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', color: 'white' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="noDataResponse">No Data Response</Label>
                      <textarea
                        id="noDataResponse"
                        placeholder="Custom message when no relevant data is found (optional)"
                        value={formData.noDataResponse}
                        onChange={(e) => setFormData({ ...formData, noDataResponse: e.target.value })}
                        style={{
                          width: '100%',
                          padding: 'var(--spacing-sm)',
                          borderRadius: 'var(--border-radius-md)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '0.875rem',
                          minHeight: '60px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowAddForm(false); resetForm(); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? 'Adding...' : 'Add Website'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Website List (same as before) */}
      {websites.length === 0 ? (
        <Card>
          <CardContent style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <Globe size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>
              No websites yet
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
              Add your first website to start crawling and indexing content
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus size={16} style={{ marginRight: 'var(--spacing-xs)' }} />
              Add Your First Website
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {websites.map((website) => (
            <Card key={website.brokerId}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      {website.name}
                      {website.baseUrl && (
                        <a
                          href={website.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--purple-600)' }}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </CardTitle>
                    <CardDescription>{website.domain || website.baseUrl}</CardDescription>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Button
                      variant="outline"
                      onClick={() => handleStartCrawl(website.brokerId)}
                      disabled={!!crawlJobs[website.brokerId]}
                    >
                      <RefreshCw
                        size={16}
                        style={{
                          marginRight: 'var(--spacing-xs)',
                          animation: crawlJobs[website.brokerId] ? 'spin 1s linear infinite' : 'none'
                        }}
                      />
                      {crawlJobs[website.brokerId] ? 'Crawling...' : 'Crawl'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteWebsite(website.brokerId)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--spacing-lg)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                      Content Pages
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <FileText size={20} />
                      {website.contentCount || 0}
                    </div>
                  </div>

                  {website.lastCrawl && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                        Last Crawled
                      </div>
                      <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <Calendar size={16} />
                        {new Date(website.lastCrawl).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {website.metadata?.industry && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                        Industry
                      </div>
                      <div style={{ fontSize: '0.875rem' }}>
                        {website.metadata.industry}
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                      Status
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: website.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: website.status === 'active' ? '#155724' : '#721c24',
                      display: 'inline-block'
                    }}>
                      {website.status || 'active'}
                    </div>
                  </div>
                </div>

                {website.metadata?.description && (
                  <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                      Description
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {website.metadata.description}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
