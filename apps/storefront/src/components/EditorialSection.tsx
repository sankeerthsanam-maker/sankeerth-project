import { products } from "../../../../packages/shared/src/mocks/products";
import { Icon } from "../../../../packages/widget/src/components/Icon";

export function EditorialSection() {
    return (
<section className="editorial">
                            <div>
                                <div className="eyebrow">
                                    A BETTER WAY TO LISTEN
                                </div>
                                <h2>
                                    Your world.
                                    <br />A little more in tune.
                                </h2>
                                <p>
                                    From the first track of your morning to the
                                    last train home, find sound that fits your
                                    life.
                                </p>
                                <a href="#collection" className="text-button">
                                    Explore the collection <Icon name="arrow" />
                                </a>
                            </div>
                            <img
                                src={products[3].image}
                                alt="Headphones for everyday listening"
                                loading="lazy"
                            />
                        </section>
    );
}
