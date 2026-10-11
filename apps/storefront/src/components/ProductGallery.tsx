import { useState } from "react";
import type { Product } from "../../../../packages/shared/src/types/product";
import { Button } from "../../../../packages/widget/src/components/Button";
import { DwellPreview } from "../../../../packages/widget/src/components/DwellPreview";

const views = ["Full view", "Closer look", "Material detail"];
export function ProductGallery({ product, onPreview }: { product: Product; onPreview: (id: string | null) => void }) {
    const [view, setView] = useState(0);
    return <div className="pdp-gallery">
        <DwellPreview productId={product.id} onPreview={onPreview} className="pdp-image-stage">
            <span className="pdp-image-tag">{product.tag}</span>
            <img className={`pdp-main-image pdp-view-${view}`} src={product.image} alt={`${product.name} — ${views[view].toLowerCase()}`} fetchPriority="high" />
            <div className="pdp-image-caption"><span>DESIGNED TO FEEL DIFFERENT</span><span>0{view + 1} / 03</span></div>
        </DwellPreview>
        <div className="pdp-gallery-controls" aria-label="Product image views">
            <div>{views.map((label, index) => <Button key={label} className={view === index ? "pdp-thumbnail selected" : "pdp-thumbnail"} aria-label={label} aria-pressed={view === index} onClick={() => setView(index)}><img src={product.image} className={`pdp-view-${index}`} alt="" /></Button>)}</div>
            <p>Every detail. Considered.</p>
        </div>
    </div>;
}
