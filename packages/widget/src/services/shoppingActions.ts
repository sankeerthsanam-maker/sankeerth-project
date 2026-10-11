import { products } from "../../../shared/src/mocks/products.ts";
import type { Cart } from "../features/cart/useCart";
import type { AssistantReply } from "./localAssistant";

/** The same validated application actions serve typed chat and product voice. */
export function applyShoppingAction(action: NonNullable<AssistantReply["action"]>, cart: Cart, onCart: (step?: "cart" | "checkout") => void) {
    if (action.type === "add" || action.type === "checkout") {
        const product = products.find(p => p.id === action.productId);
        if ((action.type === "add" || action.productId) && !product) throw new Error("Please choose a product from this collection.");
        const quantity = action.quantity ?? 1;
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) throw new Error("Choose between one and five items.");
        if (product && action.addProduct !== false) for (let n = 0; n < quantity; n++) cart.add(product.id);
    }
    if (action.type === "checkout") onCart("checkout");
    else if (action.type === "cart") onCart("cart");
}
