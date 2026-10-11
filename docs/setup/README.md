# Local setup

Prerequisite: Node.js 24+ and npm. This checkout has an external-only Node runtime in `.local/runtimes`.

```sh
cd /Volumes/EXTERNAL_US/sankeeproject
source scripts/env.sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

Open http://127.0.0.1:5173. Run `npm run build`, `npm test`, and `npm run preview` for production verification. Portable clones can use their own Node installation; this checkout must use the external-only configuration.

All caches and dependencies are project-local. Do not remove the external drive during operation. Product images and fonts use remote Unsplash / Google Fonts URLs; internet access is needed for those assets. System font fallbacks are provided.

# Embedding

Host the built `dist` folder on an HTTPS static host. Add `<script src="https://YOUR-HOST/embed.js" defer></script>` to any host page. The loader uses an isolated iframe to avoid CSS conflicts; its URL comes from the script origin. See `/embed-demo.html` for a working plain HTML example. Hosts need to permit the script origin in CSP script-src and frame-src. Microphone access in cross-origin frames also requires the host's Permissions-Policy to permit the widget origin.

# Demo limitations

Chat responses use the local Qwen model with model-led conversation planning, product guidance, remembered preferences, and validated demo tools. Start the local AI service described below; a static-only site cannot generate replies. No API key is required. Voice recognition uses browser SpeechRecognition (where available); spoken replies use the local Kokoro service. Recognition may use the browser vendor's speech service. Enable spoken replies with the speaker control, or read an individual reply aloud. Voice requires microphone permission and a secure context; localhost is supported. Unsupported browsers retain text chat.

Cart is stored in localStorage at the widget origin; third-party storage restrictions can prevent persistence on external embeds. Colour dots are visual mock selectors; they do not change photography or cart variants. Checkout validates name and email locally, clears the cart, and produces a demo order ID. No payment is taken and no customer details are submitted.

## Local Kokoro mode

See [local AI and voice setup](local-voice.md) for the local-only website, resident Qwen model, and Kokoro service at port 8000. Start this service before requesting chat or audio.

## Product detail pages

Click a collection product image or name to open its individual page, for example `http://127.0.0.1:8000/#/product/halo`. All six products use the same reusable gallery, purchase, story, and specification components. Hash routes support direct links and browser back/forward without server rewrites. The shared storefront shell keeps cart and assistant state while changing pages.

Gallery thumbnails show different crops of the existing product photo. Finish controls preview the selected swatch; the existing demo cart retains the featured finish. Quantity selection adds the chosen number of units. Specifications use the shared mock catalogue, and related products prefer the same category.
