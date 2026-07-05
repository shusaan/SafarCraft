"use client";

import { useResumeStore } from "@/stores/resume-store";
import { renderTemplate } from "@/engines/templates/registry";

export function ResumePreview() {
  const data = useResumeStore((s) => s.data);
  const layout = useResumeStore((s) => s.layout);
  const template = useResumeStore((s) => s.template);

  return (
    <div className="mx-auto h-full w-full overflow-y-auto bg-white p-8 shadow-sm dark:bg-neutral-950">
      <div
        className="mx-auto"
        style={{
          maxWidth: "816px",
          minHeight: "1056px",
        }}
      >
        {renderTemplate(template, { data, layout })}
      </div>
    </div>
  );
}
