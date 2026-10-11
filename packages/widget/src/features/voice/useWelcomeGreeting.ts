import { useEffect, useRef, useState } from "react";
import { generateSpeech, WELCOME, GUIDE_WELCOME } from "../../services/localSpeech";

const HEARD_KEY = "sankee-welcome-heard";
function isFirstVisit() { try { return !localStorage.getItem(HEARD_KEY); } catch { return true; } }
type Stage = "chat" | "guide" | null;

/** Two preloaded clips introduce the controls in order, with playback-driven animation. */
export function useWelcomeGreeting(embedded: boolean) {
    const [visible, setVisible] = useState(false);
    const [stage, setStage] = useState<Stage>(null);
    const clips = useRef<HTMLAudioElement[]>([]);
    const active = useRef<HTMLAudioElement | null>(null);
    const attempting = useRef(false);
    const preview = import.meta.env.DEV && new URLSearchParams(location.search).has("intro-preview");
    const heard = useRef(!preview && !isFirstVisit());
    const landed = useRef(false);
    const mounted = useRef(true);

    function announce(value: Stage) {
        if (mounted.current) setStage(value);
        window.dispatchEvent(new CustomEvent("sankee:welcome-stage", { detail: value }));
    }
    function stop() {
        active.current?.pause();
        announce(null);
        if (mounted.current && heard.current) setVisible(false);
    }
    function play(index: number) {
        const clip = clips.current[index];
        if (!clip || attempting.current || !mounted.current) return;
        active.current = clip;
        attempting.current = true;
        clip.play().then(() => {
            if (!mounted.current || active.current !== clip || clip.paused) return;
            if (index === 0) {
                heard.current = true;
                window.dispatchEvent(new Event("sankee:welcome-start"));
                try { if (!preview) localStorage.setItem(HEARD_KEY, "1"); } catch { /* Storage may be unavailable. */ }
            }
            announce(index === 0 ? "chat" : "guide");
        }).catch(() => {
            if (index === 1) stop(); // First clip retries after a trusted interaction if autoplay is blocked.
        }).finally(() => { attempting.current = false; });
    }
    function begin() {
        if (!embedded && !heard.current && landed.current) play(0);
    }
    useEffect(() => {
        mounted.current = true;
        if (embedded || heard.current) return;
        const abort = new AbortController();
        const urls: string[] = [];
        // Preparation overlaps the landing animation, so switching clips needs no inference wait.
        Promise.all([generateSpeech(WELCOME, abort.signal), generateSpeech(GUIDE_WELCOME, abort.signal)])
            .then(blobs => {
                if (!mounted.current || abort.signal.aborted) return;
                clips.current = blobs.map((blob, index) => {
                    const url = URL.createObjectURL(blob); urls.push(url);
                    const clip = new Audio(url); clip.preload = "auto";
                    clip.onended = () => index === 0 ? play(1) : stop();
                    clip.onerror = stop;
                    return clip;
                });
                begin();
            }).catch(() => { /* Text invitation remains available when local speech is unavailable. */ });
        function ready() { landed.current = true; setVisible(true); begin(); }
        function interaction(event: Event) { if (event.isTrusted) begin(); }
        window.addEventListener("sankee:landing-ready", ready);
        window.addEventListener("pointerdown", interaction, true);
        window.addEventListener("keydown", interaction, true);
        window.addEventListener("sankee:voice-start", stop);
        window.addEventListener("sankee:guide-start", stop);
        return () => {
            mounted.current = false; abort.abort(); stop();
            clips.current = []; active.current = null; landed.current = false;
            urls.forEach(URL.revokeObjectURL);
            window.removeEventListener("sankee:landing-ready", ready);
            window.removeEventListener("pointerdown", interaction, true);
            window.removeEventListener("keydown", interaction, true);
            window.removeEventListener("sankee:voice-start", stop);
            window.removeEventListener("sankee:guide-start", stop);
        };
    }, [embedded]);
    return { visible, introducing: stage !== null, stage, begin };
}
