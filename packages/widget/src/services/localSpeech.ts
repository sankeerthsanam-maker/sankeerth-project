export const GUIDE_WELCOME = "Enable sound guide to hear product details as you explore.";
export const WELCOME = "Hi, I'm your sound guide. Tap Find your sound. I'll help you choose.";
/** Same-origin API: Vite proxies in development; local server serves production. */
export async function generateSpeech(text: string, signal: AbortSignal): Promise<Blob> {
    const welcome = text === WELCOME;
    const response = await fetch(welcome ? "/api/voice/welcome" : "/api/voice/speech", welcome ? { signal } : {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }), signal,
    });
    if (!response.ok) throw new Error(response.status === 429 ? "Voice is busy. Please try again." : "Start the local Kokoro service to hear responses.");
    if (!response.headers.get("content-type")?.includes("audio/wav")) throw new Error("Local voice service is unavailable.");
    return response.blob();
}
