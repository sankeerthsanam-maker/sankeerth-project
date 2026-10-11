# Local AI and voice

The website, Qwen text API, and Kokoro audio API run together at http://127.0.0.1:8000. No tunnel, public hosting, or API key is required.

```sh
cd /Volumes/EXTERNAL_US/sankeeproject
source scripts/env.sh
npm run build
zsh scripts/start-local.sh
```

Wait for `Application startup complete`. Startup loads Qwen3-1.7B-4bit and Kokoro-82M-bf16, warms text inference, and prepares the welcome audio. Both models remain in memory until the server stops. Reopening the page does not reload them. Restarting the server does. All runtimes, packages, model weights, and project caches stay under `.local` on the external drive.

Click **Enable sound guide** or open **Find your sound** to allow audio. First-visit greeting playback uses the prepared clip; the launcher hops three times when the brief introduction starts playing. After the landing animation, the greeting attempts autoplay. If the browser blocks it, the first click or key press retries the preloaded audio. The welcome-heard flag persists in localStorage.

Linger over a product: at one second an animated preparation indicator appears and Qwen begins a fresh invitation; at 2.5 seconds the glass details panel opens. Pending text and voice have separate loading indicators. Leaving cancels pending work and narration while preserving the visible panel. Touch users can select **Explore details**. Chat uses Qwen to plan conversations, remember preferences, generate grounded advice, and request validated mock cart tools. Kokoro uses the English `af_heart` voice.

A single background worker serializes model inference while HTTP and the browser remain responsive. Queued requests are bounded; disconnects cancel text between generated tokens and audio between segments. Threads do not guarantee faster model generation. The model can produce unsuitable text: hover validation substitutes a varied invitation, while catalogue numbers and product selection remain authoritative. Chat guards unsupported numbers and product names, but a tiny model can still phrase an answer imperfectly.

Development: keep this service running and use `npm run dev` in another terminal. Vite proxies `/api/voice` to port 8000. A static-only deployment does not provide these local APIs. An interviewer's clone needs the compatible Python dependencies and model downloads from `apps/voice-service/requirements-lock.txt`; this checkout is configured for Apple Silicon and external-only storage.

Microphone input uses browser SpeechRecognition where supported and may contact the browser vendor's service. Text generation and speech synthesis run locally after models are downloaded. Images and fonts still use remote assets. Unsupported microphones retain text chat. WAV responses remain in memory and are not saved as recordings.

The first-visit introduction now plays two short clips in sequence: Find your sound first, then Enable sound guide. Each control animates only during its own clip. Both clips prepare during the landing animation; the second uses the resident Kokoro speech endpoint.

Development verification: `http://localhost:5173/?intro-preview=1` replays the two-part onboarding without modifying the heard flag. The preview override is disabled in production builds.

## Conversational shopping

Chat sends the six-product catalogue, editorial guidance, up to twelve conversation turns, recommendation references, remembered preferences, current product page, and bag contents to local Qwen. A structured model plan interprets the request; a separate reply explains the recommendation or asks a question. Shopping tools require independent semantic authorization. No fine-tuning or vector database is required for this implementation. Try: “Earbuds under 10000”, “Compare Halo Studio and Form Pro”, “How do I order?”, “Add the second one”, or “Buy the one you suggested”. Ambiguous references ask you to choose. Buy/order opens mock checkout; finish with the existing name/email form and Place mock order. No payment is collected. Kokoro reads replies when spoken replies are enabled. Invalid model prose may use a grounded fallback.

Shopping tool tests: source scripts/env.sh, then run `.local/venvs/voice/bin/python tests/unit/shopping_tools_test.py`.

The assistant model is pinned in apps/voice-service/assistant-model.json. Before first startup, source scripts/env.sh and run `.local/venvs/voice/bin/python scripts/download-assistant.py` (approximately 1 GB of weights). This uses the existing external runtime and cache. Startup then loads offline. Chat uses a model-led plan and natural reply, with an additional authorization check for cart tools. Thinking is disabled for 1.7B. The compact planner uses remembered state; the reply writer uses recent turns. Loading indicators remain visible. The smaller model is faster in recorded checks but less reliable on longer follow-ups; see docs/architecture/contextual-guide.md for actual test limitations. Run `.local/venvs/voice/bin/python scripts/verify-adviser.py` against the running server to record realistic conversation checks.

## Landing startup sound

The user-supplied haruudu futuristic-logo MP3 in apps/storefront/src/sounds is bundled by Vite and plays locally during the landing spinner at 30% volume. It fades during the final 800 ms of the 6.4-second sequence and stops on landing-ready before guide narration. StartupSound is reusable and cleans up playback/listeners on exit. If browser autoplay is blocked, Play sound appears on the loader; a click joins the current timeline. The short reduced-motion loader skips startup audio. Source: https://pixabay.com/sound-effects/film-special-effects-a-polished-modern-futuristic-logo-sound-intro-for-a-tech-startup-535508/ (provided by the user).

## Product voice controls

Enable Sound guide, open a product with Explore details, then tap the microphone beside Close. Ask “What is its battery life?”, “Add this to my cart”, or “Buy this”. The selected product supplies conversation context; buy opens mock checkout for review. Tap the microphone again to stop listening. Replies are spoken through Kokoro, and Stop cancels reply narration. Switching products clears the product conversation and cancels pending work.

This panel is voice-only. Browser SpeechRecognition support and microphone permission are required; recognition may use the browser vendor’s service even though Qwen and Kokoro are local. The in-app browser microphone capture was not verified. Use a browser with working SpeechRecognition and allow microphone access.
