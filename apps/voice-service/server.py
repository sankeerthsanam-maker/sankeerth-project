"""Local-only website, resident Qwen + Kokoro, one serial inference worker."""
import asyncio
import io
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from pathlib import Path
import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import assistant
from advisor import AdvisorState
from functools import partial

ROOT = Path(__file__).resolve().parents[2]
MODEL_ID = "mlx-community/Kokoro-82M-bf16"
WELCOME = "Hi, I'm your sound guide. Tap Find your sound. I'll help you choose."
executor = ThreadPoolExecutor(max_workers=1)
model = None
welcome_audio = None
pending = 0

def preflight():
    if not ROOT.is_dir() or not Path('/Volumes/EXTERNAL_US').is_mount():
        raise RuntimeError('External project drive unavailable')

def synthesize(text, cancel):
    preflight()
    if cancel.is_set(): return b'',0
    start=time.perf_counter()
    parts=[]
    for result in model.generate(text,voice='af_heart',lang_code='a',speed=1):
        if cancel.is_set(): return b'',0
        parts.append(np.asarray(result.audio).reshape(-1))
    if not parts: raise RuntimeError('No audio generated')
    output=io.BytesIO();sf.write(output,np.concatenate(parts),model.sample_rate,format='WAV',subtype='PCM_16')
    return output.getvalue(),time.perf_counter()-start

def load():
    global model,welcome_audio
    preflight()
    assistant.load()
    from mlx_audio.tts.utils import load_model
    model=load_model(MODEL_ID)
    welcome_audio,_=synthesize(WELCOME,threading.Event())
    assistant.completion('Reply with one word: ready.','Hello',threading.Event(),tokens=4,temperature=0)

@asynccontextmanager
async def lifespan(app):
    await asyncio.get_running_loop().run_in_executor(executor,load)
    yield
    executor.shutdown(wait=True)

app=FastAPI(lifespan=lifespan)

async def job(request, function, *args):
    global pending
    if pending>=4: raise HTTPException(429,'The guide is busy. Please try again shortly.')
    pending+=1;cancel=threading.Event()
    future=asyncio.get_running_loop().run_in_executor(executor,function,*args,cancel)
    try:
        while not future.done():
            await asyncio.wait([future],timeout=.08)
            if await request.is_disconnected():
                cancel.set();raise HTTPException(499,'Request cancelled')
        return await future
    finally:
        cancel.set();pending-=1

class SpeechRequest(BaseModel):
    text:str=Field(min_length=1,max_length=1500)
class HoverRequest(BaseModel):
    productId:str=Field(min_length=1,max_length=40)
class Turn(BaseModel):
    role:str=Field(pattern='^(user|assistant)$')
    text:str=Field(max_length=1000)
    ids:list[str]=Field(default_factory=list,max_length=6)
    recommendedId:str|None=Field(default=None,max_length=40)
    advisorState:AdvisorState|None=None
class BagItem(BaseModel):
    productId:str=Field(max_length=40)
    quantity:int=Field(ge=1,le=1000)
class ChatRequest(BaseModel):
    message:str=Field(min_length=1,max_length=1000)
    history:list[Turn]=Field(default_factory=list,max_length=12)
    currentProductId:str|None=Field(default=None,max_length=40)
    cart:list[BagItem]=Field(default_factory=list,max_length=6)

@app.middleware('http')
async def local_only(request:Request,call_next):
    if request.headers.get('host','').split(':')[0] not in {'localhost','127.0.0.1'}:return Response('Local access only',status_code=403)
    origin=request.headers.get('origin')
    if origin and origin not in {'http://localhost:8000','http://127.0.0.1:8000','http://localhost:5173','http://127.0.0.1:5173'}:return Response('Origin not permitted',status_code=403)
    return await call_next(request)

@app.get('/api/voice/health')
def health():
    return {'ready':model is not None and assistant.model is not None,'voice_model':MODEL_ID,'assistant_model':assistant.MODEL_ID,'resident':True,'pending':pending}

@app.post('/api/voice/hover')
async def hover(body:HoverRequest,request:Request):
    if body.productId not in {p['id'] for p in assistant.products()}:raise HTTPException(404,'Unknown product')
    return await job(request,assistant.invitation,body.productId)

@app.post('/api/voice/chat')
async def chat(body:ChatRequest,request:Request):
    if not body.message.strip():raise HTTPException(422,'Message cannot be blank')
    return await job(request,partial(assistant.chat,current_product_id=body.currentProductId),body.message.strip(),[t.model_dump() for t in body.history],[i.model_dump() for i in body.cart])

@app.get('/api/voice/welcome')
def welcome():
    return Response(welcome_audio,media_type='audio/wav',headers={'Cache-Control':'no-store'})

@app.post('/api/voice/speech')
async def speech(body:SpeechRequest,request:Request):
    if not body.text.strip():raise HTTPException(422,'Text cannot be blank')
    wav,elapsed=await job(request,synthesize,body.text.strip())
    return Response(wav,media_type='audio/wav',headers={'Cache-Control':'no-store','X-Generation-Seconds':f'{elapsed:.3f}'})

if (ROOT/'dist').is_dir():app.mount('/',StaticFiles(directory=ROOT/'dist',html=True),name='storefront')
