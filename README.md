# Sankee Audio

A responsive audio storefront with an embeddable shopping assistant, local AI conversations, spoken replies, and a mock purchase flow. Built with React, TypeScript, Vite, FastAPI, Qwen3-1.7B, and Kokoro-82M.

## Features

- **Product catalogue:** six demo products, category filters, search, price sorting, and product detail pages with galleries, specifications, quantity controls, and related products.
- **Shopping assistant:** floating chat with product recommendations, comparisons, follow-up questions, catalogue context, and validated cart actions.
- **Voice interaction:** browser speech recognition for questions and local Kokoro speech synthesis for responses.
- **Product sound guide:** hover preparation, a glass product panel beside the pointer on desktop, and voice-only questions about the selected product. The panel adapts to screen edges and uses a wide layout on mobile.
- **Voice shopping:** requests such as “Add Air One to my cart”, “Add this to my cart”, and “Buy this” can add products or open mock checkout. Product-relative requests use the selected product’s context.
- **Cart and checkout:** persistent browser cart, quantity updates, local name/email validation, and a mock order confirmation. No payment processing or real order submission.
- **First-visit experience:** animated landing loader, startup sound, and a short spoken introduction to the assistant and sound guide.
- **Embedding:** a script loader mounts the assistant in an iframe; a plain HTML demonstration is included.

## Requirements

The full local AI application targets **macOS on Apple Silicon** using MLX. This Python dependency set is not a Windows, Linux, or Intel Mac setup.

- An external drive mounted at `/Volumes/EXTERNAL_US`.
- The repository at `/Volumes/EXTERNAL_US/sankeeproject`.
- Git, curl, tar, and an existing Python 3.9+ command (`python3`) for the initial storage check.
- Internet access for initial dependencies and model downloads, and for remotely hosted product images and fonts.
- A browser with SpeechRecognition support and microphone permission for voice input. Text chat remains available when recognition is unsupported.

Project-managed runtimes, packages, model weights, and caches are stored in `.local/`, which is excluded from Git. No AI API key or public tunnel is required. The commands below use the configured external-drive path; `scripts/env.sh`, `scripts/preflight-local.py`, and `scripts/start-local.sh` currently depend on it.

## First-time setup

### 1. Clone the repository

Replace `<repository-url>` with this repository’s GitHub clone URL. Skip this step if the project is already present.

```sh
git clone <repository-url> /Volumes/EXTERNAL_US/sankeeproject
cd /Volumes/EXTERNAL_US/sankeeproject
```

### 2. Prepare project-local runtimes

Run these commands from the repository root in zsh. Skip runtime downloads if the listed binaries already exist.

```sh
mkdir -p .local/runtimes .local/tools .local/caches/tmp
source scripts/env.sh
python3 scripts/preflight-local.py

# Node.js 24: install the Apple Silicon archive inside the project.
curl -fL https://nodejs.org/dist/v24.21.0/node-v24.21.0-darwin-arm64.tar.gz \
  -o "$SANKEE_ROOT/.local/caches/tmp/node-v24.21.0.tar.gz"
tar -xzf "$SANKEE_ROOT/.local/caches/tmp/node-v24.21.0.tar.gz" \
  -C "$SANKEE_ROOT/.local/runtimes"

# uv: keep its installer and binary inside the project, without profile changes.
curl -fL https://astral.sh/uv/0.13.0/install.sh \
  -o "$SANKEE_ROOT/.local/caches/tmp/uv-install.sh"
env UV_UNMANAGED_INSTALL="$SANKEE_ROOT/.local/tools/uv" \
  sh "$SANKEE_ROOT/.local/caches/tmp/uv-install.sh"

# Managed Python and the voice-service environment.
.local/tools/uv/uv python install 3.12.15 --no-bin
.local/tools/uv/uv venv --python 3.12.15 --managed-python .local/venvs/voice

source scripts/env.sh
node --version
.local/venvs/voice/bin/python --version
.local/venvs/voice/bin/python scripts/preflight-local.py
```

The [uv installer configuration](https://docs.astral.sh/uv/reference/installer/) supports an unmanaged installation prefix. `scripts/env.sh` also sets external directories for managed Python, package caches, temporary files, and Hugging Face weights.

### 3. Install dependencies

```sh
source scripts/env.sh
.local/venvs/voice/bin/python scripts/preflight-local.py
npm ci --ignore-scripts --no-audit --no-fund
.local/tools/uv/uv pip install --python .local/venvs/voice/bin/python \
  -r apps/voice-service/requirements-lock.txt
```

### 4. Download models and build

```sh
source scripts/env.sh
.local/venvs/voice/bin/python scripts/preflight-local.py
.local/venvs/voice/bin/python scripts/download-assistant.py
.local/venvs/voice/bin/hf download mlx-community/Kokoro-82M-bf16
npm run build
```

Qwen weights are pinned by repository revision in `apps/voice-service/assistant-model.json`. Kokoro uses the repository configured in `apps/voice-service/server.py`. Its first initialization may fetch additional voice resources into the project cache.

### 5. Start the complete application

```sh
zsh scripts/start-local.sh
```

Wait for `Application startup complete`, then open **http://127.0.0.1:8000/**. Startup loads and warms Qwen and Kokoro; both remain resident until the server stops. Use **Ctrl+C** in the server terminal to stop it.

Check readiness from another terminal:

```sh
curl --fail http://127.0.0.1:8000/api/voice/health
```

The response should include `"ready": true`. Keep one server worker: text and speech inference share a serialized worker to manage model concurrency.

## Starting an existing setup

After first-time setup, downloads and dependency installation are not required for normal startup:

```sh
cd /Volumes/EXTERNAL_US/sankeeproject
source scripts/env.sh
.local/venvs/voice/bin/python scripts/preflight-local.py
npm run build
zsh scripts/start-local.sh
```

## Development

Keep the local AI service running in one terminal. In a second terminal:

```sh
cd /Volumes/EXTERNAL_US/sankeeproject
source scripts/env.sh
npm run dev
```

Open **http://127.0.0.1:5173/**. Vite proxies `/api/voice` requests to the service on port 8000. `npm run dev` alone provides the frontend, but AI chat and Kokoro responses require the local service.

For a static production preview, run `npm run build` followed by `npm run preview`. This previews the UI only; use port 8000 for the complete AI application.

## Using the assistant

1. Open **Find your sound** to ask about products, preferences, or ordering. For example: “Earbuds under 10000” or “Compare Halo Studio and Form Pro”.
2. Use the microphone to dictate a question, or the speaker control to enable spoken replies.
3. Enable **Sound guide** and hover over a product, or select **Explore details**. Preparation begins after one second and the product panel opens after approximately 2.5 seconds.
4. Tap the microphone beside the panel’s close button for voice-only product questions. Try “What is its battery life?” or “Add this to my cart”.
5. Ask to buy a product or open the bag to review mock checkout. Complete the local form and select **Place mock order** to generate a demo confirmation.

## Embedding

Open **http://127.0.0.1:8000/embed-demo.html** for the plain HTML example. A page served from the same local origin can embed the assistant with:

```html
<script src="/embed.js" defer></script>
```

The loader opens `/?widget=1` in an iframe to isolate widget styling. A static host can serve the built `dist/` files, but it does not provide the Python AI APIs. The current backend restricts hosts and origins to configured localhost addresses; public or cross-origin AI embedding requires a separate deployment configuration. The included local demo does not require that configuration.

## Verification

```sh
source scripts/env.sh
.local/venvs/voice/bin/python scripts/preflight-local.py
npm run build
npm test
.local/venvs/voice/bin/python tests/unit/shopping_tools_test.py
```

With the local service running, optional conversational checks record model replies and timings under `artifacts/reports/`:

```sh
.local/venvs/voice/bin/python scripts/verify-adviser.py
.local/venvs/voice/bin/python scripts/verify-named-cart.py
```

The frontend build and unit tests have been run in the existing checkout. A clean-machine installation of these bootstrap instructions has not been executed. Live model evaluations are separate from unit tests and can reveal failures even when unit tests pass.

## Project structure

```text
apps/storefront/       Storefront pages, components, styles, and public embed assets
apps/voice-service/    FastAPI endpoints, model loading, catalogue context, and tool validation
packages/widget/      Reusable assistant UI, voice, cart, checkout, and browser adapters
packages/shared/      Shared product types and mock catalogue
scripts/              Environment, startup, model download, and verification commands
tests/                Automated checks
docs/                 Architecture and setup details
artifacts/            Generated verification reports and demo recordings (ignored)
.local/               Project-local runtimes, dependencies, and model caches (ignored)
```

The storefront uses reusable widget components. Widget code depends on shared data and types without importing storefront code.

## Operational notes

- **Voice permission:** allow microphone access in a supported browser. Recognition may use the browser vendor’s service; Qwen text generation and Kokoro synthesis run locally.
- **Autoplay:** browsers may block startup sound and introductions until a user gesture. Use the displayed sound control or enable Sound guide.
- **Response time:** resident models avoid repeated loading, but generation and queued audio still take time. Loading indicators show pending work; the 1.7B model can misunderstand ambiguous requests or longer follow-ups.
- **Product data:** the catalogue, suitability guidance, colour selections, and checkout are demonstrative. Unknown specifications should prompt clarification. Gallery thumbnails crop existing images; finish selection does not create cart variants.
- **Local persistence:** cart storage uses localStorage. Embedded browsers with storage restrictions may not retain it.
- **Storage errors:** reconnect the external drive and source `scripts/env.sh`; preflight rejects missing or incorrectly configured external paths.
- **Unavailable APIs:** start the server, wait for readiness, and confirm port 8000 is free. A static preview cannot replace the local AI service.

Further implementation details are available in [the architecture notes](docs/architecture/contextual-guide.md) and [the voice guide](docs/setup/local-voice.md).
