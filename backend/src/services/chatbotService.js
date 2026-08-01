// Talks to a dedicated OpenAI Assistant ("custom GPT") created by the
// founder in their OpenAI account for InsuranceAdvise.in's chatbot. Set
// OPENAI_ASSISTANT_ID (and the already-configured OPENAI_API_KEY) in
// backend/.env once that Assistant exists — until then, sendMessage()
// returns a friendly placeholder instead of erroring, so the widget never
// breaks the page it's mounted on.
//
// Uses the OpenAI Assistants API (threads/runs), not the plain Chat
// Completions endpoint used by contentGenerator.js, because a "custom GPT"
// is an Assistant with its own stored instructions/knowledge — the
// Assistant ID is what ties this service to that specific GPT.

const OPENAI_BASE = 'https://api.openai.com/v1';

function isConfigured() {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_ASSISTANT_ID);
}

function openaiHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    'OpenAI-Beta': 'assistants=v2'
  };
}

async function createThread() {
  const res = await fetch(`${OPENAI_BASE}/threads`, { method: 'POST', headers: openaiHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Could not start a conversation');
  return data.id;
}

async function addMessage(threadId, message) {
  const res = await fetch(`${OPENAI_BASE}/threads/${threadId}/messages`, {
    method: 'POST',
    headers: openaiHeaders(),
    body: JSON.stringify({ role: 'user', content: message })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Could not send the message');
}

async function runAndWait(threadId) {
  const runRes = await fetch(`${OPENAI_BASE}/threads/${threadId}/runs`, {
    method: 'POST',
    headers: openaiHeaders(),
    body: JSON.stringify({ assistant_id: process.env.OPENAI_ASSISTANT_ID })
  });
  const run = await runRes.json();
  if (!runRes.ok) throw new Error(run.error?.message || 'Could not reach the assistant');

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const statusRes = await fetch(`${OPENAI_BASE}/threads/${threadId}/runs/${run.id}`, {
      headers: openaiHeaders()
    });
    const status = await statusRes.json();
    if (status.status === 'completed') return;
    if (['failed', 'cancelled', 'expired'].includes(status.status)) {
      throw new Error('The assistant could not finish answering that. Please try again.');
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('The assistant is taking too long to respond. Please try again.');
}

async function latestReply(threadId) {
  const res = await fetch(`${OPENAI_BASE}/threads/${threadId}/messages?limit=1&order=desc`, {
    headers: openaiHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Could not read the reply');

  const latest = data.data?.[0];
  const textBlock = latest?.content?.find((block) => block.type === 'text');
  return textBlock?.text?.value || "Sorry, I didn't catch that — could you rephrase?";
}

// sendMessage({ threadId, message }) -> { threadId, reply }
// Reuses the same OpenAI thread across turns (passed back to the caller) so
// the assistant keeps context of the conversation.
async function sendMessage({ threadId, message }) {
  if (!isConfigured()) {
    return {
      threadId: threadId || null,
      reply:
        "Our AI assistant isn't set up yet — please check back soon, or reach out to us directly in the meantime."
    };
  }

  const activeThreadId = threadId || (await createThread());
  await addMessage(activeThreadId, message);
  await runAndWait(activeThreadId);
  const reply = await latestReply(activeThreadId);

  return { threadId: activeThreadId, reply };
}

module.exports = { sendMessage };
