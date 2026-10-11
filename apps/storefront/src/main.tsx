import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StorefrontPage } from "./pages/StorefrontPage";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <StorefrontPage />
    </StrictMode>,
);
