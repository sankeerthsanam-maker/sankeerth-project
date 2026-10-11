import type { Product } from "../../../../packages/shared/src/types/product";
export function ProductStory({ product }: { product: Product }) {
    return <section className="pdp-story" id="product-overview"><div><div className="eyebrow">LESS DISTRACTION. MORE CONNECTION.</div><h2>For your world.<br /><em>And everything in it.</em></h2><p>{product.description}</p><span className="pdp-story-signature">Good sound. Beautifully simple. — sankee®</span></div><div className="pdp-story-image"><img src={product.image} alt={`A closer look at ${product.name}`} loading="lazy" /><span>{product.name} / {product.color}</span></div></section>;
}
