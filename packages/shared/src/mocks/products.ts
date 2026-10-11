import type { Product } from "../types/product";
export const products: Product[] = [
    {
        id: "halo",
        name: "Halo Studio",
        category: "Headphones",
        price: 18900,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85",
        color: "Graphite",
        colors: ["#24272b", "#d8d0bd", "#a1aeb0"],
        tag: "Bestseller",
        description:
            "A little less noise. A lot more you. Immersive over-ear sound with adaptive noise cancellation.",
        battery: 40,
        anc: true,
    },
    {
        id: "air",
        name: "Air One",
        category: "Earbuds",
        price: 8900,
        image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85",
        color: "Pearl",
        colors: ["#eeeae2", "#303338", "#c6d2ca"],
        tag: "Everyday essential",
        description:
            "Pocket-sized sound for your everyday rhythm. Lightweight earbuds with a wireless charging case.",
        battery: 24,
        anc: true,
    },
    {
        id: "pulse",
        name: "Pulse Mini",
        category: "Speakers",
        price: 6900,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
        color: "Midnight",
        colors: ["#25272c", "#bab0a1", "#768d81"],
        tag: "Take it anywhere",
        description:
            "Room-filling sound, ready to go. A portable speaker for weekends, workspaces, and everything between.",
        battery: 12,
        anc: false,
    },
    {
        id: "form",
        name: "Form Pro",
        category: "Headphones",
        price: 24900,
        image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=85",
        color: "Sand",
        colors: ["#baa48b", "#25272c", "#c1c5cb"],
        tag: "Studio collection",
        description:
            "Hear the detail in every note. Premium drivers, plush cushions, and a beautifully balanced soundstage.",
        battery: 50,
        anc: true,
    },
    {
        id: "air-sport",
        name: "Air Sport",
        category: "Earbuds",
        price: 5900,
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=900&q=85",
        color: "Cloud",
        colors: ["#eeeae2", "#303338"],
        tag: "Made to move",
        description:
            "A secure fit and splash-resistant finish for your next personal best.",
        battery: 18,
        anc: false,
    },
    {
        id: "room",
        name: "Room One",
        category: "Speakers",
        price: 12900,
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=85",
        color: "Slate",
        colors: ["#4b5359", "#d8d0bd"],
        tag: "Home listening",
        description:
            "Warm, expansive audio in a compact design that belongs in your space.",
        battery: 16,
        anc: false,
    },
];
export const money = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
