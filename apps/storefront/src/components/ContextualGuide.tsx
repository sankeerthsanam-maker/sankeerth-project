import { useCallback, useEffect, useRef, useState } from "react";
import { products, money } from "../../../../packages/shared/src/mocks/products";
import { Button } from "../../../../packages/widget/src/components/Button";
import { Icon } from "../../../../packages/widget/src/components/Icon";
import { LoadingIndicator } from "../../../../packages/widget/src/components/LoadingIndicator";
import { requestInvitation, type ProductInvitation } from "../../../../packages/widget/src/services/localAssistant";
import { generateSpeech } from "../../../../packages/widget/src/services/localSpeech";
export function useContextualGuide(){
    const [productId,setProductId]=useState<string|null>(null);const [enabled,setEnabled]=useState(false);const [status,setStatus]=useState('');
    const [insights,setInsights]=useState<Record<string,ProductInvitation>>({});const [thinking,setThinking]=useState(false);const [voiceLoading,setVoiceLoading]=useState(false);
    const controller=useRef<AbortController|null>(null);const speechController=useRef<AbortController|null>(null);const context=useRef<AudioContext|null>(null);const source=useRef<AudioBufferSourceNode|null>(null);
    const target=useRef<string|null>(null);const shown=useRef<string|null>(null);const current=useRef<ProductInvitation|null>(null);const version=useRef(0);const enabledRef=useRef(false);const mounted=useRef(true);const played=useRef(-1);const visible=useRef(false);
    const stopAudio=useCallback(()=>{speechController.current?.abort();source.current?.stop();source.current=null;if(mounted.current)setVoiceLoading(false)},[]);
    const cancel=useCallback(()=>{version.current++;controller.current?.abort();stopAudio();target.current=null;if(mounted.current){setThinking(false);setStatus('')}},[stopAudio]);
    async function narrate(text:string,token:number,label='Reading product details…'){
        if(!enabledRef.current||!context.current||played.current===token)return;
        played.current=token;stopAudio();const abort=new AbortController();speechController.current=abort;setVoiceLoading(true);setStatus('Preparing your voice response…');const timer=setTimeout(()=>abort.abort(),45000);
        try{const blob=await generateSpeech(text,abort.signal);const audio=await context.current.decodeAudioData(await blob.arrayBuffer());if(token!==version.current||abort.signal.aborted||!enabledRef.current||!mounted.current)return;await context.current.resume();if(token!==version.current)return;const node=context.current.createBufferSource();node.buffer=audio;node.connect(context.current.destination);node.onended=()=>{if(source.current===node){source.current=null;if(mounted.current)setStatus('')}};window.dispatchEvent(new Event('sankee:guide-start'));source.current=node;node.start();setVoiceLoading(false);setStatus(label);}
        catch(e){if(token===version.current&&!abort.signal.aborted&&mounted.current){setVoiceLoading(false);setStatus(e instanceof Error?e.message:'Voice unavailable.')}}finally{clearTimeout(timer);if(token===version.current&&mounted.current){setVoiceLoading(false);if(abort.signal.aborted)setStatus("Voice took too long. Please try replaying.")}}
    }
    const prepare=useCallback((id:string)=>{
        cancel();if(visible.current)setProductId(id);target.current=id;current.current=null;const token=version.current;setThinking(true);const abort=new AbortController();controller.current=abort;const timer=setTimeout(()=>abort.abort(),30000);
        requestInvitation(id,abort.signal).then(reply=>{if(token!==version.current||!mounted.current)return;current.current=reply;setInsights(items=>({...items,[id]:reply}));setThinking(false);window.dispatchEvent(new CustomEvent("sankee:product-ready",{detail:id}));if(shown.current===id)void narrate(reply.text,token);}).catch(e=>{if(token!==version.current||!mounted.current)return;setThinking(false);window.dispatchEvent(new CustomEvent("sankee:product-ready",{detail:id}));setStatus(abort.signal.aborted?'The guide took too long. Try again.':e.message);}).finally(()=>clearTimeout(timer));
    },[cancel]);
    useEffect(()=>{mounted.current=true;function focus(e:Event){if(!visible.current)return;cancel();shown.current=null;current.current=null;setProductId((e as CustomEvent<string>).detail);setThinking(true)}function pending(e:Event){prepare((e as CustomEvent<string>).detail)}function chatStarted(){cancel()}window.addEventListener('sankee:product-focus',focus);window.addEventListener('sankee:product-prepare',pending);window.addEventListener('sankee:voice-start',chatStarted);window.addEventListener('sankee:welcome-start',chatStarted);return()=>{mounted.current=false;cancel();void context.current?.close();context.current=null;window.removeEventListener('sankee:product-focus',focus);window.removeEventListener('sankee:product-prepare',pending);window.removeEventListener('sankee:voice-start',chatStarted);window.removeEventListener('sankee:welcome-start',chatStarted)}},[prepare,cancel]);
    async function toggle(){if(enabledRef.current){enabledRef.current=false;setEnabled(false);stopAudio();setStatus('');return;}try{context.current ||= new AudioContext();await context.current.resume();enabledRef.current=true;setEnabled(true);setStatus('Voice enabled. Linger on a product.');window.dispatchEvent(new Event('sankee:audio-enabled'));}catch{setStatus('Audio could not start. Please try again.')}}
    function preview(id:string|null){if(!id){shown.current=null;cancel();return;}window.dispatchEvent(new CustomEvent("sankee:product-selected",{detail:id}));visible.current=true;shown.current=id;setProductId(id);if(target.current!==id)prepare(id);else if(current.current)void narrate(current.current.text,version.current);}
    function dismiss(){visible.current=false;cancel();shown.current=null;setProductId(null)}
    return {productId,enabled,status,insights,thinking,voiceLoading,toggle,preview,dismiss,pauseNarration:()=>{stopAudio();setStatus('')},speakReply:async(text:string)=>{played.current=-1;await narrate(text,version.current,'Speaking your answer…')},replay:()=>{if(current.current){played.current=-1;void narrate(current.current.text,version.current)}}};
}

import type { Cart } from "../../../../packages/widget/src/features/cart/useCart";
import { useProductVoiceAssistant } from "../../../../packages/widget/src/features/voice/useProductVoiceAssistant";
import { ProductVoiceButton, ProductVoiceConversation } from "./ProductVoiceAssistant";
import { useProductGuidePosition } from "./useProductGuidePosition";

export function ContextualGuide({guide,onAdd,cart,onCart}:{guide:ReturnType<typeof useContextualGuide>;onAdd:(id:string)=>void;cart:Cart;onCart:(step?:"cart"|"checkout")=>void}) {
    const [introducing,setIntroducing]=useState(false);
    useEffect(()=>{function stage(e:Event){setIntroducing((e as CustomEvent<string|null>).detail==="guide")}window.addEventListener("sankee:welcome-stage",stage);return()=>window.removeEventListener("sankee:welcome-stage",stage)},[]);
    const position=useProductGuidePosition(guide.productId);
    const product=products.find(p=>p.id===guide.productId);
    const productVoice=useProductVoiceAssistant(guide.productId,guide.enabled,cart,onCart,guide.speakReply);
    useEffect(()=>{function escape(event:KeyboardEvent){if(event.key==='Escape')guide.dismiss();}window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[guide.dismiss]);
    return <>
        <div className="context-guide-control">{introducing&&<div className="guide-welcome-bubble" role="status">Enable sound guide for spoken product details.</div>}<Button className={(guide.enabled?'guide-toggle enabled':'guide-toggle')+(introducing?' guide-introducing':'')} onClick={()=>void guide.toggle()} aria-pressed={guide.enabled}><Icon name="sound" size={16}/>{guide.enabled?'Sound guide on':'Enable sound guide'}</Button>{guide.status&&<span role="status">{guide.status}</span>}</div>
        {product&&<aside ref={position.panelRef} style={position.style} className="product-insight" role="dialog" aria-modal="false" aria-labelledby="insight-title">
            <header><div className="window-dots" aria-hidden="true"><i/><i/><i/></div><span>YOUR SOUND GUIDE</span><div className="insight-header-actions">{guide.enabled&&product&&<ProductVoiceButton assistant={productVoice} productName={product.name} disabled={guide.thinking||guide.voiceLoading}/>}<Button className="icon-button" aria-label="Dismiss product details" onClick={guide.dismiss}><Icon name="close" size={16}/></Button></div></header>
            {guide.thinking?<div className="insight-detail-loading" aria-busy="true"><span className="spark-orb"><Icon name="spark"/></span><h2 id="insight-title">Getting to know {product.name}…</h2><LoadingIndicator label="Loading product details…"/></div>:<>
            <div className="insight-intro"><span className="spark-orb"><Icon name="spark"/></span><p>{guide.insights[product.id]?.opening || 'Want to take a closer look?'}</p></div>
            <div className="insight-product"><img src={product.image} alt={product.name}/><div><p>{product.category}</p><h2 id="insight-title">{product.name}</h2><strong>{money(product.price)}</strong></div></div>
            <p className="insight-description">{product.description}</p>
            <div className="insight-facts"><span><strong>{product.battery}h</strong>Battery life</span><span><strong>{product.anc?'Included':'Not included'}</strong>Noise cancellation</span></div>
            </>}
            {guide.enabled&&<ProductVoiceConversation assistant={productVoice} generating={guide.voiceLoading&&!!productVoice.answer} speaking={guide.status==='Speaking your answer…'} onStop={guide.pauseNarration}/>}
            {guide.voiceLoading&&!productVoice.answer&&<div className="insight-voice-loading"><LoadingIndicator label="Preparing your voice response…"/></div>}{!guide.thinking&&<div className="insight-actions"><Button variant="primary" onClick={()=>onAdd(product.id)}>Add to bag <Icon name="bag" size={16}/></Button>{guide.enabled&&<Button className="icon-button" onClick={guide.replay} aria-label="Replay product narration"><Icon name="sound"/></Button>}</div>}
        </aside>}
    </>;
}
