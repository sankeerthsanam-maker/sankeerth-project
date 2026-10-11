"""Verify real local named-product tools, including non-action requests."""
import json,time,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[1]
endpoint='http://127.0.0.1:8000/api/voice/'
for _ in range(45):
    try:
        if json.load(urllib.request.urlopen(endpoint+'health',timeout=1))['ready']:break
    except OSError:pass
    time.sleep(1)
else:raise RuntimeError('Server startup did not finish')
cases=[('add air one in the cart','add',1),('please put two Air One in my bag','add',2),("don't add Air One",None,None),('how do I add Air One?',None,None),('can I add Air One?',None,None),('please buy Air One','checkout',1)]
results=[]
for query,expected,quantity in cases:
    start=time.perf_counter()
    body={'message':query,'cart':[{'productId':'air','quantity':1}] if expected=='checkout' else [],'history':[]}
    req=urllib.request.Request(endpoint+'chat',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
    reply=json.load(urllib.request.urlopen(req,timeout=45))
    action=reply.get('action')
    passed=(action is None) if expected is None else bool(action and action['type']==expected and action.get('productId')=='air' and action.get('quantity')==quantity)
    if expected=='checkout':passed=passed and action.get('addProduct') is False
    results.append({'query':query,'reply':reply,'seconds':round(time.perf_counter()-start,2),'passed':passed})
    (root/'artifacts/reports/named-cart-verification.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results[-1]),flush=True)
assert all(result['passed'] for result in results),'Named cart checks failed; see report'
print('All six named-cart checks passed.',flush=True)
