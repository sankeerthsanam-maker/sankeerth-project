export type AdvisorState={preferences:{budget:number|null;category:"Headphones"|"Earbuds"|"Speakers"|null;anc:boolean|null;useCase:string|null};focusedProductId:string|null};
export type AssistantTurn = {role:"user"|"assistant";text:string;ids?:string[];recommendedId?:string|null;advisorState?:AdvisorState};
export type AssistantReply = {text:string;ids:string[];recommendedId?:string|null;advisorState?:AdvisorState;source:string;action?:{type:"add"|"cart"|"checkout";productId?:string;quantity?:number;addProduct?:boolean}};
export type ProductInvitation = {opening:string;text:string;source:string};
async function post<T>(path:string,body:unknown,signal:AbortSignal):Promise<T>{
    const response=await fetch('/api/voice/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
    if(!response.ok)throw new Error(response.status===429?'The guide is busy. Please try again.':'Start the local AI server to use your sound guide.');
    return response.json();
}
export const requestInvitation=(productId:string,signal:AbortSignal)=>post<ProductInvitation>('hover',{productId},signal);
export const requestChat=(message:string,history:AssistantTurn[],signal:AbortSignal,cart:{productId:string;quantity:number}[]=[],currentProductId?:string)=>post<AssistantReply>('chat',{message,history,cart,currentProductId},signal);
