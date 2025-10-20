import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientsAPI, crawlAPI } from '../api/clients';
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
      <div className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">Loading websites...</p>
      </div>
    );
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
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 font-saira">Add New Website</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your website details to start crawling and indexing content
            </p>
          </div>

          <form onSubmit={handleAddWebsite} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website Name *
              </label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain *
              </label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base URL *
              </label>
              <input
                type="url"
                placeholder="https://www.example.com"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry
              </label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="Brief description of your website"
                value={formData.metadata.description}
                onChange={(e) => setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, description: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {formLoading ? 'Adding...' : 'Add Website'}
              </button>
            </div>
          </form>
        </div>
      )}

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
                      onClick={() => handleStartCrawl(website.brokerId)}
                      disabled={!!crawlJobs[website.brokerId]}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                    >
                      <RefreshCw
                        size={16}
                        className={crawlJobs[website.brokerId] ? 'animate-spin' : ''}
                      />
                      {crawlJobs[website.brokerId] ? 'Crawling...' : 'Crawl'}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
