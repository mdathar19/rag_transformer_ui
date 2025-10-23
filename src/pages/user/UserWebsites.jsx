import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userWebsitesAPI, userCrawlAPI, getUserCrawlLogsUrl } from '../../api/userAPI';
import { Loading, LoadingSpinner } from '../../components/Loading';
import { CrawlLogViewer } from '../../components/CrawlLogViewer';
import * as Dialog from '@radix-ui/react-dialog';
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
  Save,
  ChevronRight
} from 'lucide-react';

export function UserWebsites() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [crawlJobs, setCrawlJobs] = useState({});
  const [showLogs, setShowLogs] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);
  const [crawlDialogOpen, setCrawlDialogOpen] = useState(false);
  const [websiteToCrawl, setWebsiteToCrawl] = useState(null);

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

  const handleCrawlClick = (brokerId) => {
    const website = websites.find(w => w.brokerId === brokerId);
    setWebsiteToCrawl(website);
    setCrawlDialogOpen(true);
  };

  const handleCrawlConfirm = async () => {
    setCrawlDialogOpen(false);
    const brokerId = websiteToCrawl.brokerId;

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

  const handleDeleteClick = (brokerId) => {
    const website = websites.find(w => w.brokerId === brokerId);
    setWebsiteToDelete(website);
    setDeleteConfirmStep(1);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmStep === 1) {
      // Move to second confirmation
      setDeleteConfirmStep(2);
      return;
    }

    // Final deletion
    try {
      await userWebsitesAPI.delete(websiteToDelete.brokerId);
      await fetchWebsites();
      setError(''); // Clear any errors
      setDeleteDialogOpen(false);
      setWebsiteToDelete(null);
      setDeleteConfirmStep(1);
    } catch (err) {
      setError(err.error || 'Failed to delete website');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setWebsiteToDelete(null);
    setDeleteConfirmStep(1);
  };

  if (loading) {
    return <Loading size="lg" message="Loading your websites..." />;
  }

  // Get the single website (users can only have one)
  const website = websites.length > 0 ? websites[0] : null;
  const hasWebsite = website !== null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe size={32} className="text-gray-900 dark:text-white" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-saira">My Website</h2>
        </div>
        {!hasWebsite && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Website
          </button>
        )}
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
                {!editingWebsite && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        <p className="font-semibold mb-1">Important: robots.txt Required</p>
                        <p className="text-xs">
                          Your website must have a <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">robots.txt</code> file
                          for successful crawling. The crawler respects robots.txt directives.
                          <a href="https://www.robotstxt.org/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                            Learn more
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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

      {!hasWebsite ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Globe size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No website yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add your website to get started with AI-powered content indexing
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Your Website
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Crawl Warning Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">When to Crawl Your Website</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Only crawl when your website content has changed (new pages, updated content, or modified subdomains).
                  Crawling an unchanged website will not update any data and wastes resources.
                </p>
              </div>
            </div>
          </div>

          {/* Website Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {website.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                  className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline mb-2"
                >
                  {website.domain}
                  <ExternalLink size={16} />
                </a>
                {website.metadata?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
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
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleCrawlClick(website.brokerId)}
                  disabled={!!crawlJobs[website.brokerId]}
                  className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Crawl website"
                >
                  {crawlJobs[website.brokerId] ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="text-sm font-medium">Crawling...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={20} />
                      <span className="text-sm font-medium">CRAWL</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteClick(website.brokerId)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete website"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pages Indexed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {website.contentCount || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Embeddings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {website.usage?.embeddingsGenerated || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Crawled</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {website.lastCrawl
                    ? new Date(website.lastCrawl).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Industry</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {website.metadata?.industry || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Subdomains Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={24} className="text-primary-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Domains & Subdomains
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({website.domains?.length || 0} {website.domains?.length === 1 ? 'domain' : 'domains'})
                  </span>
                </h3>
              </div>
              <button
                onClick={() => navigate(`/user/dashboard/websites/${website.brokerId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus size={18} />
                Manage Subdomains
              </button>
            </div>

            {website.domains && website.domains.length > 0 ? (
              <div className="space-y-3">
                {website.domains.map((domain, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-gray-400" />
                      <div>
                        <a
                          href={domain.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                          {domain.url}
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Type: {domain.type} • Max Pages: {domain.crawlSettings?.maxPages || 100}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                      {domain.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Globe size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No subdomains added yet
                </p>
                <button
                  onClick={() => navigate(`/user/dashboard/websites/${website.brokerId}`)}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Add your first subdomain →
                </button>
              </div>
            )}
          </div>

          {/* Crawl Log Viewer */}
          {showLogs[website.brokerId] && crawlJobs[website.brokerId] && (
            <CrawlLogViewer
              logsUrl={getUserCrawlLogsUrl(crawlJobs[website.brokerId], token)}
              onClose={() => setShowLogs({ ...showLogs, [website.brokerId]: false })}
            />
          )}
        </div>
      )}

      {/* Crawl Confirmation Dialog */}
      <Dialog.Root open={crawlDialogOpen} onOpenChange={setCrawlDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <RefreshCw className="text-primary-600 dark:text-primary-400" size={24} />
              Start Crawl?
            </Dialog.Title>

            <Dialog.Description className="text-gray-700 dark:text-gray-300 mb-6 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  ⚠️ Important: Data will be refreshed
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>💡 When to Crawl:</strong> Only crawl when your website content has changed.
                  Crawling with no changes on your website will not update any data and wastes resources.
                  Crawl after adding new pages, updating content, or modifying subdomains.
                </p>
              </div>

              <div>
                <p className="mb-2 text-gray-900 dark:text-white">
                  Starting a new crawl will <strong>DELETE all existing indexed pages</strong> for this website and re-index from scratch.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-1 text-sm">
                  <p><strong>Website:</strong> {websiteToCrawl?.name}</p>
                  <p><strong>Current Pages:</strong> {websiteToCrawl?.contentCount || 0}</p>
                  <p><strong>Domains to crawl:</strong> {websiteToCrawl?.domains?.length || 0}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                This is useful when you've changed domains/subdomains or need fresh data.
              </p>
            </Dialog.Description>

            <div className="flex gap-3">
              <button
                onClick={() => setCrawlDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCrawlConfirm}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Start Crawl
              </button>
            </div>

            <Dialog.Close asChild>
              <button
                onClick={() => setCrawlDialogOpen(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              {deleteConfirmStep === 1 ? 'Delete Website?' : 'Final Confirmation'}
            </Dialog.Title>

            {deleteConfirmStep === 1 ? (
              <>
                <Dialog.Description className="text-gray-700 dark:text-gray-300 mb-6 space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="font-semibold text-red-900 dark:text-red-200 mb-2">
                      ⚠️ WARNING: This action CANNOT be undone!
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2 text-gray-900 dark:text-white">You are about to permanently delete:</p>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-1 text-sm">
                      <p><strong>Website:</strong> {websiteToDelete?.name}</p>
                      <p><strong>Domain:</strong> {websiteToDelete?.domain}</p>
                      <p><strong>Subdomains:</strong> {websiteToDelete?.domains?.length || 0}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2 text-gray-900 dark:text-white">This will also DELETE:</p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400">•</span>
                        All <strong>{websiteToDelete?.contentCount || 0}</strong> indexed pages
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400">•</span>
                        All <strong>{websiteToDelete?.usage?.embeddingsGenerated || 0}</strong> embeddings
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400">•</span>
                        All crawl history and logs
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400">•</span>
                        All query history
                      </li>
                    </ul>
                  </div>
                </Dialog.Description>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <Dialog.Description className="text-gray-700 dark:text-gray-300 mb-6 space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="font-semibold text-red-900 dark:text-red-200 mb-2 text-center text-lg">
                      ⚠️ FINAL CONFIRMATION
                    </p>
                  </div>

                  <p className="text-center text-gray-900 dark:text-white">
                    You are about to permanently delete
                  </p>
                  <p className="text-center text-xl font-bold text-red-600 dark:text-red-400">
                    "{websiteToDelete?.name}"
                  </p>
                  <p className="text-center text-gray-700 dark:text-gray-300 text-sm">
                    This is your last chance to cancel!
                  </p>
                </Dialog.Description>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete Forever
                  </button>
                </div>
              </>
            )}

            <Dialog.Close asChild>
              <button
                onClick={handleDeleteCancel}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
