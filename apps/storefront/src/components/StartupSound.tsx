import { useEffect, useRef, useState } from "react";
import { Button } from "../../../../packages/widget/src/components/Button";
import { Icon } from "../../../../packages/widget/src/components/Icon";
import startupSound from "../sounds/haruudu-a-polished-modern-futuristic-logo-sound-intro-for-a-tech-startup-535508.mp3";

/** One quiet, animation-synchronised clip; never replay after the loader exits. */
export function StartupSound({ active, duration = 6400 }: { active: boolean; duration?: number }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const playRef = useRef<() => void>(() => {});
    const [status, setStatus] = useState<"idle" | "blocked" | "playing" | "muted">("idle");

    useEffect(() => {
        const audio = audioRef.current;
        if (!active || !audio || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let disposed = false;
        const started = performance.now();
        const volume = .3;
        function stop() { audio!.pause(); }
        async function play() {
            if (disposed || performance.now() - started >= duration) return;
            audio!.volume = volume;
            try {
                // A permission click joins the current animation rather than replaying from zero.
                if (Number.isFinite(audio!.duration)) audio!.currentTime = (performance.now() - started) / 1000;
                await audio!.play();
                if (disposed) stop();
                else setStatus("playing");
            } catch {
                if (!disposed) setStatus("blocked");
            }
        }
        playRef.current = () => { void play(); };
        audio.volume = volume;
        void play();
        const fade = window.setInterval(() => {
            const elapsed = performance.now() - started;
            audio.volume = volume * Math.max(0, Math.min(1, (duration - elapsed) / 800));
            if (elapsed >= duration) stop();
        }, 40);
        window.addEventListener("sankee:landing-ready", stop);
        return () => {
            disposed = true;
            clearInterval(fade);
            window.removeEventListener("sankee:landing-ready", stop);
            stop();
            playRef.current = () => {};
        };
    }, [active, duration]);

    if (!active) return null;
    return <>
        <audio ref={audioRef} src={startupSound} preload="auto" aria-hidden="true" />
        {(status === "blocked" || status === "playing") && <Button
            className="startup-sound-control"
            onClick={() => {
                if (status === "playing") { audioRef.current?.pause(); setStatus("muted"); }
                else playRef.current();
            }}
            aria-label={status === "playing" ? "Mute startup sound" : "Play startup sound"}
        ><Icon name="sound" /><span>{status === "playing" ? "Sound on" : "Play sound"}</span></Button>}
    </>;
}
