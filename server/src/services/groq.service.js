/**
 * Groq AI Service (Modular Backend Client)
 * Connects securely to the official Groq API using Node.js native fetch.
 * Zero external SDKs, zero key exposure, strict error handling and timeouts.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

/**
 * Check if a valid Groq API key is configured
 */
export function isGroqConfigured() {
  const key = process.env.GROQ_API_KEY;
  return Boolean(
    key &&
    typeof key === 'string' &&
    key.trim().length > 10 &&
    !key.includes('your_actual_key_here')
  );
}

/**
 * Return current safe status without exposing secrets
 */
export function getGroqStatus() {
  return {
    configured: isGroqConfigured(),
    model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    fallbackModel: FALLBACK_MODEL,
    provider: 'Groq Cloud'
  };
}

/**
 * Core Chat Completion method using native fetch
 */
export async function createGroqChatCompletion({
  messages,
  temperature = 0.2,
  maxTokens = 2048,
  responseFormat = null,
  model = null,
  timeoutMs = 25000
}) {
  if (!isGroqConfigured()) {
    const err = new Error('GROQ_API_KEY is not configured in server/.env');
    err.code = 'GROQ_NOT_CONFIGURED';
    throw err;
  }

  const selectedModel = model || process.env.GROQ_MODEL || DEFAULT_MODEL;
  const apiKey = process.env.GROQ_API_KEY.trim();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const payload = {
    model: selectedModel,
    messages,
    temperature,
    max_tokens: maxTokens
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      let parsedMessage = '';
      try {
        const jsonErr = JSON.parse(errorBody);
        parsedMessage = jsonErr?.error?.message || '';
      } catch {
        parsedMessage = errorBody.substring(0, 200);
      }

      // Safe error classification without leaking any key tokens
      if (response.status === 401) {
        const err = new Error('Groq Authentication Failed: Invalid or expired GROQ_API_KEY.');
        err.code = 'GROQ_AUTH_ERROR';
        err.status = 401;
        throw err;
      }
      if (response.status === 429) {
        const err = new Error('Groq Rate Limit Exceeded or Quota Exhausted.');
        err.code = 'GROQ_RATE_LIMIT';
        err.status = 429;
        throw err;
      }
      if (response.status === 503) {
        const err = new Error('Groq Service Temporarily Unavailable.');
        err.code = 'GROQ_UNAVAILABLE';
        err.status = 503;
        throw err;
      }

      const err = new Error(`Groq API Error (${response.status}): ${parsedMessage || 'Request failed'}`);
      err.code = 'GROQ_API_ERROR';
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Groq API returned an empty response.');
    }

    return {
      content,
      model: data.model || selectedModel,
      usage: data.usage || null
    };
  } catch (error) {
    clearTimeout(timer);

    if (error.name === 'AbortError') {
      const timeoutErr = new Error(`Groq API request timed out after ${timeoutMs}ms.`);
      timeoutErr.code = 'GROQ_TIMEOUT';
      throw timeoutErr;
    }

    // Re-throw sanitized error
    throw error;
  }
}

/**
 * Minimal connectivity test (only executed upon explicit approval)
 */
export async function testGroqConnection() {
  const startTime = Date.now();
  const result = await createGroqChatCompletion({
    messages: [
      { role: 'system', content: 'Respond with a simple JSON object: {"status": "ok", "service": "groq"}' },
      { role: 'user', content: 'ping' }
    ],
    temperature: 0,
    maxTokens: 50,
    responseFormat: { type: 'json_object' },
    timeoutMs: 15000
  });

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    latencyMs,
    model: result.model
  };
}

/**
 * Simplify a passage for dyslexic readers using Groq AI
 */
export async function simplifyTextWithGroq(rawText, level = 'moderate') {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw new Error('Valid text content is required for simplification.');
  }

  const normalized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Define prompt guidelines tailored to dyslexia and requested level
  const levelGuidelines = {
    light: 'Keep the original sentence structure largely intact. Replace only archaic, very complex, or polysyllabic academic vocabulary with clear, accessible everyday words. Keep all domain-specific scientific, historical, or technical terms.',
    moderate: 'Break long, compound, or multi-clause sentences into straightforward, clear sentences. Use active voice and familiar language. Preserve all facts, steps, definitions, domain terms, and names exactly.',
    high: 'Split complex ideas into short, direct, bite-sized sentences (under 12-14 words per sentence where possible). Use simple everyday vocabulary. Clearly express cause-and-effect relationships without dense academic phrasing. Retain all key facts and names.'
  };

  const selectedGuideline = levelGuidelines[level] || levelGuidelines.moderate;

  const systemPrompt = `You are an expert reading accessibility assistant for individuals with dyslexia.
Your task is to rewrite the user's passage to make it easy and comfortable to read, following these strict rules:

SIMPLIFICATION GUIDELINE (${level.toUpperCase()} LEVEL):
${selectedGuideline}

CORE REQUIREMENTS:
1. FACTUAL PRESERVATION: Preserve 100% of facts, names, dates, numbers, scientific terms, and logical relationships. Never invent new facts or alter conclusions.
2. NO SUMMARIZATION: This is a full-passage simplification, NOT a summary. Retain every point and paragraph from the original passage.
3. STRUCTURE: Preserve the original paragraph division using double newlines.
4. CLEAN OUTPUT: Return ONLY the simplified passage. Do NOT write any introduction, commentary, conversational filler (e.g. "Here is the simplified text:"), or markdown code blocks.`;

  // Check if text is exceptionally long (> 4,500 characters with multiple paragraphs)
  const paragraphs = normalized.split(/\n\s*\n+/).filter(p => p.trim().length > 0);

  if (normalized.length > 4500 && paragraphs.length > 2) {
    // Process in paragraph chunks to avoid truncation
    const chunks = [];
    let currentChunk = [];
    let currentLen = 0;

    for (const p of paragraphs) {
      if (currentLen + p.length > 3000 && currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n\n'));
        currentChunk = [p];
        currentLen = p.length;
      } else {
        currentChunk.push(p);
        currentLen += p.length;
      }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk.join('\n\n'));

    const simplifiedChunks = [];
    let lastModel = null;

    for (const chunk of chunks) {
      const response = await createGroqChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: chunk }
        ],
        temperature: 0.2,
        maxTokens: 2048,
        timeoutMs: 25000
      });

      lastModel = response.model;
      let cleaned = response.content.trim();
      cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```$/i, '').trim();
      cleaned = cleaned.replace(/^(here is the simplified (text|version|passage)[\s\S]*?:)\s*/i, '').trim();
      simplifiedChunks.push(cleaned);
    }

    return {
      simplifiedText: simplifiedChunks.join('\n\n'),
      model: lastModel
    };
  }

  // Single-pass simplification for standard passages
  const response = await createGroqChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: normalized }
    ],
    temperature: 0.2,
    maxTokens: 2500,
    timeoutMs: 25000
  });

  let cleaned = response.content.trim();
  cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```$/i, '').trim();
  cleaned = cleaned.replace(/^(here is the simplified (text|version|passage)[\s\S]*?:)\s*/i, '').trim();

  if (!cleaned || cleaned.length < 10) {
    throw new Error('Groq AI returned an empty or invalid simplified text.');
  }

  return {
    simplifiedText: cleaned,
    model: response.model
  };
}

export default {
  isGroqConfigured,
  getGroqStatus,
  createGroqChatCompletion,
  testGroqConnection,
  simplifyTextWithGroq
};

