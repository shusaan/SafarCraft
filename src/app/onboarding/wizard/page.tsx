// Server entry that imports the client shell page.
// We export `dynamic = "force-dynamic"` so the step-state hydrates from
// localStorage on first paint.
export { default } from "./wizard-shell-page";
export const dynamic = "force-dynamic";