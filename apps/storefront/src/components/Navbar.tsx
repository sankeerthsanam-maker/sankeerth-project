import { Icon } from "../../../../packages/widget/src/components/Icon";
import { Button } from "../../../../packages/widget/src/components/Button";

export function Navbar({cartCount, setCategory, onOpenBag}: {cartCount:number; setCategory:(category:string)=>void; onOpenBag:()=>void}) {
    return (
<nav className="navigation">
                        <a className="wordmark" href="#">
                            sankee<span>®</span>
                        </a>
                        <div className="nav-links">
                            <a href="#collection" onClick={() => setCategory("All sound")}>Shop all</a>
                            <Button
                                onClick={() => {
                                    setCategory("Headphones");
                                    document
                                        .getElementById("collection")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                }}
                            >
                                Headphones
                            </Button>
                            <Button
                                onClick={() => {
                                    setCategory("Earbuds");
                                    document
                                        .getElementById("collection")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                }}
                            >
                                Earbuds
                            </Button>
                            <Button
                                onClick={() => {
                                    setCategory("Speakers");
                                    document
                                        .getElementById("collection")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                }}
                            >
                                Speakers
                            </Button>
                        </div>
                        <Button
                            className="bag-button"
                            onClick={onOpenBag}
                            aria-label="Open shopping bag"
                        >
                            <Icon name="bag" />
                            <span>Bag ({cartCount})</span>
                        </Button>
                    </nav>
    );
}
