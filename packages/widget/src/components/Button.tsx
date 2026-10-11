import type { ComponentPropsWithoutRef } from "react";

/** Native button semantics with reusable styling variants and forwarded attributes. */
export function Button({ variant, className, ...props }: ComponentPropsWithoutRef<"button"> & { variant?: "primary" | "icon" | "text" }) {
    const variants = { primary: "primary", icon: "icon-button", text: "text-button" };
    const classes = [variant ? variants[variant] : "", className].filter(Boolean).join(" ");
    return <button {...props} className={classes || undefined} />;
}
