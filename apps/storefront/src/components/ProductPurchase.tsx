import { useState } from "react";
import type { Product } from "../../../../packages/shared/src/types/product";
import { money } from "../../../../packages/shared/src/mocks/products";
import { Button } from "../../../../packages/widget/src/components/Button";
import { Icon } from "../../../../packages/widget/src/components/Icon";

const finishNames: Record<string, string> = { "#d8d0bd": "Sand", "#a1aeb0": "Mist", "#303338": "Graphite", "#c6d2ca": "Sage", "#bab0a1": "Stone", "#768d81": "Forest", "#25272c": "Midnight", "#c1c5cb": "Silver", "#eeeae2": "Pearl" };

export function ProductPurchase({ product, onAdd, onPreview }: { product: Product; onAdd: (id: string) => void; onPreview: (id: string | null) => void }) {
    const [color, setColor] = useState(0);
    const [quantity, setQuantity] = useState(1);
    function add() { for (let i = 0; i < quantity; i++) onAdd(product.id); }
    return <div className="pdp-purchase">
        <div className="eyebrow">THE SANKEE {product.category.toUpperCase()} COLLECTION</div>
        <h1>{product.name}<span>Sound that stays with you.</span></h1>
        <p className="pdp-description">{product.description}</p>
        <div className="pdp-price"><strong>{money(product.price)}</strong><span>Demo price · inclusive of taxes</span></div>
        <div className="pdp-option-label"><span>Finish</span><strong>{color === 0 ? product.color : (finishNames[product.colors[color]] || "Alternate finish")}</strong></div>
        <div className="pdp-finishes">{product.colors.map((value, index) => <Button key={value} className={color === index ? "selected" : ""} style={{ backgroundColor: value }} aria-label={`Preview finish ${index + 1}`} aria-pressed={color === index} onClick={() => setColor(index)} />)}</div>
        <p className="pdp-option-note">Finish preview only. Photography and demo bag use the featured finish.</p>
        <div className="pdp-buy-row"><div className="pdp-quantity" aria-label="Quantity"><Button aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity(q => q - 1)}>−</Button><output aria-live="polite">{quantity}</output><Button aria-label="Increase quantity" disabled={quantity === 5} onClick={() => setQuantity(q => q + 1)}>+</Button></div><Button variant="primary" onClick={add}>Add to bag <Icon name="bag" size={18} /></Button></div>
        <div className="pdp-purchase-note"><Icon name="check" size={15} /><span>Mock purchase · no real payment</span></div>
        <div className="pdp-guide-invite"><span className="spark-orb"><Icon name="spark" /></span><div><strong>A little guidance. A better fit.</strong><p>Let your sound guide introduce this one.</p></div><Button aria-label={`Ask about ${product.name}`} onClick={() => onPreview(product.id)}><Icon name="arrow" /></Button></div>
        <div className="pdp-mini-facts"><div><strong>{product.battery}<small>h</small></strong><span>Battery life</span></div><div><strong>{product.anc ? "Tune out." : "Tune in."}</strong><span>{product.anc ? "Noise cancellation included" : "Without active noise cancellation"}</span></div></div>
    </div>;
}
