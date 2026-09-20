"use client";

// Step 1 — Personal. Captures name, contact, summary.
// Validation is non-blocking: invalid fields show an inline error but the
// user can still progress; we prefer "let them finish" over "block here".

import { useCallback } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError, validateRequired, validateEmail, validatePhone, validateUrl } from "../lib/validation";

export function StepPersonal() {
  const personal = useResumeStore((s) => s.data.personal);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);

  const onChange = useCallback(
    <K extends keyof typeof personal>(field: K, value: (typeof personal)[K]) => {
      updatePersonal({ [field]: value } as Partial<typeof personal>);
    },
    [updatePersonal],
  );

  return (
    <form className="space-y-5" aria-label="Personal details">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="wiz-name"
          label="Full name"
          value={personal.name}
          onChange={(v) => onChange("name", v)}
          required
        />
        <Field
          id="wiz-email"
          label="Email"
          type="email"
          value={personal.email}
          onChange={(v) => onChange("email", v)}
          validate={validateEmail}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="wiz-phone"
          label="Phone"
          type="tel"
          value={personal.phone}
          onChange={(v) => onChange("phone", v)}
          validate={validatePhone}
          placeholder="+1 (555) 123-4567"
        />
        <Field
          id="wiz-location"
          label="Location"
          value={personal.location}
          onChange={(v) => onChange("location", v)}
          placeholder="City, Country"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="wiz-linkedin"
          label="LinkedIn"
          value={personal.linkedin}
          onChange={(v) => onChange("linkedin", v)}
          validate={validateUrl}
          placeholder="linkedin.com/in/yourname"
        />
        <Field
          id="wiz-github"
          label="GitHub"
          value={personal.github}
          onChange={(v) => onChange("github", v)}
          validate={validateUrl}
          placeholder="github.com/yourname"
        />
      </div>

      <Field
        id="wiz-website"
        label="Website (optional)"
        value={personal.website}
        onChange={(v) => onChange("website", v)}
        validate={validateUrl}
        placeholder="you.dev"
      />

      <div>
        <Label htmlFor="wiz-summary" className="mb-1.5 block">
          Professional summary
          <span className="ml-2 text-xs font-normal text-muted-foreground">2-3 sentences</span>
        </Label>
        <Textarea
          id="wiz-summary"
          rows={4}
          maxLength={600}
          value={personal.summary}
          onChange={(e) => onChange("summary", e.target.value)}
          placeholder="Senior software engineer with 8 years building scalable web apps."
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          {(personal.summary ?? "").length} / 600
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  validate,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  validate?: (v: string) => string | null;
  required?: boolean;
}) {
  const requiredError = required ? validateRequired(value, label) : null;
  const validateError = value ? validate?.(value) ?? null : null;
  const error = requiredError ?? validateError;
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={error ? "border-destructive" : undefined}
      />
      <FieldError message={error} />
    </div>
  );
}