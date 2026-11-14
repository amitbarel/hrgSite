// shadcn/ui Tabs (על Radix): כפתורי בחירה עם ניווט במקלדת (חיצים, Home, End)
// ועם התפקידים הנכונים לקוראי מסך (tablist, tab, aria-selected).
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root data-slot="tabs" className={className} {...props} />;
}
export function TabsList({ className, ...props }) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("flex flex-wrap gap-2", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={className} {...props} />;
}
export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("outline-none", className)} {...props} />;
}
