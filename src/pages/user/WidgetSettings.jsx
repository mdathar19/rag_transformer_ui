import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userWebsitesAPI, userWidgetAPI } from '../../api/userAPI';
import { Loading, LoadingSpinner } from '../../components/Loading';
import { WidgetPreview } from '../../components/WidgetPreview';
import {
  Code,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Save,
  Key
} from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

// Memoized color picker component
const ColorPicker = memo(function ColorPicker({ label, value, onChange, description }) {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={handleChange}
          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="#9333ea"
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
});

// Memoized script code display component
const ScriptCodeDisplay = memo(function ScriptCodeDisplay({ brokerId, baseUrl, apiKey }) {
  const [copied, setCopied] = useState(false);

  const scriptCode = useMemo(() => {
    return `<script>
(function(w, d, s, id) {
  w.RunItChat = w.RunItChat || function() {
    (w.RunItChat.q = w.RunItChat.q || []).push(arguments);
  };
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = '${baseUrl}/chat-widget.js';
  js.setAttribute('data-broker-id', '${brokerId}');
  js.setAttribute('data-api-key', '${apiKey || 'YOUR_API_KEY'}')
  fjs.parentNode.insertBefore(js, fjs);
}(window, document, 'script', 'runit-chat-widget'));
</script>`;
  }, [brokerId, baseUrl, apiKey]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [scriptCode]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="text-primary-600 dark:text-primary-400" size={24} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Embed Code</h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-sm"
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy Code
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Add this code snippet just before the closing <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag in your website HTML:
      </p>

      <div className="relative">
        <pre className="bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-gray-700">
          <code>{scriptCode}</code>
        </pre>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Make sure to save your widget settings before embedding the code. Changes to colors and messages will automatically reflect on your website.
        </p>
      </div>
    </div>
  );
});

export function WidgetSettings() {
  const { user } = useAuth();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Widget settings state
  const [settings, setSettings] = useState({
    enabled: true,
    greetingMessage: 'Hi! How can I help you today?',
    primaryColor: '#9333ea',
    secondaryColor: '#f3f4f6',
    textColor: '#ffffff',
    position: 'bottom-right',
    widgetTitle: 'Chat Support',
    placeholderText: 'Type your message...',
  });

  useEffect(() => {
    loadWebsiteAndSettings();
  }, []);

  const loadWebsiteAndSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Load website first
      const websiteResponse = await userWebsitesAPI.list();
      const sites = websiteResponse.data.clients || [];

      if (sites.length === 0) {
        setError('Please add a website first before configuring widget settings');
        setLoading(false);
        return;
      }

      const site = sites[0];
      setWebsite(site);

      // Load widget settings
      try {
        const settingsResponse = await userWidgetAPI.getSettings(site.brokerId);
        if (settingsResponse.data && settingsResponse.data.settings) {
          setSettings(prev => ({ ...prev, ...settingsResponse.data.settings }));
        }
      } catch (err) {
        // If settings don't exist yet, use defaults
        console.log('No existing widget settings, using defaults');
      }
      // Load API key
      try {
        const apiKeyResponse = await userWidgetAPI.getApiKey(site.brokerId);
        if (apiKeyResponse.data && apiKeyResponse.data.apiKey) {
          setApiKey(apiKeyResponse.data.apiKey);
        }
      } catch (err) {
        console.error('Failed to load API key:', err);
      }
    } catch (err) {
      console.error('Failed to load website:', err);
      setError(err.error || 'Failed to load website data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveSettings = useCallback(async () => {
    if (!website) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await userWidgetAPI.updateSettings(website.brokerId, settings);

      setSuccess('Widget settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.error || 'Failed to save widget settings');
    } finally {
      setSaving(false);
    }
  }, [website, settings]);

  const handleToggleEnabled = useCallback((checked) => {
    setSettings(prev => ({ ...prev, enabled: checked }));
  }, []);

  const handleGreetingChange = useCallback((e) => {
    setSettings(prev => ({ ...prev, greetingMessage: e.target.value }));
  }, []);

  const handleTitleChange = useCallback((e) => {
    setSettings(prev => ({ ...prev, widgetTitle: e.target.value }));
  }, []);

  const handlePlaceholderChange = useCallback((e) => {
    setSettings(prev => ({ ...prev, placeholderText: e.target.value }));
  }, []);

  const handlePrimaryColorChange = useCallback((value) => {
    setSettings(prev => ({ ...prev, primaryColor: value }));
  }, []);

  const handlePositionChange = useCallback((e) => {
    setSettings(prev => ({ ...prev, position: e.target.value }));
  }, []);

  const baseUrl = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://brain.runit.in';
  }, []);

  if (loading) {
    return <Loading size="lg" message="Loading widget settings..." />;
  }

  if (!website) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Code size={32} className="text-gray-900 dark:text-white" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-saira">Widget Settings</h2>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">No Website Found</p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              {error || 'Please add a website first before configuring widget settings.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Code size={32} className="text-gray-900 dark:text-white" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-saira">Widget Settings</h2>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
          <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Settings</h3>

            <div className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Widget
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Turn the chat widget on or off for your website
                  </p>
                </div>
                <Switch.Root
                  checked={settings.enabled}
                  onCheckedChange={handleToggleEnabled}
                  className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-primary-600 transition-colors outline-none cursor-pointer"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>

              {/* Widget Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={settings.widgetTitle}
                  onChange={handleTitleChange}
                  placeholder="Chat Support"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Greeting Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Greeting Message
                </label>
                <textarea
                  value={settings.greetingMessage}
                  onChange={handleGreetingChange}
                  placeholder="Hi! How can I help you today?"
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Placeholder Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={settings.placeholderText}
                  onChange={handlePlaceholderChange}
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Widget Position
                </label>
                <select
                  value={settings.position}
                  onChange={handlePositionChange}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appearance</h3>

            <div className="space-y-4">
              <ColorPicker
                label="Primary Color"
                description="Main widget color for header and buttons"
                value={settings.primaryColor}
                onChange={handlePrimaryColorChange}
              />
            </div>
          </div>

          {/* Widget Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Real-time Preview</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Changes you make here will be reflected in the preview on the right. Click the chat button in the preview to see how it works.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="text-primary-600 dark:text-primary-400" size={24} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h3>
            </div>

            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <WidgetPreview settings={settings} />
            </div>
          </div>
        </div>
      </div>


      {/* API Key Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="text-primary-600 dark:text-primary-400" size={24} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Widget API Key</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This API key is required for your widget to function. It is automatically included in the embed code below. Keep it secure.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={apiKey || 'Loading...'}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
          />
          <button
            onClick={() => {
              if (apiKey) {
                navigator.clipboard.writeText(apiKey);
                setSuccess('API key copied to clipboard');
                setTimeout(() => setSuccess(''), 2000);
              }
            }}
            disabled={!apiKey}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Copy size={16} />
            Copy
          </button>
        </div>
      </div>

      {/* Embed Code Section */}
      <ScriptCodeDisplay brokerId={website.brokerId} baseUrl={baseUrl} apiKey={apiKey} />
    </div>
  );
}
