import { useEffect, useState, type ReactNode } from "react";
import { BootSequence } from "./BootSequence";
import { StartupSound } from "./StartupSound";

type Props = { children: ReactNode; imageSrc: string; disabled?: boolean };

/** Wait for above-the-fold assets, with a bounded fallback for slow networks. */
export function LandingPageLoader({ children, imageSrc, disabled = false }: Props) {
    const [stage, setStage] = useState(0);
    const [ready, setReady] = useState(disabled);
    const [visible, setVisible] = useState(!disabled);

    useEffect(() => {
        if (disabled) return;
        let cancelled = false;
        let fadeTimer: ReturnType<typeof setTimeout> | undefined;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const stageTimers = [1600, 3400, 5200].map((delay, index) =>
            setTimeout(() => setStage(index + 1), delay)
        );
        let minimumTimer: ReturnType<typeof setTimeout>;
        const minimum = new Promise<void>((resolve) => {
            minimumTimer = setTimeout(resolve, reducedMotion ? 150 : 6400);
        });
        const image = new Image();
        const imageReady = new Promise<void>((resolve) => {
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = imageSrc;
            if (image.complete) resolve();
        });
        const fontsReady = document.fonts?.ready.catch(() => undefined) ?? Promise.resolve();
        let fallbackTimer: ReturnType<typeof setTimeout>;
        const fallback = new Promise<void>((resolve) => {
            fallbackTimer = setTimeout(resolve, 8000);
        });
        Promise.all([minimum, Promise.race([Promise.all([imageReady, fontsReady]), fallback])]).then(() => {
            if (cancelled) return;
            clearTimeout(fallbackTimer);
            setReady(true);
            window.dispatchEvent(new Event("sankee:landing-ready"));
            fadeTimer = setTimeout(() => setVisible(false), reducedMotion ? 0 : 800);
        });
        return () => {
            cancelled = true;
            clearTimeout(fallbackTimer);
            clearTimeout(fadeTimer);
            clearTimeout(minimumTimer);
            stageTimers.forEach(clearTimeout);
            image.onload = null;
            image.onerror = null;
        };
    }, [disabled, imageSrc]);

    return (
        <>
            <div className={"landing-content" + (ready ? " landing-content-ready" : "")} aria-busy={!ready} inert={!ready} style={!ready ? { visibility: "hidden" } : undefined}>
                {children}
            </div>
            {visible && (
                <div className={"landing-loader" + (ready ? " landing-loader-exit" : "")}>
                    <BootSequence stage={stage} ready={ready} />
                    <StartupSound active={!ready} />
                </div>
            )}
        </>
    );
}
