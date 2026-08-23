# AI Proxy Security Contract

The Expo client must never contain a Gemini/Google provider credential. It only receives the public URL of a trusted backend through `EXPO_PUBLIC_AI_PROXY_URL`.

The backend owns `GEMINI_API_KEY` as a server-side secret and must authenticate callers, enforce per-user/IP rate limits, validate request sizes and schemas, and avoid logging prompts, images, credentials, or raw provider responses.

## Endpoints

- `POST /v1/chat` — request `{ "level": string, "parts": ChatPart[] }`; response `{ "text": string }`
- `POST /v1/quiz-question` — request `{ "level": string, "course": string }`; response `{ "question": string, "options": string[], "correctAnswer": string }`
- `POST /v1/explanation` — request `{ "level": string, "course": string }`; response `{ "title": string, "points": string[] }`

Production URLs must use HTTPS. `http://localhost` and `http://127.0.0.1` are accepted only for local development.

Until a compliant backend is deployed, AI calls fail closed and the rest of the application remains usable.
