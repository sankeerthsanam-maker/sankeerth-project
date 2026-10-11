type SpinnerProps = { label?: string; size?: number; variant?: "ring" | "orbit" };

export function Spinner({ label = "Loading", size = 36, variant = "ring" }: SpinnerProps) {
    return (
        <span className={"spinner-status spinner-" + variant} role="status" aria-live="polite">
            {variant === "orbit" ? (
                <span className="os-orbit" style={{ width: size, height: size }} aria-hidden="true">
                    <svg viewBox="0 0 160 160" fill="none">
                        <circle className="os-track" cx="80" cy="80" r="68" />
                        <circle className="os-arc os-arc-outer" cx="80" cy="80" r="68" />
                        <circle className="os-arc os-arc-inner" cx="80" cy="80" r="53" />
                    </svg>
                    <span className="os-core" />
                </span>
            ) : <span className="spinner-ring" style={{ width: size, height: size }} aria-hidden="true" />}
            <span className="visually-hidden">{label}</span>
        </span>
    );
}
