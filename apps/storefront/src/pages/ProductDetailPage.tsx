import type { Product } from "../../../../packages/shared/src/types/product";
import { products } from "../../../../packages/shared/src/mocks/products";
import { ProductCard } from "../../../../packages/widget/src/components/ProductCard";
import { Button } from "../../../../packages/widget/src/components/Button";
import { ProductGallery } from "../components/ProductGallery";
import { ProductPurchase } from "../components/ProductPurchase";
import { ProductStory } from "../components/ProductStory";
import { ProductSpecifications } from "../components/ProductSpecifications";

export function ProductDetailPage({
    product,
    onAdd,
    onPreview,
}: {
    product: Product;
    onAdd: (id: string) => void;
    onPreview: (id: string | null) => void;
}) {
    const related = products
        .filter((p) => p.id !== product.id)
        .sort(
            (a, b) =>
                Number(b.category === product.category) -
                Number(a.category === product.category),
        )
        .slice(0, 3);
    return (
        <main className="product-detail-page">
            <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
                <a href="#collection">All sound</a>
                <span>/</span>
                <span>{product.category}</span>
                <span>/</span>
                <strong>{product.name}</strong>
            </nav>
            <section
                className="pdp-hero"
                aria-label={`${product.name} product details`}
            >
                <ProductGallery product={product} onPreview={onPreview} />
                <ProductPurchase
                    product={product}
                    onAdd={onAdd}
                    onPreview={onPreview}
                />
            </section>
            <nav className="pdp-section-nav" aria-label="Product information">
                <span>{product.name}</span>
                <div>
                    <Button
                        onClick={() =>
                            document
                                .getElementById("product-overview")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        Overview
                    </Button>
                    <Button
                        onClick={() =>
                            document
                                .getElementById("product-specifications")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        Specifications
                    </Button>
                </div>
                <span>Made for your everyday.</span>
            </nav>
            <ProductStory product={product} />
            <ProductSpecifications product={product} />
            <section className="pdp-related">
                <div className="eyebrow">KEEP EXPLORING</div>
                <div className="pdp-related-heading">
                    <h2>
                        Another way to <em>listen.</em>
                    </h2>
                    <a href="#collection">Explore all sound ↗</a>
                </div>
                <div className="product-grid">
                    {related.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            onAdd={onAdd}
                            onPreview={onPreview}
                            detailHref={`#/product/${p.id}`}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}
