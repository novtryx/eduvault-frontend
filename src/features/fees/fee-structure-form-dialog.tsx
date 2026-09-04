'use client';

import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/features/auth/auth-context';
import { useCreateFeeStructure, useUpdateFeeStructure } from '@/features/fees/hooks';
import { feeStructureSchema, type FeeStructureFormValues } from '@/features/fees/schemas';
import { ApiError } from '@/lib/api-client';
import { formatKobo, koboToNaira, nairaToKobo } from '@/lib/currency';
import type { FeeStructure, SchoolClass } from '@/types/entities';

interface FeeStructureFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicSessionId: string;
  termId: string;
  termName: string;
  classes: SchoolClass[];
  // Present when editing — session/term/class can't change on an
  // existing structure (see UpdateFeeStructureDto's comment), so the
  // dialog locks those three fields in edit mode instead of pretending
  // they're editable.
  feeStructure?: FeeStructure | null;
  // Pre-selects a class when opened from a specific row's "Set fee"
  // action rather than the page-level "New Fee Structure" button.
  presetClassId?: string;
}

export function FeeStructureFormDialog({
  open,
  onOpenChange,
  academicSessionId,
  termId,
  termName,
  classes,
  feeStructure,
  presetClassId,
}: FeeStructureFormDialogProps) {
  const { currentSchoolId } = useAuth();
  const isEditing = Boolean(feeStructure);
  const { toast } = useToast();
  const createMutation = useCreateFeeStructure(currentSchoolId);
  const updateMutation = useUpdateFeeStructure(currentSchoolId, feeStructure?.id ?? '');

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: { mode: 'flat', components: [{ label: '', amountNaira: undefined }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'components' });
  const mode = watch('mode');
  const components = watch('components');

  const componentsTotalKobo = React.useMemo(() => {
    if (mode !== 'breakdown' || !components) return 0;
    return components.reduce((sum, c) => {
      const amount = typeof c.amountNaira === 'number' ? c.amountNaira : Number(c.amountNaira);
      return sum + (Number.isFinite(amount) ? nairaToKobo(amount) : 0);
    }, 0);
  }, [mode, components]);

  React.useEffect(() => {
    if (!open) return;
    if (feeStructure) {
      const hasComponents = Boolean(feeStructure.components && feeStructure.components.length > 0);
      reset({
        classId: feeStructure.classId,
        mode: hasComponents ? 'breakdown' : 'flat',
        amountNaira: hasComponents ? undefined : koboToNaira(feeStructure.amountKobo),
        components: hasComponents
          ? feeStructure.components!.map((c) => ({ label: c.label, amountNaira: koboToNaira(c.amountKobo) }))
          : [{ label: '', amountNaira: undefined }],
      });
    } else {
      reset({
        classId: presetClassId ?? '',
        mode: 'flat',
        amountNaira: undefined,
        components: [{ label: '', amountNaira: undefined }],
      });
    }
  }, [open, feeStructure, presetClassId, reset]);

  async function onSubmit(values: FeeStructureFormValues) {
    const amountPayload =
      values.mode === 'flat'
        ? { amountKobo: nairaToKobo(values.amountNaira!) }
        : {
            components: (values.components ?? []).map((c) => ({
              label: c.label,
              amountKobo: nairaToKobo(c.amountNaira as number),
            })),
          };

    try {
      if (isEditing && feeStructure) {
        await updateMutation.mutateAsync(amountPayload);
        toast({ title: 'Fee structure updated' });
      } else {
        await createMutation.mutateAsync({
          academicSessionId,
          termId,
          classId: values.classId,
          ...amountPayload,
        });
        toast({ title: 'Fee structure created' });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: isEditing ? "Couldn't update fee structure" : "Couldn't create fee structure",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Fee Structure' : 'New Fee Structure'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the amount or breakdown for ${feeStructure?.class?.name ?? 'this class'} — ${termName}.`
              : `Set the fee for a class in ${termName} — a flat total or an itemized breakdown.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="classId">Class</Label>
            {isEditing ? (
              <Input value={feeStructure?.class?.name ?? ''} disabled />
            ) : (
              <>
                <Select value={watch('classId')} onValueChange={(v) => setValue('classId', v, { shouldValidate: true })}>
                  <SelectTrigger id="classId">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((klass) => (
                      <SelectItem key={klass.id} value={klass.id}>
                        {klass.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId && <p className="text-[12.5px] text-danger">{errors.classId.message}</p>}
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Fee type</Label>
            <Tabs value={mode} onValueChange={(v) => setValue('mode', v as 'flat' | 'breakdown')}>
              <TabsList>
                <TabsTrigger value="flat">Flat amount</TabsTrigger>
                <TabsTrigger value="breakdown">Itemized breakdown</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {mode === 'flat' ? (
            <div className="space-y-1.5">
              <Label htmlFor="amountNaira">Fee amount (₦)</Label>
              <Input id="amountNaira" type="number" step="0.01" min="0.01" placeholder="e.g. 150000" {...register('amountNaira')} />
              {errors.amountNaira && <p className="text-[12.5px] text-danger">{errors.amountNaira.message}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Line items</Label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <Input placeholder="e.g. Tuition" {...register(`components.${index}.label` as const)} />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="₦ amount"
                        {...register(`components.${index}.amountNaira` as const)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              {errors.components && !Array.isArray(errors.components) && (
                <p className="text-[12.5px] text-danger">{errors.components.message}</p>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ label: '', amountNaira: undefined })}
              >
                <Plus className="h-3.5 w-3.5" />
                Add item
              </Button>
              <div className="flex items-center justify-between rounded-md bg-surface-muted px-3 py-2">
                <span className="text-[12.5px] text-navy-400">Total</span>
                <span className="text-[14px] font-semibold text-navy-900">{formatKobo(componentsTotalKobo)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditing ? 'Save changes' : 'Create Fee Structure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}