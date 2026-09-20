"use client";

import { Suspense } from "react";
import { Container } from "@/components/primitives/container";
import { Section } from "@/components/primitives/section";
import { Card } from "@/components/ui/card";
import { WizardShell, type WizardStepDef } from "@/components/onboarding/wizard-shell";
import { StepPersonal } from "@/components/onboarding/steps/step-personal";
import { StepExperience } from "@/components/onboarding/steps/step-experience";
import { StepEducation } from "@/components/onboarding/steps/step-education";
import { StepExtras } from "@/components/onboarding/steps/step-extras";
import { StepReview } from "@/components/onboarding/steps/step-review";

/**
 * Wizard entry — 5-step "Start from scratch" CV builder.
 *
 * Renders the wizard shell + the current step's content. The shell
 * handles step navigation, progress, autosave, and skip semantics; each
 * step owns its form UI + persistence.
 */
export default function WizardPage() {
  return (
    <Section spacing="loose">
      <Container size="narrow">
        <Card className="p-6 md:p-8">
          <Suspense fallback={null}>
            <WizardShell>
              {({ step }: { step: WizardStepDef }) => <StepContent step={step} />}
            </WizardShell>
          </Suspense>
        </Card>
      </Container>
    </Section>
  );
}

function StepContent({ step }: { step: WizardStepDef }) {
  switch (step.id) {
    case "personal":
      return <StepPersonal />;
    case "experience":
      return <StepExperience />;
    case "education":
      return <StepEducation />;
    case "extras":
      return <StepExtras />;
    case "review":
      return <StepReview />;
    default:
      return null;
  }
}