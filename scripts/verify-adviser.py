"""Run realistic local conversations; save observed replies separately from unit tests."""
import json,time,urllib.request,sys,threading,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
results=[]
failures=[]
def check(condition, label):
    if not condition:
        failures.append(label)
        print('FAILED: '+label,flush=True)
direct='--direct' in sys.argv
if direct:
    sys.path.insert(0,str(root/'apps/voice-service'))
    import assistant
    if assistant.model is None:assistant.load()
def request(message, history=None, page=None):
    start=time.perf_counter()
    body={'message':message,'history':history or [],'cart':[],'currentProductId':page}
    req=urllib.request.Request('http://127.0.0.1:8000/api/voice/chat',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
    reply=assistant.chat(message,history or [],[],threading.Event(),page) if direct else json.load(urllib.request.urlopen(req,timeout=45))
    results.append({'message':message,'reply':reply,'seconds':round(time.perf_counter()-start,2)})
    (root/'artifacts/reports/conversational-adviser-verification.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results[-1]),flush=True)
    return reply

def turns(history,query,reply):
    return history+[{'role':'user','text':query},{'role':'assistant',**{k:reply[k] for k in ('text','ids','recommendedId','advisorState') if k in reply}}]
if not direct:
    for _ in range(45):
        try:
            health=json.load(urllib.request.urlopen('http://127.0.0.1:8000/api/voice/health',timeout=1))
            if health['ready']:break
        except OSError:pass
        time.sleep(1)
    else:raise RuntimeError('Local adviser startup not complete')
    assert health['assistant_model']=='mlx-community/Qwen3-1.7B-4bit'
r=request('how do i oder');check(not r['ids'] and 'action' not in r and 'checkout' in r['text'].lower(), "not r['ids'] and 'action' not in r and 'checkout' in r['text'].lower()")
r=request('I want earbuds under 7000 but without noise cancellation');check(r['ids']==['air-sport'] and 'action' not in r and r['source']=='qwen-adviser', "r['ids']==['air-sport'] and 'action' not in r and r['source']=='qwen-adviser'")
r=request('is this good for me?',page='halo');check('?' in r['text'] and 'action' not in r, "'?' in r['text'] and 'action' not in r")
q='I ride a noisy train every day and listen to music. My budget is 20000. What suits me?'
h=[];r=request(q,h);h=turns(h,q,r);check('halo' in r['ids'], "'halo' in r['ids']")
q='tell me more about that one';r=request(q,h);h=turns(h,q,r);check('halo' in r['ids'], "'halo' in r['ids']")
q='would it connect to my Mac?';r=request(q,h);h=turns(h,q,r);check(re.search(r"not(?:\s+\w+){0,2}\s+(?:documented|confirmed|specified|verified)|can't confirm|cannot confirm|unknown|unconfirmed|don't have",r['text'].lower().replace('’',"'")), 're.search(r"not(?:\\s+\\w+){0,2}\\s+(?:documented|confirmed|specified|verified)|can\'t confirm')
q='Actually something cheaper, earbuds under 7000, without cancellation please';r=request(q,h);h=turns(h,q,r);check(r['ids']==['air-sport'], "r['ids']==['air-sport']")
q='could you pop the one you suggested into my bag please';r=request(q,h);h=turns(h,q,r);check(r.get('action',{}).get('productId')=='air-sport' and r['action']['type']=='add', "r.get('action',{}).get('productId')=='air-sport' and r['action']['type']=='add'")
r=request("wait don't buy it, not yet",h);check('action' not in r, "'action' not in r")
(root/'artifacts/reports/adviser-check-status.json').write_text(json.dumps({'model':health['assistant_model'] if not direct else assistant.MODEL_ID,'failures':failures},indent=2))
if failures:raise RuntimeError(f'{len(failures)} conversational checks failed')
print('All conversational checks passed.',flush=True)
