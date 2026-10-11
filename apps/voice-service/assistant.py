"""Resident Qwen; grounded facts and fresh invitation phrasing."""
import json
import random
import re
import time
from collections import defaultdict, deque
from pathlib import Path

MODEL_ID = "mlx-community/Qwen3-1.7B-4bit"
model = tokenizer = None
recent = defaultdict(lambda: deque(maxlen=5))

def products():
    base = json.loads((Path(__file__).parent / "catalogue.json").read_text())
    knowledge = json.loads((Path(__file__).parent / "product-knowledge.json").read_text())['products']
    return [{**p, **knowledge.get(p['id'], {})} for p in base]

def load():
    global model, tokenizer
    from mlx_lm import load as mlx_load
    import os
    from huggingface_hub import snapshot_download
    config = json.loads((Path(__file__).parent / 'assistant-model.json').read_text())
    if config['repo'] != MODEL_ID:
        raise RuntimeError('Assistant model configuration mismatch')
    path = snapshot_download(MODEL_ID, revision=config['revision'], cache_dir=os.environ['HF_HUB_CACHE'], local_files_only=True, allow_patterns=['*.json','*.safetensors','*.jinja','*.txt','*.model'])
    model, tokenizer = mlx_load(path)

def completion(system, user, cancel, tokens=90, temperature=.85, history=None):
    from mlx_lm import stream_generate
    from mlx_lm.sample_utils import make_sampler
    if cancel.is_set():
        return ""
    messages = [{'role':'system','content':system}]
    messages.extend({'role':t['role'],'content':t['text']} for t in (history or [])[-12:])
    messages.append({'role':'user','content':user})
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True, enable_thinking=False)
    text = ""
    for chunk in stream_generate(model, tokenizer, prompt, max_tokens=tokens, sampler=make_sampler(temp=temperature, top_p=.9)):
        if cancel.is_set():
            return ""
        text += chunk.text
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S).strip().strip('"')
    return text

def facts(p):
    return f"{p['name']} offers {p['battery']} hours of battery life. " + ("Noise cancellation is included. " if p['anc'] else "Active noise cancellation is not included. ") + f"The demo price is {p['price']} rupees."

def invitation(product_id, cancel):
    p = next((p for p in products() if p['id']==product_id), None)
    if not p:
        raise ValueError("Unknown product")
    start = time.perf_counter()
    previous = list(recent[product_id])
    system = "You are a friendly audio shopping guide. Write ONE short inviting question, 8 to 18 words. No product specifications, numbers, promises, markdown, or explanations. Vary your wording. End with a question mark."
    themes = ["listening mood", "daily routine", "favourite music", "comfort", "finding a personal fit"]
    opening = completion(system, f"Product: {p['name']}, category: {p['category']}. Theme: {random.choice(themes)}. Previous questions to avoid: {json.dumps(previous)}", cancel, tokens=45)
    valid = 5 <= len(opening.split()) <= 25 and opening.endswith('?') and not re.search(r"\d|<|\n|battery|hours|waterproof|cancellation|price", opening, re.I) and opening not in previous
    source = "qwen"
    if not valid:
        options = [f"What kind of listening moment would you choose {p['name']} for?", f"Shall we explore how {p['name']} could fit into your day?", f"Want a closer look at what makes {p['name']} different?", f"Is {p['name']} catching your eye for your next listening session?", f"Curious to find your own rhythm with {p['name']}?", f"Would you like to get to know {p['name']} a little better?", f"Thinking about making {p['name']} part of your everyday listening?"]
        opening = random.choice([o for o in options if o not in previous] or options)
        source = "varied-fallback"
    if not cancel.is_set():
        recent[product_id].append(opening)
    return {"opening":opening, "text":opening+" "+facts(p), "source":source, "generation_seconds":round(time.perf_counter()-start,3)}

def chat(query, history, cart, cancel, current_product_id=None):
    from advisor import advise
    catalogue = products()
    known = {p['id'] for p in catalogue}
    cart = [i for i in cart if i['productId'] in known]
    return advise(query, history, cart, cancel, catalogue, completion, current_product_id)
