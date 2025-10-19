import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clientsAPI, queryAPI } from '../api/clients';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Input } from '../components/primitives/Input';
import { Label } from '../components/primitives/Label';
import { MarkdownText } from '../components/MarkdownText';
import { MessageSquare, Send, Globe, Loader2, User, Bot, ExternalLink } from 'lucide-react';

export function Chat() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadWebsites();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadWebsites = async () => {
    try {
      const response = await clientsAPI.list();
      const sites = response.data.clients || [];
      setWebsites(sites);

      // Auto-select first website with content
      const siteWithContent = sites.find(s => s.contentCount > 0);
      if (siteWithContent) {
        setSelectedWebsite(siteWithContent.brokerId);
      }
    } catch (err) {
      console.error('Failed to load websites:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || !selectedWebsite) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    // Create placeholder for bot message
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      type: 'bot',
      content: '',
      sources: [],
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          brokerId: selectedWebsite,
          query: currentInput,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

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
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              } else if (data.type === 'sources') {
                sources = data.sources || [];
                setMessages(prev => prev.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, sources: sources }
                    : msg
                ));
              } else if (data.type === 'done') {
                // Final message
                setMessages(prev => prev.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, content: fullContent, sources: sources }
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
              content: err.message || 'Failed to get response. Please try again.'
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

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1200px', height: 'calc(100vh - 120px)' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 'var(--spacing-lg)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--spacing-xs)' }}>
              <MessageSquare size={32} style={{ display: 'inline', marginRight: 'var(--spacing-sm)', verticalAlign: 'middle' }} />
              Chat & Query
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Ask questions about your website content
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs)' }}>
              <Label htmlFor="website-select" style={{ fontSize: '0.75rem' }}>Select Website</Label>
              <select
                id="website-select"
                value={selectedWebsite}
                onChange={(e) => {
                  setSelectedWebsite(e.target.value);
                  setMessages([]);
                }}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  minWidth: '200px'
                }}
              >
                <option value="">Choose a website...</option>
                {websites.map(site => (
                  <option key={site.brokerId} value={site.brokerId}>
                    {site.name} ({site.contentCount || 0} pages)
                  </option>
                ))}
              </select>
            </div>

            {messages.length > 0 && (
              <Button variant="outline" onClick={handleClearChat}>
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CardContent style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden'
          }}>
            {!selectedWebsite ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-2xl)',
                textAlign: 'center'
              }}>
                <Globe size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-sm)' }}>
                  Select a website to start
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Choose a website from the dropdown above to ask questions about its content
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 'var(--spacing-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-lg)'
                }}>
                  {messages.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: 'var(--spacing-2xl)',
                      color: 'var(--text-muted)'
                    }}>
                      <MessageSquare size={48} style={{ marginBottom: 'var(--spacing-lg)', opacity: 0.5 }} />
                      <p>Start a conversation by asking a question below</p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        gap: 'var(--spacing-md)',
                        alignItems: 'flex-start',
                        ...(message.type === 'user' ? { flexDirection: 'row-reverse' } : {})
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: message.type === 'user' ? 'var(--purple-gradient)' : 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {message.type === 'user' ? (
                          <User size={18} color="white" />
                        ) : (
                          <Bot size={18} color="var(--text-primary)" />
                        )}
                      </div>

                      <div style={{
                        flex: 1,
                        maxWidth: '80%',
                        ...(message.type === 'user' ? { textAlign: 'right' } : {})
                      }}>
                        <div style={{
                          padding: 'var(--spacing-md)',
                          borderRadius: 'var(--border-radius-md)',
                          background: message.type === 'user'
                            ? 'var(--purple-gradient)'
                            : message.type === 'error'
                            ? '#fee'
                            : 'var(--bg-tertiary)',
                          color: message.type === 'user' ? 'white' : message.type === 'error' ? '#c00' : 'var(--text-primary)',
                          display: 'inline-block',
                          textAlign: 'left',
                          wordBreak: 'break-word'
                        }}>
                          {message.type === 'user' || message.type === 'error' ? (
                            message.content
                          ) : (
                            <MarkdownText content={message.content} />
                          )}
                        </div>

                        {message.sources && message.sources.length > 0 && (
                          <div style={{
                            marginTop: 'var(--spacing-md)',
                            padding: 'var(--spacing-sm)',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid var(--border-color)'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: 'var(--text-muted)',
                              marginBottom: 'var(--spacing-xs)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Sources ({message.sources.length})
                            </div>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 'var(--spacing-xs)'
                            }}>
                              {message.sources.map((source, i) => (
                                <a
                                  key={i}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-xs)',
                                    color: 'var(--purple-600)',
                                    textDecoration: 'none',
                                    fontSize: '0.8125rem',
                                    padding: 'var(--spacing-xs)',
                                    borderRadius: 'var(--border-radius-sm)',
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                >
                                  <ExternalLink size={12} />
                                  <span style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {source.title || source.url}
                                  </span>
                                  {source.score && (
                                    <span style={{
                                      fontSize: '0.625rem',
                                      color: 'var(--text-muted)',
                                      background: 'var(--bg-primary)',
                                      padding: '2px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      {(source.score * 100).toFixed(0)}%
                                    </span>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{
                          marginTop: 'var(--spacing-xs)',
                          fontSize: '0.625rem',
                          color: 'var(--text-muted)'
                        }}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div style={{
                      display: 'flex',
                      gap: 'var(--spacing-md)',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Bot size={18} />
                      </div>
                      <div style={{ padding: 'var(--spacing-md)' }}>
                        <Loader2 size={20} className="spin" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: 'var(--spacing-md)'
                  }}
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your website..."
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  <Button type="submit" disabled={loading || !input.trim()}>
                    <Send size={16} />
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
