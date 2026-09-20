"use client";

import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Accessible checkbox — a real <button role="switch"> (toggle) so we
 * don't need a hidden <input>. Avoids Radix complexity for our one
 * use-case (the "Currently in this role" toggle in the wizard).
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    { checked, onCheckedChange, className, disabled, "aria-label": ariaLabel, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border bg-background transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer hover:border-primary/60",
          className,
        )}
        {...rest}
      >
        {checked ? <Check className="h-3 w-3" /> : null}
      </button>
    );
  },
);