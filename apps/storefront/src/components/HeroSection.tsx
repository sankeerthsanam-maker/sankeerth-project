import { DwellPreview } from "../../../../packages/widget/src/components/DwellPreview";
import { products } from "../../../../packages/shared/src/mocks/products";
import { Icon } from "../../../../packages/widget/src/components/Icon";

export function HeroSection({onPreview}: {onPreview?:(id:string|null)=>void}) {
    return (
<section className="hero">
                            <div className="hero-copy">
                                <div className="eyebrow">
                                    <span /> SOUND, BEAUTIFULLY CONSIDERED
                                </div>
                                <h1>
                                    Less noise.
                                    <br />
                                    More <em>feeling.</em>
                                </h1>
                                <p>
                                    For the songs that stay with you.
                                    <br />
                                    And the moments that deserve better sound.
                                </p>
                                <a className="primary" href="#collection">
                                    Discover your sound <Icon name="arrow" />
                                </a>
                                <div className="hero-note">
                                    <span className="note-line" /> Designed to
                                    tune in. Built to stand out.
                                </div>
                            </div>
                            <DwellPreview className="hero-visual" productId="halo" onPreview={onPreview}>
                                <img
                                    src={products[0].image}
                                    alt="Premium black over-ear headphones"
                                    fetchPriority="high"
                                />
                                <div className="hero-caption">
                                    <span>THE HALO COLLECTION</span>
                                    <strong>A deeper kind of listening.</strong>
                                    <a
                                        href="#/product/halo"
                                        aria-label="View Halo Studio product"
                                    >
                                        <Icon name="arrow" />
                                    </a>
                                </div>
                                <div className="glass-label">
                                    <Icon name="sound" />
                                    <span>
                                        Immersive by design.
                                        <small>
                                            40 hours. Endless possibilities.
                                        </small>
                                    </span>
                                </div>
                            </DwellPreview>
                        </section>
    );
}
