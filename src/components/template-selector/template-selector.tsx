"use client";

import { useResumeStore } from "@/stores/resume-store";
import { templateRegistry, getTemplateName, getTemplateDescription, TEMPLATE_CATEGORIES } from "@/engines/templates/registry";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown } from "lucide-react";

const templateIds = Object.keys(templateRegistry) as Array<keyof typeof templateRegistry>;

export function TemplateSelector() {
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const layout = useResumeStore((s) => s.layout);
  const setLayout = useResumeStore((s) => s.setLayout);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Template</h2>
        <p className="text-sm text-muted-foreground">Choose a layout for your resume — all 8 are free</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templateIds.map((id) => {
          const isPro = TEMPLATE_CATEGORIES[id] === "pro";
          const isSelected = template === id;
          return (
            <Card
              key={id}
              className={`group relative cursor-pointer p-3 transition-all hover:ring-2 hover:ring-primary ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setTemplate(id)}
            >
              {isPro && (
                <Badge variant="secondary" className="absolute right-1.5 top-1.5 gap-0.5 px-1.5 py-0 text-[9px]">
                  <Crown className="h-2.5 w-2.5" />
                  Pro
                </Badge>
              )}
              <p className="text-center text-sm font-semibold">{getTemplateName(id)}</p>
              <p className="mt-1 text-center text-[10px] leading-snug text-muted-foreground">
                {getTemplateDescription(id)}
              </p>
              {isSelected && (
                <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  Selected
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Layout Options</h3>

        <div className="space-y-2">
          <Label>Columns</Label>
          <Select value={layout.columns} onValueChange={(v) => setLayout({ columns: v as "one" | "two" })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one">One Column</SelectItem>
              <SelectItem value="two">Two Column</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Font Size</Label>
          <Select value={layout.fontSize} onValueChange={(v) => setLayout({ fontSize: v as "small" | "medium" | "large" })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Accent Color</Label>
          <input
            type="color"
            value={layout.primaryColor}
            onChange={(e) => setLayout({ primaryColor: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-md border p-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <Label>Show Picture</Label>
          <input
            type="checkbox"
            checked={layout.showPicture}
            onChange={(e) => setLayout({ showPicture: e.target.checked })}
            className="h-4 w-4"
          />
        </div>
      </div>
    </div>
  );
}
