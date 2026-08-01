'use client';
import { useEffect, useRef, useState } from 'react';

// Floating chat bubble backed by the dedicated GPT wired up in
// backend/src/services/chatbotService.js. Keeps the OpenAI thread id in
// localStorage so a visitor's conversation survives across messages/reloads
// in the same browser. `offset` lets a page nudge the bubble up when
// another floating button (e.g. WhatsApp) already sits at bottom-6 right-6.
export default function ChatWidget({ offset = false }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm here to help — ask me anything." }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setSending(true);

    try {
      const threadId = localStorage.getItem('chatbotThreadId') || undefined;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, message: text })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.error || 'Something went wrong.' }]);
        return;
      }

      if (data.threadId) localStorage.setItem('chatbotThreadId', data.threadId);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Could not reach the assistant. Please try again.' }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => setOpen((v) => !v)}
        className={`fixed z-40 grid h-14 w-14 place-items-center rounded-full bg-ia-blue text-2xl text-white shadow-xl transition hover:-translate-y-0.5 ${
          offset ? 'bottom-24 right-6' : 'bottom-6 right-6'
        }`}
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div
          className={`fixed z-40 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ${
            offset ? 'bottom-40 right-6' : 'bottom-24 right-6'
          }`}
          style={{ height: '420px' }}
        >
          <div className="bg-ia-navy px-4 py-3 text-sm font-bold text-white">Chat with us</div>
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user' ? 'ml-auto bg-ia-blue text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending && <div className="max-w-[85%] rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-400">...</div>}
          </div>
          <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-ia-blue"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex-none rounded-xl bg-ia-blue px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
