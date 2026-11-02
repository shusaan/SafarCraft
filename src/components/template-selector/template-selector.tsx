"use client";

import { useResumeStore } from "@/stores/resume-store";
import { templateRegistry, getTemplateName, getTemplateDescription } from "@/engines/templates/registry";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { TemplatePreview } from "@/components/marketing/template-preview";

const templateIds = Object.keys(templateRegistry) as Array<keyof typeof templateRegistry>;

export function TemplateSelector() {
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const layout = useResumeStore((s) => s.layout);
  const setLayout = useResumeStore((s) => s.setLayout);

  return (
    <div className="space-y-6 overflow-y-auto p-6">
      <div>
        <h2 className="text-lg font-semibold">Template</h2>
        <p className="text-sm text-muted-foreground">Choose a layout for your resume — all 8 are free</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templateIds.map((id) => {
          const isSelected = template === id;
          return (
            <Card
              key={id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Use the ${getTemplateName(id)} template`}
              className={`group relative cursor-pointer p-2.5 transition-all hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setTemplate(id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setTemplate(id);
                }
              }}
            >
              <TemplatePreview id={id} compact className="mb-2" />
              <p className="text-center text-sm font-semibold">{getTemplateName(id)}</p>
              <p className="mt-1 text-center text-xs leading-snug text-muted-foreground">
                {getTemplateDescription(id)}
              </p>
              {isSelected && (
                <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-medium text-primary">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
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
