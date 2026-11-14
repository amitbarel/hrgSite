"use client";

// shadcn/ui Sheet: חלונית שנכנסת מצד המסך (כאן: התפריט בטלפון). בנוי על אותו Dialog של Radix,
// אז יש לו את כל הנגישות של חלון: מיקוד, Esc, נעילת גלילה.
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export function Sheet(props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}
export function SheetTrigger(props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}
export function SheetClose(props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

// forwardRef: ב-React 18, Radix צריך ref לשכבת הרקע כדי להפעיל את אנימציית הסגירה
const SheetOverlay = forwardRef(function SheetOverlay({ className, ...props }, ref) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60",
        className
      )}
      {...props}
      ref={ref}
    />
  );
});

const SIDES = {
  right: "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 max-w-sm",
  left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 max-w-sm",
  top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto",
  bottom: "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto",
};

export function SheetContent({ className, children, side = "right", closeLabel = "סגירה", ...props }) {
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-300 outline-none",
          SIDES[side],
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="sheet-close" aria-label={closeLabel}>
          <XIcon className="size-6" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetTitle({ className, ...props }) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={className} {...props} />;
}
export function SheetDescription({ className, ...props }) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={className} {...props} />;
}
