import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { panelPosition } from "../../../../packages/widget/src/components/panelPosition";
type Anchor={productId:string;x:number;y:number};

/** Freeze the trigger point while the panel is open so its controls stay reachable. */
export function useProductGuidePosition(productId:string|null) {
    const panelRef=useRef<HTMLElement|null>(null);
    const candidate=useRef<Anchor|null>(null);
    const [anchor,setAnchor]=useState<Anchor|null>(null);
    const [style,setStyle]=useState<CSSProperties>();
    useLayoutEffect(()=>{
        function remember(event:Event){candidate.current=(event as CustomEvent<Anchor>).detail;}
        function commit(event:Event){if(candidate.current?.productId===(event as CustomEvent<string>).detail)setAnchor({...candidate.current});}
        window.addEventListener("sankee:product-anchor",remember);
        window.addEventListener("sankee:product-focus",commit);
        window.addEventListener("sankee:product-selected",commit);
        return()=>{window.removeEventListener("sankee:product-anchor",remember);window.removeEventListener("sankee:product-focus",commit);window.removeEventListener("sankee:product-selected",commit);};
    },[]);
    useLayoutEffect(()=>{
        const panel=panelRef.current;
        if(!panel||anchor?.productId!==productId){setStyle(undefined);return;}
        function place(){
            if(window.innerWidth<=640){setStyle(undefined);return;}
            const position=panelPosition(anchor!.x,anchor!.y,panel!.offsetWidth,panel!.offsetHeight,window.innerWidth,window.innerHeight);
            setStyle({...position,bottom:"auto"});
        }
        place();const observer=new ResizeObserver(place);observer.observe(panel);
        window.addEventListener("resize",place);
        return()=>{observer.disconnect();window.removeEventListener("resize",place);};
    },[anchor,productId]);
    return {panelRef,style};
}
