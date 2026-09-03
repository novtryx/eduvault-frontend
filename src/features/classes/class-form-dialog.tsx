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
import { useToast } from '@/components/ui/use-toast';
import { classSchema, type ClassFormValues } from '@/features/classes/schemas';
import { useCreateClass, useUpdateClass } from '@/features/classes/hooks';
import { useAuth } from '@/features/auth/auth-context';
import { ApiError } from '@/lib/api-client';
import type { SchoolClass } from '@/types/entities';

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  klass?: SchoolClass | null;
}

export function ClassFormDialog({ open, onOpenChange, klass }: ClassFormDialogProps) {
  const { currentSchoolId } = useAuth();
  const { toast } = useToast();
  const createMutation = useCreateClass(currentSchoolId);
  const updateMutation = useUpdateClass(currentSchoolId, klass?.id ?? '');
  const isEditing = Boolean(klass);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormValues>({ resolver: zodResolver(classSchema), defaultValues: { name: '' } });

  React.useEffect(() => {
    if (open) reset({ name: klass?.name ?? '', order: klass?.order ?? undefined });
  }, [open, klass, reset]);

  async function onSubmit(values: ClassFormValues) {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(values);
        toast({ title: 'Class updated', description: values.name });
      } else {
        await createMutation.mutateAsync(values);
        toast({ title: 'Class added', description: values.name });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: isEditing ? "Couldn't update class" : "Couldn't add class",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit class' : 'Add class'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this class\u2019s name or order.' : 'Add a new class to your school.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Class name</Label>
            <Input id="name" placeholder="JSS 2" {...register('name')} />
            {errors.name && <p className="text-[12.5px] text-danger">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="order">Display order (optional)</Label>
            <Input id="order" type="number" placeholder="e.g. 5" {...register('order')} />
            <p className="text-[12px] text-navy-400">Controls list order — lower numbers appear first.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Add class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}