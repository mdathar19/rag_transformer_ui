import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminWebsitesAPI, adminCrawlAPI, getAdminCrawlLogsUrl } from '../../api/adminAPI';
import { Loading, LoadingSpinner } from '../../components/Loading';
import { CrawlLogViewer } from '../../components/CrawlLogViewer';
import { Globe, Plus, Trash2, RefreshCw, ExternalLink, Calendar, FileText, X, Edit } from 'lucide-react';

export function AdminWebsites() {
  const { user, token } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [showLogs, setShowLogs] = useState({});
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
      const response = await adminWebsitesAPI.list();
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
    setEditingWebsite(null);
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const filteredDomains = formData.domains.filter(d => d.url && d.url.trim() !== '');

      const submitData = {
        ...formData,
      };

      if (filteredDomains.length === 0) {
        delete submitData.domains;
      } else {
        submitData.domains = filteredDomains;
      }

      if (editingWebsite) {
        // Update existing website
        await adminWebsitesAPI.update(editingWebsite.brokerId, submitData);
      } else {
        // Create new website
        submitData.brokerId = `WEB${Date.now()}`;
        await adminWebsitesAPI.create(submitData);
      }

      setShowAddForm(false);
      resetForm();
      await loadWebsites();
    } catch (err) {
      setError(err.error || `Failed to ${editingWebsite ? 'update' : 'add'} website`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (website) => {
    setEditingWebsite(website);
    setFormData({
      name: website.name || '',
      domain: website.domain || '',
      baseUrl: website.baseUrl || '',
      domains: website.domains && website.domains.length > 0
        ? website.domains
        : [{ url: '', type: 'main', specificPages: [], crawlSettings: {} }],
      crawlSettings: {
        maxPages: website.crawlSettings?.maxPages || 100,
        crawlDelay: website.crawlSettings?.crawlDelay || 1000,
        respectRobots: website.crawlSettings?.respectRobots ?? true,
        allowedPaths: website.crawlSettings?.allowedPaths || [],
        excludedPaths: website.crawlSettings?.excludedPaths || ['/admin', '/api', '/private'],
        userAgent: website.crawlSettings?.userAgent || 'RAG-Bot/1.0'
      },
      metadata: {
        industry: website.metadata?.industry || '',
        description: website.metadata?.description || '',
        tags: website.metadata?.tags || []
      },
      noDataResponse: website.noDataResponse || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteWebsite = async (brokerId) => {
    if (!confirm('Are you sure you want to delete this website? This will also delete all crawled content.')) {
      return;
    }

    try {
      await adminWebsitesAPI.delete(brokerId);
      await loadWebsites();
    } catch (err) {
      setError(err.error || 'Failed to delete website');
    }
  };

  const handleStartCrawl = async (brokerId) => {
    try {
      setError('');
      const response = await adminCrawlAPI.start(brokerId, {});
      setCrawlJobs(prev => ({
        ...prev,
        [brokerId]: response.data.jobId
      }));

      // Automatically show logs when crawl starts
      setShowLogs(prev => ({
        ...prev,
        [brokerId]: true
      }));

      pollCrawlStatus(response.data.jobId, brokerId);
    } catch (err) {
      setError(err.error || 'Failed to start crawl');
    }
  };

  const pollCrawlStatus = async (jobId, brokerId) => {
    const interval = setInterval(async () => {
      try {
        const response = await adminCrawlAPI.getStatus(jobId);
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
    return <Loading size="lg" message="Loading websites..." />;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe size={32} className="text-gray-900 dark:text-white" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-saira">My Websites</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage your websites and their crawling settings</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus size={16} />
          Add Website
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <form onSubmit={handleAddWebsite} className="flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 font-saira">
                {editingWebsite ? 'Edit Website' : 'Add New Website'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configure your website and crawler settings</p>
            </div>

            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-saira">Basic Information</h4>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website Name *</label>
                  <input
                    type="text"
                    placeholder="My Company Website"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Domain *</label>
                  <input
                    type="text"
                    placeholder="example.com"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base URL *</label>
                  <input
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Additional Domains */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-saira">Domains to Crawl</h4>
              <div className="flex flex-col gap-3">
                {formData.domains.map((domain, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Domain {index + 1} {index === 0 ? '(Main)' : ''}
                      </p>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeDomain(index)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://subdomain.example.com"
                      value={domain.url}
                      onChange={(e) => updateDomain(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDomain}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                >
                  <Plus size={16} />
                  Add Another Domain
                </button>
              </div>
            </div>

            {/* Crawler Settings */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-saira">Crawler Settings</h4>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Pages to Crawl</label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.crawlSettings.maxPages}
                      onChange={(e) => setFormData({
                        ...formData,
                        crawlSettings: { ...formData.crawlSettings, maxPages: parseInt(e.target.value) || 100 }
                      })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Crawl Delay (ms)</label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={formData.crawlSettings.crawlDelay}
                      onChange={(e) => setFormData({
                        ...formData,
                        crawlSettings: { ...formData.crawlSettings, crawlDelay: parseInt(e.target.value) || 1000 }
                      })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Agent</label>
                  <input
                    type="text"
                    value={formData.crawlSettings.userAgent}
                    onChange={(e) => setFormData({
                      ...formData,
                      crawlSettings: { ...formData.crawlSettings, userAgent: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.crawlSettings.respectRobots}
                    onChange={(e) => setFormData({
                      ...formData,
                      crawlSettings: { ...formData.crawlSettings, respectRobots: e.target.checked }
                    })}
                    className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Respect robots.txt</span>
                </label>

                {/* Allowed Paths */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Allowed Paths (leave empty to allow all)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="/blog, /products"
                      value={allowedPathInput}
                      onChange={(e) => setAllowedPathInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowedPath())}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={addAllowedPath}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.crawlSettings.allowedPaths.map((path, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs font-medium rounded-full"
                      >
                        {path}
                        <button
                          type="button"
                          onClick={() => removeAllowedPath(index)}
                          className="hover:text-primary-900 dark:hover:text-primary-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Excluded Paths */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Excluded Paths</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="/admin, /api, /private"
                      value={excludedPathInput}
                      onChange={(e) => setExcludedPathInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludedPath())}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={addExcludedPath}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.crawlSettings.excludedPaths.map((path, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full"
                      >
                        {path}
                        <button
                          type="button"
                          onClick={() => removeExcludedPath(index)}
                          className="hover:text-gray-900 dark:hover:text-gray-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-saira">Metadata & Settings</h4>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Finance, Healthcare"
                    value={formData.metadata.industry}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, industry: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Brief description of your website"
                    value={formData.metadata.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, description: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="hover:text-gray-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">No Data Response</label>
                  <textarea
                    placeholder="Custom message when no relevant data is found (optional)"
                    value={formData.noDataResponse}
                    onChange={(e) => setFormData({ ...formData, noDataResponse: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); resetForm(); }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {formLoading && <LoadingSpinner size="sm" />}
                {formLoading
                  ? (editingWebsite ? 'Updating...' : 'Adding...')
                  : (editingWebsite ? 'Update Website' : 'Add Website')
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Website List */}
      {websites.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <Globe size={48} className="text-gray-400 dark:text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-saira">No websites yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add your first website to start crawling and indexing content
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <Plus size={16} />
              Add Your First Website
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {websites.map((website) => (
            <div key={website.brokerId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white font-saira">{website.name}</h3>
                      {website.baseUrl && (
                        <a
                          href={website.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{website.domain || website.baseUrl}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(website)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      <Edit size={16} />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => handleStartCrawl(website.brokerId)}
                      disabled={!!crawlJobs[website.brokerId]}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                    >
                      {crawlJobs[website.brokerId] ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="text-sm font-medium">Crawling...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          <span className="text-sm font-medium">CRAWL</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteWebsite(website.brokerId)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg border border-red-200 dark:border-red-800 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Content Pages</p>
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-gray-600 dark:text-gray-400" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{website.contentCount || 0}</p>
                    </div>
                  </div>

                  {website.lastCrawl && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Crawled</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
                        <p className="text-sm text-gray-900 dark:text-white">{new Date(website.lastCrawl).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {website.metadata?.industry && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Industry</p>
                      <p className="text-sm text-gray-900 dark:text-white">{website.metadata.industry}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      website.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {website.status || 'active'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {website.metadata?.description && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{website.metadata.description}</p>
                  </div>
                )}

                {/* Crawl Log Viewer */}
                {showLogs[website.brokerId] && crawlJobs[website.brokerId] && (
                  <CrawlLogViewer
                    logsUrl={getAdminCrawlLogsUrl(crawlJobs[website.brokerId], token)}
                    onClose={() => setShowLogs(prev => ({ ...prev, [website.brokerId]: false }))}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
