import { ContextualGuide, useContextualGuide } from "../components/ContextualGuide";
import { LandingPageLoader } from "../components/LandingPageLoader";
import { AnnouncementBar } from "../components/AnnouncementBar";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { BenefitsBar } from "../components/BenefitsBar";
import { ProductCollection } from "../components/ProductCollection";
import { EditorialSection } from "../components/EditorialSection";
import { Footer } from "../components/Footer";
import { Toast } from "../components/Toast";
import { ProductDetailPage } from "./ProductDetailPage";
import { useEffect, useState } from "react";
import { products } from "../../../../packages/shared/src/mocks/products";
import { useCart } from "../../../../packages/widget/src/features/cart/useCart";
import { CartPanel } from "../../../../packages/widget/src/components/CartPanel";
import { ChatWidget } from "../../../../packages/widget/src/components/ChatWidget";
export function StorefrontPage() {
    const [route, setRoute] = useState(location.hash);
    useEffect(() => {
        function navigate() { setRoute(location.hash); }
        window.addEventListener("hashchange", navigate);
        return () => window.removeEventListener("hashchange", navigate);
    }, []);
    const slug = route.startsWith("#/product/") ? route.slice(10) : null;
    const product = products.find(p => p.id === slug);
    useEffect(() => {
        document.title = product ? `${product.name} — Sankee Audio` : "Sankee — Sound, beautifully considered.";
        if (slug) window.scrollTo({ top: 0, behavior: "instant" });
        else if (route === "#collection") requestAnimationFrame(() => document.getElementById("collection")?.scrollIntoView());
    }, [route, slug, product]);
    const cart = useCart();
    const guide = useContextualGuide();
    useEffect(() => { guide.dismiss(); }, [slug]);
    const [bag, setBag] = useState(false);
    const [bagStep, setBagStep] = useState<"cart"|"checkout">("cart");
    function openBag(step: "cart"|"checkout" = "cart") { setBagStep(step); setBag(true); }
    const [category, setCategory] = useState("All sound");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("featured");
    const [notice, setNotice] = useState("");
    const embedded = new URLSearchParams(location.search).has("widget");
    const filtered = products
        .filter(
            (p) =>
                (category === "All sound" || p.category === category) &&
                (p.name + " " + p.category + " " + p.description)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
            sort === "low"
                ? a.price - b.price
                : sort === "high"
                  ? b.price - a.price
                  : 0,
        );
    function add(id: string) {
        cart.add(id);
        setNotice(
            products.find((p) => p.id === id)?.name + " added to your bag",
        );
        setTimeout(() => setNotice(""), 2500);
    }
    return (
        <LandingPageLoader imageSrc={products[0].image} disabled={embedded}>
            {!embedded && (
                <>
                    <AnnouncementBar />
                    <Navbar cartCount={cart.count} setCategory={value => { setCategory(value); if (slug) location.hash = "collection"; }} onOpenBag={() => openBag()} />
                    {product ? <ProductDetailPage key={product.id} product={product} onAdd={add} onPreview={guide.preview} /> : slug ? <main className="pdp-not-found"><h1>That sound isn’t here.</h1><a className="primary" href="#collection">Explore the collection</a></main> : <main>
                        <HeroSection onPreview={guide.preview} />
                        <BenefitsBar />
                        <ProductCollection filtered={filtered} category={category} setCategory={setCategory} search={search} setSearch={setSearch} sort={sort} setSort={setSort} onAdd={add} onPreview={guide.preview} />
                        <EditorialSection />
                    </main>}
                    <Footer />
                    <ContextualGuide guide={guide} onAdd={add} cart={cart} onCart={openBag} />
                </>
            )}
            <ChatWidget
                cart={cart}
                currentProductId={product?.id}
                onCart={openBag}
                embedded={embedded}
            />
            {bag && <CartPanel key={bagStep} initialStep={bagStep} cart={cart} onClose={() => setBag(false)} />}{" "}
            {notice && (
                <Toast message={notice} onOpenBag={() => openBag()} />
            )}
        </LandingPageLoader>
    );
}
