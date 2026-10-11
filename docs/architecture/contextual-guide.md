# Conversational sound adviser

## Implemented design

The text model is now mlx-community/Qwen3-1.7B-4bit, pinned in apps/voice-service/assistant-model.json and loaded offline through the existing MLX-LM runtime. Kokoro remains the local speech model. One worker serializes text and speech; only one text model is active. Old 0.6B and 4B weights remain cached but are not loaded. Thinking is explicitly disabled in the chat template; text and voice load and warm at startup. No fine-tuning, vector database, or new Python package installation is needed.

Chat no longer calls the keyword-based shopping handler. advisor.py asks the model to interpret natural language into a validated plan: intent, selected products, best recommendation, preferences, focus, clarification question, quantity, and whether an action is requested. The planner receives compact catalogue ID/name/category/price/ANC records, displayed recommendation order, preference state, current product page, and bag contents. It processes the latest request separately from raw chat history. The reply writer receives full selected product guidance and up to twelve recent turns. If a recommendation plan omits IDs, application filtering selects matching catalogue records from the interpreted preferences. Preferences are carried in assistant messages and can be changed by the customer.

A second generation writes a natural reply using relevant product facts and the plan. Catalogue prices, battery figures and IDs remain authoritative. Unknown specifications (including Mac compatibility and exact IP ratings) are explicitly listed. Product use cases are editorial guidance derived from the mock descriptions, not measured performance. Personal suitability can ask about routine, fit priorities and budget. Invalid plans retry once, then ask for clarification. Invalid prose retries with stricter grounding, then asks a question rather than dumping unrelated facts.

Cart actions require a structured add/checkout plan and an independent semantic check of the latest customer's authorization. Known product IDs and quantities are validated. Buy/order opens mock checkout; the assistant never submits the checkout form or completes a real payment. An existing bag item can be reused. The language model cannot invoke arbitrary application functions. This is a demonstration with fallible local inference, not a guarantee of understanding every customer message.

## Preserved UI and voice

Reusable storefront and widget components remain in their existing folders. Hover starts preparation at one second and opens its glass panel at 2.5 seconds. Separate indicators cover text and voice. New product focus clears stale previews. Kokoro can read chat replies and hover facts. First-visit onboarding introduces Find your sound and Enable sound guide with playback-driven animations. Microphone recognition remains browser-dependent.

## Setup and verification

Source scripts/env.sh and run the preflight before project writes or model downloads. scripts/download-assistant.py downloads the pinned model into the external project cache. Startup uses only the cached model files. Run npm run build, npm test, and .local/venvs/voice/bin/python tests/unit/shopping_tools_test.py. scripts/verify-adviser.py exercises actual model conversations and saves replies and timings under artifacts/reports; those live observations are separate from mocked unit tests. Before the 1.7B switch, build and twenty adviser tests plus four shopping tests have passed during this change. A nine-turn resident-model run completed: typo-tolerant instructions, ANC exclusion, suitability clarification, noisy-commute advice, product follow-up, compatibility uncertainty, changed budget/category, a natural add request, and a negated purchase request. Additional final checks verify single-product detail, acknowledgement, and guarded compatibility uncertainty. Compatibility prose occasionally fails grounding and uses a clarification fallback. Recorded text timings were approximately 8–16 seconds in this run, not a latency guarantee. Model-generated prose remains fallible. Browser integration is verified separately.

Model sources: https://huggingface.co/Qwen/Qwen3-1.7B and https://huggingface.co/mlx-community/Qwen3-1.7B-4bit .

Previous 4B browser verification: the production site accepted a noisy-train commute and budget request, recommended Halo Studio, then resolved “that one” in a battery follow-up with its catalogue 40-hour figure. Both actual HTTP chat requests returned 200. Screenshot: artifacts/reports/conversational-adviser.png.

## Qwen3-1.7B switch verification

Pinned mlx-community/Qwen3-1.7B-4bit at 3b1b1768f8f8cf8351c712464f906e86c2b8269e, using the existing MLX runtime. Thinking is explicitly disabled. Both text and Kokoro warm at startup and remain resident. Twenty-two unit tests pass. The last nine-turn live run recorded text times of 1.46–7.35 seconds; seven checks passed and two failed (changing preferences in a longer conversation and the dependent cart reference). This is a measured quality regression from the recorded 4B run, not a fully passing conversational evaluation. Invalid replies now clear recommendation IDs and mark clarification pending; an unnamed cart reference after that asks for a product name. No queue-priority or streaming change was made. Existing 4B weights remain cached for comparison, not active.

After the clarification guard was added, an actual HTTP request to add an unnamed recommendation with pending clarification returned a product-name question and no action. Evidence: artifacts/reports/adviser-1.7b-clarification-guard.json.

Final browser verification: Air Sport price/battery query returned its 5900-rupee price and 18-hour listed battery life, with the correct product card and Kokoro speech playback. Screenshot: artifacts/reports/qwen-1.7b-guide.png. The website remains running on localhost:8000 with only the 1.7B text model active.

## Named-product cart request handling

The reported “add air one in the cart” failure was caused by the general 1.7B planner returning product advice instead of a shopping tool. A focused model classifier now runs for an unambiguous catalogue-name mention before the general recommendation pipeline. It interprets add/checkout/none and quantity, validates the decision, and requires a separate authorization check. Product-name matching does not decide action meaning. Known IDs and quantities stay under application control. Clear denial, first-person permission, and how-to grammar cannot authorize tools even if a model says to execute. Named buy requests open mock checkout and reuse an existing bag item. Other conversations retain the existing adviser pipeline and its documented 1.7B limitations.

Twenty-eight unit tests passed after this change. scripts/verify-named-cart.py records real local replies for exact add wording, polite put wording/quantity, negation, how-to, first-person permission, and checkout reuse.

All six live named-cart checks passed after the permission guard. Direct add/quantity/checkout text actions took approximately 0.56–0.62 seconds in the recorded run (without queued voice work). Browser verification of the exact screenshot request “add air one in the cart” displayed “Added 1 × Air One to your bag” and changed Bag (0) to Bag (1). Screenshot: artifacts/reports/air-one-cart-fixed.png. This fixes named-product requests; it does not establish that all customer wording or longer follow-ups are now reliable.

## Voice-only individual product assistant

When Sound guide is enabled, the product details panel displays a microphone immediately before Close. The reusable ProductVoiceAssistant controls and useProductVoiceAssistant hook accept spoken input only; transcripts and replies are displayed without a typing field. Recognition sends the current product ID, bag contents and up to twelve product conversation turns to the same local chat API. Kokoro replies play through the guide AudioContext unlocked by Enable sound guide. Text inference and voice preparation have separate indicators. Changing product, closing the panel or disabling the guide cancels the product request and clears its conversation.

The focused shopping classifier can resolve an unambiguous “this” to the current product, with an independent authorization check. Chat and product voice share applyShoppingAction, which validates catalogue IDs and quantities before changing the bag. Checkout opens the existing mock review flow and does not submit an order.

Executed verification: production build passed; eight Node and thirty Python unit tests passed. Four real HTTP transcript checks passed for Form Pro battery details, add-this, checkout reuse, and a negated purchase (artifacts/reports/product-voice-api-verification.json). Browser verification shows the enabled microphone before Close and the voice-only panel (artifacts/reports/product-voice-guide.png). The in-app browser silently failed to start recognition. Voice-only activation now displays immediate listening feedback and reports a startup timeout if no recognition event arrives; an actual captured utterance and its spoken reply have not been verified. These HTTP checks establish transcript handling, not end-to-end microphone capture.

## Pointer-adjacent product guide

Desktop product guides capture the trigger pointer position, open to its right with an 18px gap when space permits, and flip left otherwise. Position is clamped inside the viewport with room for bottom controls. The panel stays still while the pointer moves into its controls; product changes capture a fresh anchor. ResizeObserver reclamps when the answer changes panel height, and window resizing updates the bounds. Keyboard triggers use the product element as their anchor; screens at or below 640px retain the existing wide mobile panel. Shared panelPosition geometry has four edge/bounds tests; the production build and twelve Node tests passed.

Browser verification at 1280 × 850 showed the Form Pro guide beside the clicked trigger, including microphone controls after enabling Sound guide. Screenshot: artifacts/reports/pointer-product-guide.png. The temporary desktop viewport was reset after verification.
