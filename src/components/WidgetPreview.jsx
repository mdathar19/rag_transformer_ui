import { memo, useCallback, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

export const WidgetPreview = memo(function WidgetPreview({ settings }) {
  const [message, setMessage] = useState('');

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!message.trim()) return;
    // This is just a preview, we don't actually send messages
    setMessage('');
  }, [message]);

  const {
    enabled = true,
    greetingMessage = 'Hi! How can I help you today?',
    primaryColor = '#9333ea',
    widgetTitle = 'Chat Support',
    placeholderText = 'Type your message...'
  } = settings;

  if (!enabled) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Widget is currently disabled
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Chat Widget */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full max-w-md"
        style={{ height: '500px' }}
      >
        {/* Header */}
        <div
          className="p-4 text-white flex items-center gap-3"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="font-semibold">{widgetTitle}</p>
            <p className="text-xs opacity-90">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50" style={{ height: 'calc(500px - 140px)' }}>
          {/* Bot greeting */}
          <div className="flex gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
              <MessageCircle size={18} />
            </div>
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {greetingMessage}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-2">Just now</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholderText}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ '--tw-ring-color': primaryColor }}
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});
