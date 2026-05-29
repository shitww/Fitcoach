// ═══════════════════════════════════════════════════════════════
// UI — Single Public Primitive API
//
// This is the ONLY legal entry point for design-system primitives.
//
// Mental model: theme tokens + variant contracts.
//
//   import { PRIMITIVE_COLOR_MAP, PrimitiveVariant } from "@/design-system/ui"
//
// That's it. No internal contract files, no theme rules.
// ═══════════════════════════════════════════════════════════════

export type {
  PrimitiveVariant,
  PrimitiveBaseProps,
} from "../primitives/contract";

export { PRIMITIVE_COLOR_MAP } from "../primitives/contract";
