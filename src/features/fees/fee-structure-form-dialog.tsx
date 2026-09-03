'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { feeStructureSchema, type FeeStructureFormValues } from '@/features/fees/schemas';
import { useCreateFeeStructure, useUpdateFeeStructure } from '@/features/fees/hooks';
import { useAuth } from '@/features/auth/auth-context';
import { ApiError } from '@/lib/api-client';
import { nairaToKobo } from '@/lib/currency';
import type { FeeStructure, SchoolClass } from '@/types/entities';

interface FeeStructureFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The term/session this fee structure applies to — fixed by the page's term filter, not chosen in this form. */
  academicSessionId: string;
  termId: string;
  termName: string;
  classes: SchoolClass[];
  /** Present when editing an existing fee structure; absent when adding a new one. */
  feeStructure?: FeeStructure | null;
  /** When adding, preselect this class (e.g. clicked "Set fee" from a specific row). */
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
  const { toast } = useToast();
  const createMutation = useCreateFeeStructure(currentSchoolId);
  const updateMutation = useUpdateFeeStructure(currentSchoolId, feeStructure?.id ?? '');
  const isEditing = Boolean(feeStructure);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FeeStructureFormValues>({ resolver: zodResolver(feeStructureSchema) });

  React.useEffect(() => {
    if (open) {
      reset({
        classId: feeStructure?.classId ?? presetClassId ?? '',
        amountNaira: feeStructure ? feeStructure.amountKobo / 100 : undefined,
      });
    }
  }, [open, feeStructure, presetClassId, reset]);

  const classId = watch('classId');

  async function onSubmit(values: FeeStructureFormValues) {
    const amountKobo = nairaToKobo(values.amountNaira);
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ amountKobo });
      } else {
        await createMutation.mutateAsync({ academicSessionId, termId, classId: values.classId, amountKobo });
      }
      toast({ title: isEditing ? 'Fee structure updated' : 'Fee structure created' });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: isEditing ? "Couldn't update fee structure" : "Couldn't create fee structure",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit fee structure' : 'Set class fee'}</DialogTitle>
          <DialogDescription>For {termName}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Select value={classId} onValueChange={(v) => setValue('classId', v)} disabled={isEditing}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classId && <p className="text-[12.5px] text-danger">{errors.classId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amountNaira">Fee amount (₦)</Label>
            <Input id="amountNaira" type="number" step="0.01" placeholder="150000" {...register('amountNaira')} />
            {errors.amountNaira && <p className="text-[12.5px] text-danger">{errors.amountNaira.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Set fee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}