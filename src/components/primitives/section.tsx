import { cn } from "@/lib/utils";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  spacing?: "tight" | "default" | "loose";
  background?: "default" | "muted" | "gradient" | "transparent";
  align?: "left" | "center";
  children: ReactNode;
}

const SPACING = {
  tight: "py-12 md:py-16",
  default: "py-20 md:py-24",
  loose: "py-24 md:py-32",
};

const BG = {
  default: "bg-background",
  muted: "bg-muted/30",
  gradient: "bg-gradient-to-b from-background via-background to-muted/20",
  transparent: "bg-transparent",
};

/**
 * Marketing-tier vertical section with consistent rhythm and background
 * variants. Pair with `<Container>` for the inner content.
 */
export function Section({
  as: Tag = "section",
  spacing = "default",
  background = "default",
  align = "left",
  className,
  children,
  ...props
}: SectionProps) {
  const Comp = Tag as ElementType;
  return (
    <Comp
      className={cn(
        "relative w-full",
        SPACING[spacing],
        BG[background],
        align === "center" && "text-center",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
