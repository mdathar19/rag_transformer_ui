import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientsAPI, crawlAPI } from '../api/clients';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Input } from '../components/primitives/Input';
import { Label } from '../components/primitives/Label';
import { Globe, Plus, Trash2, RefreshCw, ExternalLink, Calendar, FileText } from 'lucide-react';

export function Websites() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    baseUrl: '',
    domains: [],
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

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      await clientsAPI.create({
        ...formData,
        brokerId: `WEB${Date.now()}`,
      });

      setShowAddForm(false);
      setFormData({
        name: '',
        domain: '',
        baseUrl: '',
        domains: [],
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

      // Poll for status
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
          await loadWebsites(); // Refresh to show updated content count
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds
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
              Enter your website details to start crawling and indexing content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWebsite}>
              <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
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
                  <Label htmlFor="domain">Domain *</Label>
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
                  <Input
                    id="description"
                    type="text"
                    placeholder="Brief description of your website"
                    value={formData.metadata.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, description: e.target.value }
                    })}
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
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
