import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userWebsitesAPI, userChatAPI } from '../../api/userAPI';
import { MarkdownText } from '../../components/MarkdownText';
import { Loading, LoadingSpinner } from '../../components/Loading';
import { MessageSquare, Send, Globe, User, Bot, ExternalLink, Trash2 } from 'lucide-react';

export function UserChat() {
  const { user } = useAuth();
  const [website, setWebsite] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingWebsite, setLoadingWebsite] = useState(true);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadWebsite();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadWebsite = async () => {
    try {
      setLoadingWebsite(true);
      const response = await userWebsitesAPI.list();
      const sites = response.data.clients || [];

      // User can only have one website now
      if (sites.length > 0) {
        setWebsite(sites[0]);
      }
    } catch (err) {
      console.error('Failed to load website:', err);
    } finally {
      setLoadingWebsite(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !website || loading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const botMessageId = `bot_${Date.now()}`;
    const botMessage = {
      id: botMessageId,
      type: 'bot',
      content: '',
      sources: [],
      timestamp: new Date(),
      loading: true,
    };

    setMessages(prev => [...prev, userMessage, botMessage]);

    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await userChatAPI.chat(website.brokerId, currentInput, sessionId);

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let sources = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'token') {
                fullContent += data.content;
                setMessages(prev => prev.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, content: fullContent, loading: false }
                    : msg
                ));
              } else if (data.type === 'done') {
                // Get sources from done event
                sources = data.sources || [];
                setMessages(prev => prev.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, content: fullContent, sources, loading: false }
                    : msg
                ));
              } else if (data.type === 'error') {
                throw new Error(data.content || 'Error occurred');
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => prev.map(msg =>
        msg.id === botMessageId
          ? {
              ...msg,
              type: 'error',
              content: err.message || 'Failed to get response. Please try again.',
              loading: false
            }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
    }
  };

  if (loadingWebsite) {
    return (
      <Loading size="lg" message="Loading your chats..." />
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
      <div className="flex flex-col gap-6 h-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-8 h-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat & Query</h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-gray-600 dark:text-gray-400">
                Ask questions about your website content
              </p>
              {website && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full border border-primary-200 dark:border-primary-800">
                  <Globe className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {website.name}
                  </span>
                  <span className="text-xs text-primary-600 dark:text-primary-400">
                    ({website.contentCount || 0} pages)
                  </span>
                </div>
              )}
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          )}
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          {!website ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <Globe className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No website found</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Please add a website first to start chatting about its content
              </p>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg">Start a conversation by asking a question below</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 items-start ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-primary-500 to-primary-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="max-w-[80%]">
                      <div className={`rounded-2xl px-5 py-3 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white ml-auto'
                          : message.type === 'error'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        {message.type === 'user' || message.type === 'error' ? (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {message.loading ? (
                              <div className="flex items-center gap-3">
                                 <LoadingSpinner size="md" />
                                <span className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">Thinking...</span>
                              </div>
                            ) : (
                              <MarkdownText content={message.content || 'Thinking...'} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Sources ({message.sources.length})
                          </p>
                          <div className="space-y-1">
                            {message.sources.map((source, i) => (
                              <a
                                key={i}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                              >
                                <ExternalLink className="w-3 h-3 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                  {source.title || source.url}
                                </span>
                                {source.score && (
                                  <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
                                    {(source.score * 100).toFixed(0)}%
                                  </span>
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your website..."
                    disabled={loading}
                    className="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary-500/30"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
