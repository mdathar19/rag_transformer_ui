import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { userWebsitesAPI, userCrawlAPI, getUserCrawlLogsUrl } from '../../api/userAPI';
import { Loading, LoadingSpinner } from '../../components/Loading';
import { CrawlLogViewer } from '../../components/CrawlLogViewer';
import {
  Globe,
  Plus,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  X,
  Save
} from 'lucide-react';

export function UserWebsites() {
  const { token } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [crawlJobs, setCrawlJobs] = useState({});
  const [showLogs, setShowLogs] = useState({});

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      domain: '',
      metadata: {
        description: '',
        industry: '',
        tags: []
      },
      crawlSettings: {
        maxPages: 100,
        crawlDelay: 1000,
        respectRobots: true,
        allowedPaths: [],
        excludedPaths: ['/admin', '/api', '/private'],
        userAgent: 'RAG-Bot/1.0'
      }
    }
  });

  const { fields: allowedPathsFields, append: appendAllowedPath, remove: removeAllowedPath } = useFieldArray({
    control,
    name: 'crawlSettings.allowedPaths'
  });

  const { fields: excludedPathsFields, append: appendExcludedPath, remove: removeExcludedPath } = useFieldArray({
    control,
    name: 'crawlSettings.excludedPaths'
  });

  const { fields: tagsFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'metadata.tags'
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await userWebsitesAPI.list();
      setWebsites(response.data.clients || []);
      setError('');
    } catch (err) {
      setError(err.error || 'Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setError('');

    try {
      if (editingWebsite) {
        // Update existing website
        await userWebsitesAPI.update(editingWebsite.brokerId, data);
      } else {
        // Create new website
        await userWebsitesAPI.create(data);
      }

      await fetchWebsites();
      handleCloseForm();
    } catch (err) {
      setError(err.error || `Failed to ${editingWebsite ? 'update' : 'add'} website`);
    }
  };

  const handleEdit = (website) => {
    setEditingWebsite(website);
    reset({
      name: website.name,
      domain: website.domain,
      metadata: {
        description: website.metadata?.description || '',
        industry: website.metadata?.industry || '',
        tags: website.metadata?.tags || []
      },
      crawlSettings: {
        maxPages: website.crawlSettings?.maxPages || 100,
        crawlDelay: website.crawlSettings?.crawlDelay || 1000,
        respectRobots: website.crawlSettings?.respectRobots !== false,
        allowedPaths: website.crawlSettings?.allowedPaths || [],
        excludedPaths: website.crawlSettings?.excludedPaths || ['/admin', '/api', '/private'],
        userAgent: website.crawlSettings?.userAgent || 'RAG-Bot/1.0'
      }
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingWebsite(null);
    reset();
  };

  const handleCrawl = async (brokerId) => {
    try {
      const response = await userCrawlAPI.start(brokerId, {});

      const jobId = response.data.jobId;
      setCrawlJobs({ ...crawlJobs, [brokerId]: jobId });

      // Automatically show logs when crawl starts
      setShowLogs({ ...showLogs, [brokerId]: true });

      const pollStatus = setInterval(async () => {
        try {
          const statusResponse = await userCrawlAPI.getStatus(jobId);
          const status = statusResponse.data.status;

          if (status === 'completed' || status === 'failed') {
            clearInterval(pollStatus);
            setCrawlJobs((prev) => {
              const updated = { ...prev };
              delete updated[brokerId];
              return updated;
            });
            await fetchWebsites();
          }
        } catch (err) {
          clearInterval(pollStatus);
          setCrawlJobs((prev) => {
            const updated = { ...prev };
            delete updated[brokerId];
            return updated;
          });
        }
      }, 3000);
    } catch (err) {
      setError(err.error || 'Failed to start crawl');
      setCrawlJobs((prev) => {
        const updated = { ...prev };
        delete updated[brokerId];
        return updated;
      });
    }
  };

  const handleDelete = async (brokerId) => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    try {
      await userWebsitesAPI.delete(brokerId);
      await fetchWebsites();
    } catch (err) {
      setError(err.error || 'Failed to delete website');
    }
  };

  if (loading) {
    return <Loading size="lg" message="Loading your websites..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe size={32} className="text-gray-900 dark:text-white" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-saira">My Websites</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Website
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingWebsite ? 'Edit Website' : 'Add New Website'}
            </h3>
            <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Basic Information</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website Name *
                </label>
                <input
                  {...register('name', { required: 'Website name is required' })}
                  type="text"
                  placeholder="My Company Website"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Domain/URL *
                </label>
                <input
                  {...register('domain', { required: 'Domain is required' })}
                  type="text"
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.domain && <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white">Metadata</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  {...register('metadata.description')}
                  placeholder="Brief description of this website"
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Industry
                </label>
                <input
                  {...register('metadata.industry')}
                  type="text"
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                {tagsFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input
                      {...register(`metadata.tags.${index}`)}
                      type="text"
                      placeholder="Tag name"
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendTag('')}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            {/* Crawl Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white">Crawl Settings</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Pages
                  </label>
                  <input
                    {...register('crawlSettings.maxPages', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Crawl Delay (ms)
                  </label>
                  <input
                    {...register('crawlSettings.crawlDelay', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Agent
                </label>
                <input
                  {...register('crawlSettings.userAgent')}
                  type="text"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    {...register('crawlSettings.respectRobots')}
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Respect robots.txt
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allowed Paths
                </label>
                {allowedPathsFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input
                      {...register(`crawlSettings.allowedPaths.${index}`)}
                      type="text"
                      placeholder="/blog, /products"
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeAllowedPath(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendAllowedPath('')}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  + Add Allowed Path
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excluded Paths
                </label>
                {excludedPathsFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <input
                      {...register(`crawlSettings.excludedPaths.${index}`)}
                      type="text"
                      placeholder="/admin, /api"
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeExcludedPath(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendExcludedPath('')}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  + Add Excluded Path
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseForm}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {isSubmitting && <LoadingSpinner size="sm" />}
                {isSubmitting ? (editingWebsite ? 'Updating...' : 'Adding...') : (editingWebsite ? 'Update Website' : 'Add Website')}
              </button>
            </div>
          </form>
        </div>
      )}

      {websites.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Globe size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No websites yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add your first website to get started with AI-powered content indexing
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Your First Website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {websites.map((website) => (
            <div
              key={website.brokerId}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {website.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        website.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {website.status}
                    </span>
                  </div>
                  <a
                    href={website.domain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {website.domain}
                    <ExternalLink size={14} />
                  </a>
                  {website.metadata?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {website.metadata.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(website)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit website"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleCrawl(website.brokerId)}
                    disabled={!!crawlJobs[website.brokerId]}
                    className="px-3 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Crawl website"
                  >
                    {crawlJobs[website.brokerId] ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="text-sm font-medium">Crawling...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} />
                        <span className="text-sm font-medium">CRAWL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(website.brokerId)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete website"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pages Indexed</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {website.contentCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Crawled</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {website.lastCrawl
                      ? new Date(website.lastCrawl).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Industry</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {website.metadata?.industry || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Crawl Log Viewer */}
              {showLogs[website.brokerId] && crawlJobs[website.brokerId] && (
                <CrawlLogViewer
                  logsUrl={getUserCrawlLogsUrl(crawlJobs[website.brokerId], token)}
                  onClose={() => setShowLogs({ ...showLogs, [website.brokerId]: false })}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
