import { Button } from "../../../../packages/widget/src/components/Button";
import { Icon } from "../../../../packages/widget/src/components/Icon";
import { LoadingIndicator } from "../../../../packages/widget/src/components/LoadingIndicator";
import type { useProductVoiceAssistant } from "../../../../packages/widget/src/features/voice/useProductVoiceAssistant";
type Assistant = ReturnType<typeof useProductVoiceAssistant>;

export function ProductVoiceButton({ assistant, productName, disabled }: { assistant: Assistant; productName: string; disabled: boolean }) {
    return <Button className={"icon-button product-voice-mic" + (assistant.listening ? " listening" : "")}
        disabled={disabled || assistant.busy || assistant.generating}
        aria-label={assistant.listening ? "Stop product voice input" : `Ask about ${productName} by voice`}
        aria-pressed={assistant.listening} onClick={assistant.listen}>
        <Icon name="mic" size={17} />
    </Button>;
}

export function ProductVoiceConversation({ assistant, generating=false, speaking=false, onStop }: { assistant: Assistant; generating?:boolean; speaking?:boolean; onStop?:()=>void }) {
    const error = assistant.requestError || assistant.error;
    return <section className="product-voice-conversation" aria-label="Product voice conversation" aria-live="polite">
        {assistant.listening ? <div className="product-voice-listening" role="status"><Icon name="mic" size={15} /><span>Listening… ask about this product.</span></div> : !assistant.transcript && !error ? <p className="product-voice-hint">Tap the microphone to ask about this product, add it to your bag, or open checkout.</p> : null}
        {assistant.transcript && <p className="product-voice-transcript"><span>You said</span>{assistant.transcript}</p>}
        {assistant.busy && <LoadingIndicator label="Thinking about this product…" />}
        {assistant.answer && <p className="product-voice-answer">{assistant.answer}</p>}
        {(assistant.generating||generating) && <LoadingIndicator label="Preparing your spoken answer…" />}
        {(assistant.speaking||speaking) && <div className="product-voice-playing"><span>Speaking your answer…</span><Button className="text-button" onClick={onStop||assistant.stop}>Stop</Button></div>}
        {error && <p className="product-voice-error" role="status">{error}</p>}
    </section>;
}
