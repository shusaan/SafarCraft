import { cn } from "@/lib/utils";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  size?: "default" | "narrow" | "wide";
  children: ReactNode;
}

const SIZE = {
  default: "max-w-6xl",
  narrow: "max-w-4xl",
  wide: "max-w-7xl",
};

/**
 * Marketing-tier centred layout container.
 *
 * Use for the page-level horizontal gutter; section blocks use `<Section>`
 * for vertical rhythm.
 */
export function Container({ as: Tag = "div", size = "default", className, children, ...props }: ContainerProps) {
  const Comp = Tag as ElementType;
  return (
    <Comp className={cn("mx-auto w-full px-6 md:px-8", SIZE[size], className)} {...props}>
      {children}
    </Comp>
  );
}
