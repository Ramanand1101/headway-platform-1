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

// Sent as `additional_instructions` on every run, in every context (public
// microsite widget and advisor dashboard alike), so the assistant can
// actually answer "where do I find X" / "how does Y work" questions instead
// of guessing. This is a plain-text snapshot of the platform, not a live
// lookup — if the dashboard's tabs, pricing or credit rules change, update
// this block too (see backend/src/config/pricing.js for the numbers).
const PLATFORM_KNOWLEDGE = `You are the assistant for InsuranceAdvise.in, a platform that gives licensed Indian insurance advisors their own personal website (microsite) plus tools to generate social content, manage leads, and grow their practice. Answer in the same language style the user writes in (English or Hindi/Hinglish), and keep answers short and practical.

WHO YOU'RE TALKING TO: either an advisor logged into their dashboard (asking "where is X" / "how do I do Y"), or a visitor on an advisor's public microsite (asking about insurance in general or about that advisor). Adjust your answer to whichever seems to be the case.

ADVISOR DASHBOARD — left-hand navigation tabs and what's in each:
- Overview: quick summary of the advisor's account.
- My Website: preview and manage their public microsite (the site their clients see).
- Edit Profile: photo, short bio/tagline, About Me, services, companies worked with, achievements, FAQs, customer reviews, social media links, and a "Blogs" section (write a blog post for their microsite — see BLOGS below).
- Content Library: browse ready-made marketing content curated by the team, organized into three sections — Images, Carousels, Reels — each further split by insurance line: Life, Health, General. There's also a "My Uploads" area for the advisor's own raw photos.
- My Leads: enquiries submitted through their microsite's contact form land here.
- Recharge Credits: buy credit packs (see PRICING below).

CONTENT LIBRARY & CREDITS — the most commonly confused part, be precise:
- Previewing anything in the Content Library is always free — no credit is charged just for looking.
- A credit is only charged the moment the advisor clicks a Share icon (WhatsApp, Facebook, LinkedIn, Instagram, YouTube) or Download on a specific item. The cost depends on its type: an Image costs 10 credits, a Carousel costs 20 credits, a Reel costs 30 credits. Once unlocked this way, that same item can be shared/downloaded again for free.
- There is no automatic "publish to Instagram/Facebook" button anymore — advisors share manually via those share buttons (WhatsApp/Facebook/LinkedIn open a real share dialog; Instagram/YouTube download the file since those platforms don't allow posting from a website).

BLOGS (inside Edit Profile):
- "Write with AI" drafts a blog post — this preview is completely free, no credit used, and the advisor can edit the title/body before doing anything with it.
- Clicking "Post it" is what actually publishes it to their microsite's blog, and only then is 1 AI credit charged.
- "Write manually" (no AI) is always free, however many posts they write.
- There are two separate credit pools: AI credits (for blog generation, 3 free to start) and content credits (for Content Library shares/downloads, from recharge packs).

PRICING / RECHARGE:
- Starter: ₹249 for 50 credits.
- Growth: ₹499 for 110 credits.
- Authority: ₹999 for 220 credits.
- Extra Credits top-up: ₹249 for 50 credits, can be bought any time in addition to the above.
- A custom domain (e.g. www.youradvisorname.com) is a one-time ₹6,000 add-on, fully handled by the team (registration, DNS, SSL).

WHAT NOT TO CLAIM: there is no Social Accounts / Facebook-Instagram auto-connect feature anymore — don't tell anyone to look for it. Don't give specific personalized insurance/investment advice (premium amounts, which policy to buy, etc.) — for that, tell them to contact their advisor directly; you can explain general concepts (what term insurance is, how health insurance claims work, etc.) but not recommend specific products.`;

// Dashboard-only tools that let the assistant propose filling specific
// Edit Profile fields. The assistant only ever *proposes* — it can't touch
// the advisor's data directly. Each call comes back to the frontend as an
// `action`, which renders an "Insert" button; nothing is applied until the
// advisor clicks it. Never sent to anonymous microsite visitors (see
// chatbotController.js's `context` check).
const PROFILE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'set_bio',
      description:
        "Draft the advisor's short one-line bio/tagline shown next to their name on their microsite homepage. Only call this when the advisor explicitly asks you to write/draft/update their short bio or tagline.",
      parameters: {
        type: 'object',
        properties: { text: { type: 'string', description: 'The short bio/tagline text, 25-40 words.' } },
        required: ['text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_about_me',
      description:
        "Draft the advisor's longer About Me paragraph shown on their microsite. Only call this when the advisor explicitly asks you to write/draft/update their About Me section.",
      parameters: {
        type: 'object',
        properties: { text: { type: 'string', description: 'The About Me paragraph, 90-130 words.' } },
        required: ['text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_faq',
      description:
        "Draft one FAQ (question + answer) to add to the advisor's microsite FAQ list. Only call this when the advisor explicitly asks you to draft/add an FAQ.",
      parameters: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' }
        },
        required: ['question', 'answer']
      }
    }
  }
];

const PROFILE_TOOLS_INSTRUCTIONS = `You can help the advisor fill in parts of their profile by calling these tools: set_bio, set_about_me, add_faq. Only call a tool when the advisor clearly asks you to write/draft/update that specific piece of content for their profile — never on your own initiative, and never for casual conversation. After calling a tool, briefly tell the advisor what you prepared in one short sentence, mentioning they can review and insert it from the button shown below your message.`;

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

async function submitToolOutputs(threadId, runId, toolCalls) {
  // We never actually execute anything server-side — just acknowledge
  // receipt so the run can finish and the assistant can summarize what it
  // proposed. The real "doing" happens client-side, only if/when the
  // advisor clicks the Insert button for that action.
  const tool_outputs = toolCalls.map((tc) => ({ tool_call_id: tc.id, output: JSON.stringify({ received: true }) }));
  const res = await fetch(`${OPENAI_BASE}/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
    method: 'POST',
    headers: openaiHeaders(),
    body: JSON.stringify({ tool_outputs })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Could not continue the conversation');
}

// Runs the thread and returns any tool calls the assistant made along the
// way (e.g. set_bio) as { type, args } — collected, not executed.
async function runAndWait(threadId, tools) {
  const body = {
    assistant_id: process.env.OPENAI_ASSISTANT_ID,
    additional_instructions: tools?.length ? `${PLATFORM_KNOWLEDGE}\n\n${PROFILE_TOOLS_INSTRUCTIONS}` : PLATFORM_KNOWLEDGE
  };
  if (tools?.length) {
    body.tools = tools;
  }

  const runRes = await fetch(`${OPENAI_BASE}/threads/${threadId}/runs`, {
    method: 'POST',
    headers: openaiHeaders(),
    body: JSON.stringify(body)
  });
  const run = await runRes.json();
  if (!runRes.ok) throw new Error(run.error?.message || 'Could not reach the assistant');

  const actions = [];

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const statusRes = await fetch(`${OPENAI_BASE}/threads/${threadId}/runs/${run.id}`, {
      headers: openaiHeaders()
    });
    const status = await statusRes.json();

    if (status.status === 'completed') return actions;

    if (status.status === 'requires_action' && status.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = status.required_action.submit_tool_outputs.tool_calls || [];
      toolCalls.forEach((tc) => {
        let args = {};
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          // Malformed args from the model — skip this one, keep the run alive.
        }
        actions.push({ type: tc.function.name, args });
      });
      await submitToolOutputs(threadId, run.id, toolCalls);
      continue;
    }

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

// sendMessage({ threadId, message, allowProfileTools }) -> { threadId, reply, actions }
// Reuses the same OpenAI thread across turns (passed back to the caller) so
// the assistant keeps context of the conversation. `allowProfileTools`
// gates the set_bio/set_about_me/add_faq tools — only the advisor dashboard
// passes this, never the public microsite widget.
async function sendMessage({ threadId, message, allowProfileTools }) {
  if (!isConfigured()) {
    return {
      threadId: threadId || null,
      reply:
        "Our AI assistant isn't set up yet — please check back soon, or reach out to us directly in the meantime.",
      actions: []
    };
  }

  const activeThreadId = threadId || (await createThread());
  await addMessage(activeThreadId, message);
  const actions = await runAndWait(activeThreadId, allowProfileTools ? PROFILE_TOOLS : undefined);
  const reply = await latestReply(activeThreadId);

  return { threadId: activeThreadId, reply, actions };
}

module.exports = { sendMessage };
