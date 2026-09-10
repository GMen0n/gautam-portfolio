import React from "react";

export interface CandyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button" | "a" | "span";
  href?: string;
  target?: string;
  rel?: string;
  variant?: "orange" | "amber" | "fiery";
}

export function CandyButton({
  as: Component = "button",
  variant = "orange",
  className = "",
  children = "Candy Button",
  ...props
}: CandyButtonProps) {
  const variantClass =
    variant === "amber"
      ? "candy-button-amber"
      : variant === "fiery"
        ? "candy-button-fiery"
        : "candy-button-orange";

  const Comp = Component as any;

  return (
    <Comp className={`candy-button ${variantClass} ${className}`} {...props}>
      {children}
    </Comp>
  );
}

export default CandyButton;
