"""Constrained local model decisions + catalogue facts, cached for instant dwell previews."""
import gc
import hashlib
import json
import re
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODEL = "mlx-community/Qwen3-0.6B-4bit"
CACHE = ROOT / ".local/caches/product-insights"
OPENINGS = {
    "focus": "Want to go a little deeper into your listening?",
    "move": "Looking for sound that moves with you?",
    "home": "Shall we find a little more sound for your space?",
    "everyday": "Curious what makes this one a good everyday companion?",
}

def catalogue():
    return json.loads((Path(__file__).parent / "catalogue.json").read_text())

def prepare():
    CACHE.mkdir(parents=True, exist_ok=True)
    source = json.dumps(catalogue(), sort_keys=True) + MODEL + "af_heart-v4"
    key = hashlib.sha256(source.encode()).hexdigest()[:16]
    folder = CACHE / key
    folder.mkdir(exist_ok=True)
    manifest = folder / "manifest.json"
    if manifest.exists():
        return folder, json.loads(manifest.read_text())
    from mlx_lm import load, generate
    from mlx_lm.sample_utils import make_sampler
    import mlx.core as mx
    model, tokenizer = load(MODEL)
    entries = {}
    for product in catalogue():
        start = time.perf_counter()
        prompt = tokenizer.apply_chat_template([
            {"role": "system", "content": "Choose the best listening context from product facts. Reply ONLY with a single category. focus: immersive or noise-cancelling headphones. move: sport earbuds or portable speakers. home: home speakers. everyday: other earbuds. No other text."},
            {"role": "user", "content": "Over-ear headphones with adaptive noise cancellation."},
            {"role": "assistant", "content": "focus"},
            {"role": "user", "content": "A portable speaker for weekends outdoors."},
            {"role": "assistant", "content": "move"},
            {"role": "user", "content": "Warm audio for your home in a compact speaker."},
            {"role": "assistant", "content": "home"},
            {"role": "user", "content": "Lightweight earbuds for your everyday rhythm."},
            {"role": "assistant", "content": "everyday"},
            {"role": "user", "content": product["name"] + " (" + product["category"] + "): " + product["description"]}
        ], tokenize=False, add_generation_prompt=True, enable_thinking=False)
        output = generate(model, tokenizer, prompt=prompt, max_tokens=8, sampler=make_sampler(temp=0), verbose=False).strip().lower()
        words = re.findall(r"\b(focus|move|home|everyday)\b", output)
        if not words and "immersive" in output:
            words = ["focus"]
        description = product["description"].lower()
        expected = ("focus" if product["category"] == "Headphones" else
                    "move" if "portable" in description or "sport" in product["name"].lower() else
                    "home" if product["category"] == "Speakers" else "everyday")
        # A tiny model can misclassify. Keep its label only when compatible with catalogue facts.
        accepted = bool(words and words[0] == expected)
        choice = words[0] if accepted else expected
        noise = "Noise cancellation included." if product["anc"] else "No active noise cancellation."
        text = f"{OPENINGS[choice]} {product['name']} offers {product['battery']} hours of battery life. {noise} It is priced at {product['price']} rupees."
        entries[product["id"]] = {"text": text, "opening": OPENINGS[choice], "source": "qwen" if accepted else "catalogue-fallback", "intent": choice, "model_output": output, "generation_seconds": round(time.perf_counter()-start,3)}
        print(f"Prepared {product['id']}: {choice}", flush=True)
    del model, tokenizer
    gc.collect()
    mx.clear_cache()
    manifest.write_text(json.dumps(entries, indent=2))
    return folder, entries
