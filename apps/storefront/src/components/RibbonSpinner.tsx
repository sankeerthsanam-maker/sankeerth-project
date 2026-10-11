import { useEffect, useRef } from "react";

type Props = { label?: string; duration?: number };
const smooth = (n: number) => { const v = Math.max(0, Math.min(1, n)); return v * v * (3 - 2 * v); };

/** A depth-sorted ribbon: flowing infinity, rotating fold, then a settled O. */
export function RibbonSpinner({ label = "Loading", duration = 5800 }: Props) {
    const canvas = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const element = canvas.current;
        const context = element?.getContext("2d");
        if (!element || !context) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        element.width = 480 * ratio;
        element.height = 230 * ratio;
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const start = performance.now();
        let frame = 0;
        function draw(now: number) {
            const progress = motion.matches ? 1 : Math.min((now - start) / duration, 1);
            const fold = smooth((progress - .35) / .55);
            const settle = smooth((progress - .83) / .17);
            const time = (now - start) / 1000;
            const spin = Math.sin(fold * Math.PI) * 2.5;
            const phase = time * 1.65 * (1 - settle);
            function point(t: number) {
                const waveX = 183 * Math.cos(t);
                const waveY = 42 * Math.sin(2 * t + phase * .7);
                const waveZ = 38 * Math.sin(t + phase);
                let x = waveX * (1 - fold) + 73 * Math.cos(t) * fold;
                const y = waveY * (1 - fold) + 73 * Math.sin(t) * fold;
                let z = waveZ * (1 - fold);
                const rotatedX = x * Math.cos(spin) + z * Math.sin(spin);
                z = -x * Math.sin(spin) + z * Math.cos(spin);
                x = rotatedX;
                const perspective = 600 / (600 - z);
                return { x: 240 + x * perspective, y: 115 + y * perspective, z,
                    width: (2 + 12 * Math.abs(Math.cos(t * 1.5 + phase))) * (1 - settle) + 7 * settle,
                    light: .5 + .5 * Math.cos(t + phase) };
            }
            const segments = Array.from({ length: 240 }, (_, index) => {
                const a = point(index / 240 * Math.PI * 2);
                const b = point((index + 1) / 240 * Math.PI * 2);
                const dx = b.x - a.x, dy = b.y - a.y;
                const length = Math.hypot(dx, dy) || 1;
                return { a, b, nx: -dy / length, ny: dx / length, depth: (a.z + b.z) / 2 };
            }).sort((a, b) => a.depth - b.depth);
            context!.setTransform(ratio, 0, 0, ratio, 0, 0);
            context!.clearRect(0, 0, 480, 230);
            for (const { a, b, nx, ny } of segments) {
                const shade = Math.round(99 + a.light * 49 * (1 - settle));
                context!.fillStyle = `rgba(${shade - 12},${shade + 8},${shade - 22},${.55 + .4 * a.light * (1 - settle)})`;
                context!.beginPath();
                context!.moveTo(a.x + nx * a.width / 2, a.y + ny * a.width / 2);
                context!.lineTo(b.x + nx * b.width / 2, b.y + ny * b.width / 2);
                context!.lineTo(b.x - nx * b.width / 2, b.y - ny * b.width / 2);
                context!.lineTo(a.x - nx * a.width / 2, a.y - ny * a.width / 2);
                context!.closePath();
                context!.fill();
            }
            if (progress < 1) frame = requestAnimationFrame(draw);
        }
        frame = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(frame);
    }, [duration]);
    return <div className="ribbon-spinner" role="status" aria-live="polite"><canvas ref={canvas} aria-hidden="true" /><span className="visually-hidden">{label}</span></div>;
}
