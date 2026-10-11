import type { Product } from "../../../../packages/shared/src/types/product";
import { ProductCard } from "../../../../packages/widget/src/components/ProductCard";
import { Icon } from "../../../../packages/widget/src/components/Icon";
import { Button } from "../../../../packages/widget/src/components/Button";

export function ProductCollection({filtered, category, setCategory, search, setSearch, sort, setSort, onAdd, onPreview}: {filtered:Product[];category:string;setCategory:(value:string)=>void;search:string;setSearch:(value:string)=>void;sort:string;setSort:(value:string)=>void;onAdd:(id:string)=>void;onPreview?:(id:string|null)=>void}) {
    return (
<section id="collection" className="collection">
                            <div className="collection-heading">
                                <div className="eyebrow">THE COLLECTION</div>
                                <div>
                                    <h2>Find your frequency.</h2>
                                    <p>
                                        Different ways to listen. One
                                        uncompromising standard.
                                    </p>
                                </div>
                            </div>
                            <div className="catalogue-toolbar">
                                <div
                                    className="tabs"
                                    aria-label="Product categories"
                                >
                                    {[
                                        "All sound",
                                        "Headphones",
                                        "Earbuds",
                                        "Speakers",
                                    ].map((c) => (
                                        <Button
                                            key={c}
                                            className={
                                                c === category ? "chosen" : ""
                                            }
                                            aria-pressed={c === category}
                                            onClick={() => setCategory(c)}
                                        >
                                            {c}
                                        </Button>
                                    ))}
                                </div>
                                <div className="catalogue-controls">
                                    <label className="search">
                                        <Icon name="search" size={17} />
                                        <input
                                            aria-label="Search products"
                                            placeholder="Find your favourite"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                        />
                                    </label>
                                    <select
                                        aria-label="Sort products"
                                        value={sort}
                                        onChange={(e) =>
                                            setSort(e.target.value)
                                        }
                                    >
                                        <option value="featured">
                                            Featured
                                        </option>
                                        <option value="low">
                                            Price: low to high
                                        </option>
                                        <option value="high">
                                            Price: high to low
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="results-count">
                                {filtered.length} thoughtfully crafted products
                            </div>
                            <div className="product-grid">
                                {filtered.map((p) => (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                        detailHref={`#/product/${p.id}`}
                                        onAdd={onAdd}
                                        onPreview={onPreview}
                                    />
                                ))}
                            </div>
                            {!filtered.length && (
                                <div className="empty">
                                    <h3>No matches just yet.</h3>
                                    <Button
                                        className="text-button"
                                        onClick={() => {
                                            setSearch("");
                                            setCategory("All sound");
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                        </section>
    );
}
