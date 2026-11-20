import type { BindingCategory } from "./types";

/** Binding status → colour (DeepDTA + palette). Thresholds live in the backend. */
export const BINDING_STYLE: Record<
  BindingCategory,
  { label: string; short: string; color: string; soft: string }
> = {
  "Very High Binding": { label: "Very high binding", short: "Very high", color: "#09A1A1", soft: "rgba(9,161,161,0.16)" },
  "High Binding": { label: "High binding", short: "High", color: "#5484A4", soft: "rgba(84,132,164,0.2)" },
  "Moderate Binding": { label: "Moderate binding", short: "Moderate", color: "#F6C992", soft: "rgba(246,201,146,0.16)" },
  "No Significant Binding": { label: "No significant binding", short: "None", color: "#D396A6", soft: "rgba(211,150,166,0.16)" },
};
