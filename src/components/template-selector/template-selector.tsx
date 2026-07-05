"use client";

import { useResumeStore } from "@/stores/resume-store";
import { templateRegistry, getTemplateName } from "@/engines/templates/registry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <p className="text-sm text-muted-foreground">Choose a layout for your resume</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {templateIds.map((id) => (
          <Card
            key={id}
            className={`cursor-pointer p-4 transition-all hover:ring-2 hover:ring-primary ${
              template === id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setTemplate(id)}
          >
            <p className="text-center text-sm font-medium">{getTemplateName(id)}</p>
          </Card>
        ))}
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
