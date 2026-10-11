import { useEffect, useRef, useState } from "react";
import { useVoice } from "./useVoice";
import { requestChat, type AssistantTurn } from "../../services/localAssistant";
import { applyShoppingAction } from "../../services/shoppingActions";
import type { Cart } from "../cart/useCart";

export function useProductVoiceAssistant(productId: string | null, enabled: boolean, cart: Cart, onCart: (step?: "cart" | "checkout") => void, speakReply: (text: string) => Promise<void>) {
    const [busy, setBusy] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [answer, setAnswer] = useState("");
    const [error, setError] = useState("");
    const history = useRef<AssistantTurn[]>([]);
    const controller = useRef<AbortController | null>(null);
    const generation = useRef(0);
    const busyRef = useRef(false);
    const voice = useVoice(send, true);

    useEffect(() => {
        generation.current++;
        controller.current?.abort();
        voice.stop();
        voice.stopListening();
        history.current = [];
        busyRef.current = false;
        setBusy(false); setTranscript(""); setAnswer(""); setError("");
        return () => {
            generation.current++;
            controller.current?.abort();
            voice.stop(); voice.stopListening();
        };
    }, [productId, enabled]);

    async function send(text: string) {
        const query = text.trim();
        if (!query || !enabled || !productId || busyRef.current) return;
        voice.stopListening(); voice.stop();
        busyRef.current = true; setBusy(true); setError("");
        setTranscript(query); setAnswer("");
        window.dispatchEvent(new Event("sankee:voice-start"));
        const token = generation.current;
        const abort = new AbortController(); controller.current = abort;
        const timeout = setTimeout(() => abort.abort(), 45000);
        try {
            const reply = await requestChat(query, history.current.slice(-12), abort.signal, cart.items, productId);
            if (token !== generation.current || abort.signal.aborted) return;
            if (reply.action) applyShoppingAction(reply.action, cart, onCart);
            history.current = [...history.current, { role: "user" as const, text: query }, { role: "assistant" as const, text: reply.text, ids: reply.ids, recommendedId: reply.recommendedId, advisorState: reply.advisorState }].slice(-12);
            setAnswer(reply.text); setBusy(false);
            await speakReply(reply.text);
        } catch (failure) {
            if (token === generation.current) setError(abort.signal.aborted ? "That took too long. Tap the microphone to try again." : failure instanceof Error ? failure.message : "Your product guide is unavailable.");
        } finally {
            clearTimeout(timeout);
            if (token === generation.current) { busyRef.current = false; setBusy(false); }
        }
    }
    function listen() {
        if (busyRef.current) return;
        setError("");
        window.dispatchEvent(new Event("sankee:voice-start"));
        voice.start();
    }
    return { ...voice, listen, busy, transcript, answer, requestError: error };
}
