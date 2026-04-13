"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && <label htmlFor={id} className="label">{label}</label>}
      <input
        ref={ref}
        id={id}
        className={cn("input", error && "border-[var(--danger)] focus:ring-[var(--danger)]", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
