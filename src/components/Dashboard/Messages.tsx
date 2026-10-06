import { Fragment, useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faPhone,
  faVideo,
  faEllipsisVertical,
  faFaceSmile,
  faPaperclip,
  faImage,
  faPaperPlane,
  faDownload,
  faFilePdf,
  faCheck,
  faCheckDouble,
  faCircleInfo,
  faDroplet,
} from '@fortawesome/free-solid-svg-icons';
import './Messages.scss';
import AppSpinner from '../AppSpinner/AppSpinner';
import { fetchConversations, getAutoReplies } from '../../api/services';
import { useAuth } from '../../context/AuthContext';




// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPreview = (msg) =>
  msg.type === 'file' ? `📎 ${msg.fileName}` : msg.text;

// ── Sub-components ────────────────────────────────────────────────────────────
const Avatar = ({ conv, size = 44 }) => (
  <div
    className="msg-avatar"
    style={{ width: size, height: size, background: conv.avatarColor }}
    aria-hidden="true"
  >
    {conv.isGroup
      ? <FontAwesomeIcon icon={faDroplet} style={{ fontSize: size * 0.4 }} />
      : conv.initials}
    {conv.online && <span className="msg-avatar__dot" />}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Messages = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId]           = useState(null);
  const [inputText, setInputText]         = useState('');
  const [isTyping, setIsTyping]           = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(true);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const messagesEndRef  = useRef(null);
  const inputRef        = useRef(null);
  const typingTimerRef  = useRef(null);
  const socketRef       = useRef<WebSocket | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchConversations();
      setConversations(data);
      setActiveId(data[0]?.id ?? null);
      setLoading(false);
    };
    load();
  }, []);

  // WebSocket Live Connection (Django Channels / Daphne)
  useEffect(() => {
    if (!activeId) return;
    const roomName = String(activeId).replace(/[^a-zA-Z0-9]/g, '_');
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProto}//127.0.0.1:8000/ws/chat/${roomName}/`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
      };

      ws.onclose = () => {
        setIsWsConnected(false);
      };

      ws.onerror = () => {
        setIsWsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const currentSender = currentUser?.fullName || 'me';
          if (payload.sender && payload.sender !== currentSender) {
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const incomingMsg = {
              id: `ws-${Date.now()}`,
              from: 'them',
              type: 'text',
              text: payload.message,
              time: timeStr,
              read: true,
            };
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeId
                  ? { ...c, messages: [...c.messages, incomingMsg], lastMessage: payload.message, timestamp: timeStr }
                  : c
              )
            );
          }
        } catch (e) {
          console.error('WS message error', e);
        }
      };
    } catch (e) {
      console.warn('WS initialization error', e);
      setIsWsConnected(false);
    }

    return () => {
      if (ws) {
        ws.close();
      }
      setIsWsConnected(false);
    };
  }, [activeId, currentUser?.fullName]);

  const activeConv = conversations.find((c) => c.id === activeId);

  // Scroll to bottom whenever messages change or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, activeConv?.messages.length, isTyping]);

  // Auto-focus input when switching chats
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: `m${Date.now()}`,
      from: 'me',
      type: 'text',
      text,
      time: timeStr,
      read: false,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, timestamp: timeStr }
          : c
      )
    );
    setInputText('');

    // Broadcast over WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        message: text,
        sender: currentUser?.fullName || 'me'
      }));
    } else {
      // Local fallback auto-reply when offline
      clearTimeout(typingTimerRef.current);
      setIsTyping(true);
      typingTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        const replies = getAutoReplies(activeId);
        const reply   = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg = {
          id: `m${Date.now() + 1}`,
          from: 'them',
          type: 'text',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: true,
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, messages: [...c.messages, replyMsg], lastMessage: reply }
              : c
          )
        );
      }, 1800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading || !activeConv) {
    return (
      <div className="messages-screen">
        <AppSpinner label="Loading conversations..." />
      </div>
    );
  }

  return (
    <div className="messages-screen">

      {/* ══ LEFT PANEL ══════════════════════════════════════════════════════ */}
      <aside className="msg-sidebar" aria-label="Recent chats">

        <div className="msg-sidebar__header">
          <h2 className="msg-sidebar__title">Recent Chats</h2>
          <button className="msg-sidebar__compose" type="button" aria-label="New chat">
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </div>

        <div className="msg-sidebar__search-wrap">
          <input
            className="msg-sidebar__search"
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversations"
          />
        </div>

        <ul className="msg-conv-list" role="list">
          {filteredConvs.map((conv) => (
            <li key={conv.id}>
              <button
                type="button"
                className={`msg-conv-item${activeId === conv.id ? ' msg-conv-item--active' : ''}`}
                onClick={() => setActiveId(conv.id)}
                aria-current={activeId === conv.id ? 'true' : undefined}
              >
                <Avatar conv={conv} size={46} />
                <div className="msg-conv-item__body">
                  <div className="msg-conv-item__top">
                    <span className="msg-conv-item__name">{conv.name}</span>
                    <span className="msg-conv-item__time">{conv.timestamp}</span>
                  </div>
                  <div className="msg-conv-item__bottom">
                    <span className="msg-conv-item__preview">
                      {formatPreview(conv.messages.at(-1))}
                    </span>
                    {conv.urgent && (
                      <span className="msg-conv-item__urgent">URGENT</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════════════════ */}
      <div className="msg-chat">

        {/* Chat Header */}
        <header className="msg-chat__header">
          <div className="msg-chat__header-info">
            <Avatar conv={activeConv} size={42} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p className="msg-chat__name" style={{ margin: 0 }}>{activeConv.name}</p>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: isWsConnected ? '#dcfce7' : '#f1f5f9',
                  color: isWsConnected ? '#166534' : '#64748b',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isWsConnected ? '#22c55e' : '#94a3b8' }} />
                  {isWsConnected ? 'Daphne Live' : 'Offline'}
                </span>
              </div>
              <p className="msg-chat__role">
                {activeConv.online && (
                  <span className="msg-chat__online-dot" aria-hidden="true" />
                )}
                {activeConv.online ? 'Online' : 'Offline'}
                {activeConv.role && <span> &bull; {activeConv.role}</span>}
              </p>
            </div>
          </div>
          <div className="msg-chat__header-actions">
            <button type="button" className="msg-chat__icon-btn" aria-label="Voice call">
              <FontAwesomeIcon icon={faPhone} />
            </button>
            <button type="button" className="msg-chat__icon-btn" aria-label="Video call">
              <FontAwesomeIcon icon={faVideo} />
            </button>
            <button type="button" className="msg-chat__icon-btn" aria-label="More options">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </div>
        </header>

        {/* Messages Body */}
        <div className="msg-chat__body" role="log" aria-label="Conversation messages" aria-live="polite">
          {activeConv.messages.map((msg) => (
            <Fragment key={msg.id}>
              {/* Date divider */}
              {msg.date && (
                <div className="msg-divider msg-divider--date" role="separator">
                  <span>{msg.date}</span>
                </div>
              )}
              {/* New messages divider */}
              {msg.divider && (
                <div className="msg-divider msg-divider--new" role="separator">
                  <span>{msg.divider}</span>
                </div>
              )}

              <div className={`msg-bubble-row msg-bubble-row--${msg.from}`}>
                {/* Them avatar */}
                {msg.from === 'them' && (
                  <Avatar conv={activeConv} size={32} />
                )}

                <div className={`msg-bubble msg-bubble--${msg.from}`}>
                  {/* Group sender name */}
                  {activeConv.isGroup && msg.from === 'them' && msg.sender && (
                    <p className="msg-bubble__sender">{msg.sender}</p>
                  )}

                  {msg.type === 'text' && (
                    <p className="msg-bubble__text">{msg.text}</p>
                  )}

                  {msg.type === 'file' && (
                    <div className="msg-file">
                      <div className="msg-file__icon">
                        <FontAwesomeIcon icon={faFilePdf} />
                      </div>
                      <div className="msg-file__info">
                        <p className="msg-file__name">{msg.fileName}</p>
                        <p className="msg-file__meta">{msg.fileSize} &bull; Ready to download</p>
                      </div>
                      <button type="button" className="msg-file__download" aria-label={`Download ${msg.fileName}`}>
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </div>
                  )}

                  <div className="msg-bubble__footer">
                    <span className="msg-bubble__time">{msg.time}</span>
                    {msg.from === 'me' && (
                      <span className="msg-bubble__status" aria-label={msg.read ? 'Read' : 'Sent'}>
                        {msg.read
                          ? <><FontAwesomeIcon icon={faCheckDouble} /> Read</>
                          : <FontAwesomeIcon icon={faCheck} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="msg-bubble-row msg-bubble-row--them">
              <Avatar conv={activeConv} size={32} />
              <div className="msg-typing" aria-label={`${activeConv.name} is typing`}>
                <span /><span /><span />
                <p className="msg-typing__label">{activeConv.name} is typing...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Encryption notice */}
        <p className="msg-chat__encrypt">
          <FontAwesomeIcon icon={faCircleInfo} aria-hidden="true" />
          Messages are encrypted for your privacy and security.
        </p>

        {/* Input Bar */}
        <div className="msg-chat__input-bar">
          <button type="button" className="msg-input-icon" aria-label="Add attachment">
            <FontAwesomeIcon icon={faPaperclip} />
          </button>
          <button type="button" className="msg-input-icon" aria-label="Send image">
            <FontAwesomeIcon icon={faImage} />
          </button>

          <div className="msg-input-wrap">
            <textarea
              ref={inputRef}
              className="msg-input"
              rows={1}
              placeholder={`Type a message to ${activeConv.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message input"
            />
            <button type="button" className="msg-input-icon msg-input-icon--emoji" aria-label="Emoji">
              <FontAwesomeIcon icon={faFaceSmile} />
            </button>
          </div>

          <button
            type="button"
            className="msg-send-btn"
            onClick={handleSend}
            disabled={!inputText.trim()}
            aria-label="Send message"
            id="btn-send-message"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;

