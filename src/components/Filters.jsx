"use client";

// כפתורי סינון (Tabs של shadcn/ui). light = גרסה לרקע בהיר.
// Radix נותן ניווט במקלדת (חיצים) והתפקידים הנכונים לקוראי מסך.
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Filters({ options, value, onChange, light = false, label = "סינון" }) {
  return (
    <Tabs value={value} onValueChange={onChange} dir="rtl">
      <TabsList className={`filters${light ? " light" : ""}`} aria-label={label}>
        {options.map(o => <TabsTrigger key={o} value={o}>{o}</TabsTrigger>)}
      </TabsList>
    </Tabs>
  );
}
