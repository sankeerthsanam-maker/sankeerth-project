import { RibbonSpinner } from "./RibbonSpinner";

const stages = ["Waking up your space", "Bringing sound into focus", "Preparing your collection", "Ready when you are"];

export function BootSequence({ stage, ready }: { stage: number; ready: boolean }) {
    const label = ready ? "Welcome to Sankee" : stages[stage];
    return (
        <div className="os-boot">
            <div className="os-boot-top"><span>SANKEE</span><span>A PERSONAL SOUND EXPERIENCE</span></div>
            <div className="os-boot-center">
                <div className="os-signature">hello.</div>
                <div className="os-ribbon-shell"><RibbonSpinner label={label} /></div>
                <div className="os-copy"><h2>Sound, closer to you.</h2><p key={label}>{label}<span className="os-ellipsis" aria-hidden="true">{ready ? "." : "…"}</span></p></div>
                <div className="os-stages" aria-hidden="true">{stages.map((_, index) => <span key={index} className={ready || index <= stage ? "lit" : ""} />)}</div>
            </div>
            <div className="os-boot-bottom"><span>DESIGNED TO FEEL DIFFERENT</span><span>01 / SOUND & CONNECTION</span></div>
        </div>
    );
}
