export function panelPosition(x:number,y:number,width:number,height:number,viewportWidth:number,viewportHeight:number) {
    const margin=16, gap=18, bottomReserve=90;
    const right=x+gap, left=x-gap-width;
    const preferred=right+width<=viewportWidth-margin?right:left;
    return {
        left:Math.max(margin,Math.min(preferred,viewportWidth-width-margin)),
        top:Math.max(margin,Math.min(y-40,viewportHeight-bottomReserve-height)),
    };
}
