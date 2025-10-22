import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { userWebsitesAPI } from '../../api/userAPI';
import { Loading, LoadingSpinner } from '../../components/Loading';
import {
  ArrowLeft,
  Globe,
  Plus,
  Trash2,
  AlertCircle,
  Save,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';

export function WebsiteDetails() {
  const { brokerId } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initialDomainCount, setInitialDomainCount] = useState(0);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      domains: []
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'domains'
  });

  useEffect(() => {
    fetchWebsite();
  }, [brokerId]);

  const fetchWebsite = async () => {
    try {
      setLoading(true);
      setError('');

      // Use dedicated endpoint to get single website
      const response = await userWebsitesAPI.get(brokerId);
      const siteData = response.data;

      if (!siteData) {
        setError('Website not found');
        return;
      }

      setWebsite(siteData);

      // Map existing domains to form format
      const existingDomains = siteData.domains && siteData.domains.length > 0
        ? siteData.domains.map(domain => ({
            url: domain.url || '',
            type: domain.type || 'subdomain',
            specificPages: domain.specificPages || [],
            crawlSettings: {
              maxPages: domain.crawlSettings?.maxPages || 100,
              allowedPaths: domain.crawlSettings?.allowedPaths || [],
              excludedPaths: domain.crawlSettings?.excludedPaths || []
            }
          }))
        : [];

      // Update form fields
      replace(existingDomains);
      setInitialDomainCount(existingDomains.length);

    } catch (err) {
      console.error('Failed to fetch website:', err);
      setError(err.error || err.message || 'Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Update website with new domains
      await userWebsitesAPI.update(brokerId, {
        domains: data.domains
      });

      const newDomainsAdded = data.domains.length - initialDomainCount;
      if (newDomainsAdded > 0) {
        setSuccess(`✓ Successfully saved! Added ${newDomainsAdded} new domain(s). Total: ${data.domains.length} domain(s).`);
      } else if (newDomainsAdded < 0) {
        setSuccess(`✓ Successfully saved! Removed ${Math.abs(newDomainsAdded)} domain(s). Total: ${data.domains.length} domain(s).`);
      } else {
        setSuccess(`✓ Successfully updated ${data.domains.length} domain(s)!`);
      }

      await fetchWebsite();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.error || err.message || 'Failed to update subdomains');
    } finally {
      setSaving(false);
    }
  };

  const addDomain = () => {
    append({
      url: '',
      type: 'subdomain',
      specificPages: [],
      crawlSettings: {
        maxPages: 100,
        allowedPaths: [],
        excludedPaths: []
      }
    });
  };

  if (loading) {
    return <Loading size="lg" message="Loading website details..." />;
  }

  if (!website) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">{error || 'Website not found'}</p>
        <button
          onClick={() => navigate('/user/dashboard/websites')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          Back to Websites
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/user/dashboard/websites')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={20} />
          Back to Websites
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{website.name}</h1>
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
          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
        >
          {website.domain}
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
          <AlertCircle size={18} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Website Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pages Indexed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {website.contentCount || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Crawled</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {website.lastCrawl
              ? new Date(website.lastCrawl).toLocaleDateString()
              : 'Never'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subdomains</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {fields.length}
          </p>
        </div>
      </div>

      {/* Subdomain Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Subdomains & Additional URLs
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({fields.length} {fields.length === 1 ? 'domain' : 'domains'})
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={addDomain}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Subdomain
          </button>
        </div>

        {initialDomainCount > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>✓ {initialDomainCount} existing domain{initialDomainCount > 1 ? 's' : ''} loaded.</strong> You can edit existing domains or add new ones below.
              Domains marked with <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full mx-1">Existing</span> are already saved.
            </p>
          </div>
        )}
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>💡 Tip:</strong> Add subdomains, marketing sites, or documentation sites that you want to crawl along with your main website.
            Each domain can have its own crawl settings.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {loading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading subdomains...</p>
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Globe size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No subdomains added yet. Click "Add Subdomain" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {fields.map((field, index) => {
                const isExisting = index < initialDomainCount;
                return (
                  <div
                    key={field.id}
                    className={`border rounded-lg p-4 ${
                      isExisting
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Domain {index + 1}
                        </h3>
                        {isExisting && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                            Existing
                          </span>
                        )}
                        {!isExisting && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                        title="Remove domain"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        URL *
                      </label>
                      <input
                        {...register(`domains.${index}.url`, { required: 'URL is required' })}
                        type="text"
                        placeholder="https://docs.example.com"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {errors.domains?.[index]?.url && (
                        <p className="mt-1 text-sm text-red-600">{errors.domains[index].url.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        {...register(`domains.${index}.type`)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="main">Main</option>
                        <option value="subdomain">Subdomain</option>
                        <option value="marketing">Marketing Site</option>
                        <option value="documentation">Documentation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Pages
                      </label>
                      <input
                        {...register(`domains.${index}.crawlSettings.maxPages`, { valueAsNumber: true })}
                        type="number"
                        defaultValue={100}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {fields.length > 0 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/user/dashboard/websites')}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {saving && <LoadingSpinner size="sm" />}
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Subdomains'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
