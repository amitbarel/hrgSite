// shadcn/ui Dialog (על Radix): חלון קופץ נגיש. נועל את המיקוד בתוך החלון, נסגר ב-Esc
// ובלחיצה בחוץ, חוסם גלילה של הדף ומחזיר את המיקוד למקום שממנו נפתח.
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export function Dialog(props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}
export function DialogTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}
export function DialogPortal(props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}
export function DialogClose(props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// forwardRef: ב-React 18, Radix צריך ref לשכבת הרקע כדי להפעיל את אנימציית הסגירה
export const DialogOverlay = forwardRef(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70",
        className
      )}
      {...props}
      ref={ref}
    />
  );
});

export function DialogContent({ className, children, showCloseButton = true, closeLabel = "סגירה", ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] duration-200 outline-none",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" className="modal-close" aria-label={closeLabel}>
            <XIcon className="size-5 mx-auto" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={className} {...props} />;
}
export function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={className} {...props} />;
}
