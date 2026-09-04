import { z } from 'zod';

// Mirrors CreateFeeStructureDto/UpdateFeeStructureDto's "exactly one of
// amountKobo or components" rule (see FeesService.resolveAmountKobo) —
// modeled here as a mode toggle rather than trying to validate the
// backend's either/or shape directly, since a form needs one active
// mode a person switches between, not both fields optional at once.
const componentSchema = z.object({
  label: z.string().min(1, 'Required').max(100),
  // Optional at the schema level so a freshly-added row can start
  // empty (matches the flat-mode amountNaira pattern below) — the
  // "must have a value" check happens in superRefine, giving a clearer
  // error than a bare "expected number, received undefined".
  amountNaira: z.coerce.number().positive('Enter an amount greater than zero').optional(),
});

export const feeStructureSchema = z
  .object({
    classId: z.string().uuid('Select a class'),
    mode: z.enum(['flat', 'breakdown']),
    amountNaira: z.coerce.number().positive('Enter an amount greater than zero').optional(),
    components: z.array(componentSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'flat') {
      if (data.amountNaira === undefined || Number.isNaN(data.amountNaira)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a fee amount', path: ['amountNaira'] });
      }
    } else {
      if (!data.components || data.components.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Add at least one item', path: ['components'] });
        return;
      }
      data.components.forEach((component, index) => {
        if (!component.label.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter a name',
            path: ['components', index, 'label'],
          });
        }
        if (component.amountNaira === undefined || Number.isNaN(component.amountNaira)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter an amount',
            path: ['components', index, 'amountNaira'],
          });
        }
      });
    }
  });
export type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;