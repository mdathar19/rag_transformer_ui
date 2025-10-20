import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Terminal, X } from 'lucide-react';

export function CrawlLogViewer({ logsUrl, onClose }) {
  const [logs, setLogs] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const logsEndRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    if (!logsUrl) return;

    // Connect to SSE endpoint
    // The URL already includes the token as a query parameter
    const eventSource = new EventSource(logsUrl);

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('[LogViewer] Connected to log stream');
    };

    eventSource.onmessage = (event) => {
      try {
        const logEntry = JSON.parse(event.data);
        setLogs((prevLogs) => [...prevLogs, logEntry]);
      } catch (error) {
        console.error('[LogViewer] Error parsing log:', error);
      }
    };

    eventSource.addEventListener('close', () => {
      console.log('[LogViewer] Stream closed by server');
      setIsConnected(false);
      eventSource.close();
    });

    eventSource.onerror = (error) => {
      console.error('[LogViewer] SSE error:', error);
      setIsConnected(false);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [logsUrl]);

  const handleClose = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (onClose) {
      onClose();
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="mt-4 border border-gray-700 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-900">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-800 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-green-400" />
          <span className="text-sm font-medium text-gray-200">Crawl Logs</span>
          {isConnected && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live
            </span>
          )}
          <span className="text-xs text-gray-400">({logs.length} entries)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Log Content */}
      {isExpanded && (
        <div className="bg-black p-4 font-mono text-xs max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Waiting for logs...</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-gray-600 flex-shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`${getLogColor(log.level)} break-all`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
