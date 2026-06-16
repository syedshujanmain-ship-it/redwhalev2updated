---
name: groq-chat-completion
description: Call Groq API for fast chat completions (OpenAI-compatible). Use when building chatbots, text generation, translation, or sentiment analysis.
metadata:
  id: skill_groq_chat_completion
  display_name: Groq Chat Completion
  trigger: groq, chat completion, fast language model
  key_type: user_managed
  scope_platform: any
  version: 1.0.0
secrets:
  - name: GROQ_API_KEY
    description: Groq API 的认证密钥，用于访问 Groq 的 OpenAI 兼容接口
---

# Groq Chat Completion

Call Groq's OpenAI-compatible chat completions API for fast language model inference.

## Setup

Set your API key:
```bash
export GROQ_API_KEY=your_groq_api_key
```

## Usage

### Python (OpenAI SDK)

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

response = client.chat.completions.create(
    messages=[{"role": "user", "content": "Explain the importance of fast language models"}],
    model="openai/gpt-oss-20b",
)
print(response.choices[0].message.content)
```

### API Request

```
POST https://api.groq.com/openai/v1/chat/completions
Authorization: Bearer {GROQ_API_KEY}
Content-Type: application/json

{
  "model": "openai/gpt-oss-20b",
  "messages": [{"role": "user", "content": "Your prompt here"}]
}
```

### Response Structure

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "openai/gpt-oss-20b",
  "choices": [
    {
      "index": 0,
      "message": {"role": "assistant", "content": "..."},
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 556,
    "total_tokens": 574
  },
  "system_fingerprint": "fp_179b0f92c9",
  "x_groq": {"id": "req_..."}
}
```

## Key Fields

| Field | Description |
|-------|-------------|
| `choices[0].message.content` | Generated response text |
| `usage.total_tokens` | Total tokens consumed |
| `usage.total_time` | End-to-end latency |
| `x_groq.id` | Groq request ID for debugging |
| `system_fingerprint` | Model version fingerprint |

## Common Use Cases

- **Real-time chatbots**: Low-latency conversational interfaces
- **Sentiment analysis**: Classify tone and opinion in text
- **Text generation**: Articles, summaries, creative content
- **Language translation**: Translate between languages
- **Named entity recognition**: Extract names, places, organizations
