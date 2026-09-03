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
import { academicSessionSchema, type AcademicSessionFormValues } from '@/features/schools/schemas';
import { useCreateAcademicSession } from '@/features/schools/hooks';
import { useAuth } from '@/features/auth/auth-context';
import { ApiError } from '@/lib/api-client';

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const { currentSchoolId } = useAuth();
  const { toast } = useToast();
  const createMutation = useCreateAcademicSession(currentSchoolId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AcademicSessionFormValues>({ resolver: zodResolver(academicSessionSchema) });

  React.useEffect(() => {
    if (open) reset({ name: '', startDate: '', endDate: '' });
  }, [open, reset]);

  async function onSubmit(values: AcademicSessionFormValues) {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
      });
      toast({ title: 'Academic session created', description: values.name });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't create academic session",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New academic session</DialogTitle>
          <DialogDescription>e.g. &ldquo;2026/2027&rdquo;. You can add terms to it next.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Session name</Label>
            <Input id="name" placeholder="2026/2027" {...register('name')} />
            {errors.name && <p className="text-[12.5px] text-danger">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}