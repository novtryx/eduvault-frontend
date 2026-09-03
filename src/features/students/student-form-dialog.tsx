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
import { studentSchema, type StudentFormValues } from '@/features/students/schemas';
import { useCreateStudent, useUpdateStudent } from '@/features/students/hooks';
import { useAuth } from '@/features/auth/auth-context';
import { useClasses } from '@/features/classes/hooks';
import { ApiError } from '@/lib/api-client';
import type { Student } from '@/types/entities';

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSuccess?: (student: Student) => void;
}

export function StudentFormDialog({ open, onOpenChange, student, onSuccess }: StudentFormDialogProps) {
  const { currentSchoolId } = useAuth();
  const { toast } = useToast();
  const classesQuery = useClasses(currentSchoolId);
  const createMutation = useCreateStudent(currentSchoolId);
  const updateMutation = useUpdateStudent(currentSchoolId, student?.id ?? '');
  const isEditing = Boolean(student);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: '', admissionNumber: '', classId: '', parentName: '', parentPhone: '', parentEmail: '', dateOfAdmission: '' },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        fullName: student?.fullName ?? '',
        admissionNumber: student?.admissionNumber ?? '',
        classId: student?.classId ?? '',
        parentName: student?.parentName ?? '',
        parentPhone: student?.parentPhone ?? '',
        parentEmail: student?.parentEmail ?? '',
        dateOfAdmission: student?.dateOfAdmission?.slice(0, 10) ?? '',
      });
    }
  }, [open, student, reset]);

  const classId = watch('classId');

  async function onSubmit(values: StudentFormValues) {
    const payload = {
      fullName: values.fullName,
      admissionNumber: values.admissionNumber,
      classId: values.classId || undefined,
      parentName: values.parentName || undefined,
      parentPhone: values.parentPhone || undefined,
      parentEmail: values.parentEmail || undefined,
      dateOfAdmission: values.dateOfAdmission || undefined,
    };

    try {
      const result = isEditing
        ? await updateMutation.mutateAsync(payload)
        : await createMutation.mutateAsync(payload);
      toast({ title: isEditing ? 'Student updated' : 'Student added', description: values.fullName });
      onOpenChange(false);
      onSuccess?.(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: isEditing ? "Couldn't update student" : "Couldn't add student",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit student' : 'Add student'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this student\u2019s details.' : 'Enter the student\u2019s details to add them to your school.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" placeholder="Chidinma Okoro" {...register('fullName')} />
              {errors.fullName && <p className="text-[12.5px] text-danger">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admissionNumber">Admission number</Label>
              <Input id="admissionNumber" placeholder="JSS2-0245" {...register('admissionNumber')} />
              {errors.admissionNumber && <p className="text-[12.5px] text-danger">{errors.admissionNumber.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select value={classId || undefined} onValueChange={(v) => setValue('classId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {(classesQuery.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="parentName">Parent / Guardian name</Label>
              <Input id="parentName" placeholder="Mrs. Okoro" {...register('parentName')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parentPhone">Parent phone</Label>
              <Input id="parentPhone" placeholder="080X XXX XXXX" {...register('parentPhone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parentEmail">Parent email</Label>
              <Input id="parentEmail" type="email" placeholder="parent@email.com" {...register('parentEmail')} />
              {errors.parentEmail && <p className="text-[12.5px] text-danger">{errors.parentEmail.message}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="dateOfAdmission">Date of admission</Label>
              <Input id="dateOfAdmission" type="date" {...register('dateOfAdmission')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Add student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}