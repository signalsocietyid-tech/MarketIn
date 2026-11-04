import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-b from-brand-400 to-brand-500 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_20px_-6px_rgb(244_119_53/0.6)] hover:from-brand-500 hover:to-brand-600 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_12px_28px_-8px_rgb(244_119_53/0.7)]",
        navy: "bg-navy-800 text-white shadow-xs hover:bg-navy-900",
        secondary: "border border-white/80 bg-white/60 text-ink ring-1 ring-inset ring-black/[0.06] shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_4px_14px_-6px_rgb(16_24_40/0.12)] backdrop-blur-xl hover:bg-white/85",
        outline: "border border-brand-300 bg-white/70 text-brand-700 backdrop-blur-xl hover:bg-brand-50",
        ghost: "text-subtle hover:bg-white/60 hover:text-ink",
        soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
        danger: "bg-danger-600 text-white shadow-xs hover:bg-danger-700",
        link: "h-auto px-0 text-brand-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-5",
        lg: "h-12 px-6 text-[15px]",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({ className, variant, size, asChild, loading, children, disabled, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" />}
          {children}
        </>
      )}
    </Comp>
  );
}
