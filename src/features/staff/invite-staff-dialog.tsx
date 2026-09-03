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
import { inviteStaffSchema, type InviteStaffFormValues } from '@/features/staff/schemas';
import { useInviteStaff } from '@/features/staff/hooks';
import { useRoles } from '@/features/roles/hooks';
import { useAuth } from '@/features/auth/auth-context';
import { ApiError } from '@/lib/api-client';

interface InviteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteStaffDialog({ open, onOpenChange }: InviteStaffDialogProps) {
  const { currentSchoolId } = useAuth();
  const { toast } = useToast();
  const rolesQuery = useRoles(currentSchoolId);
  const inviteMutation = useInviteStaff(currentSchoolId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InviteStaffFormValues>({ resolver: zodResolver(inviteStaffSchema) });

  React.useEffect(() => {
    if (open) reset({ fullName: '', email: '', roleId: '' });
  }, [open, reset]);

  const roleId = watch('roleId');

  async function onSubmit(values: InviteStaffFormValues) {
    try {
      await inviteMutation.mutateAsync(values);
      toast({ title: 'Invitation sent', description: `${values.fullName} will receive an email to join.` });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't send invitation",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite staff member</DialogTitle>
          <DialogDescription>They&apos;ll receive an email invitation to join your school.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" placeholder="Ngozi Adeyemi" {...register('fullName')} />
            {errors.fullName && <p className="text-[12.5px] text-danger">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="ngozi@school.edu.ng" {...register('email')} />
            {errors.email && <p className="text-[12.5px] text-danger">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={(v) => setValue('roleId', v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {(rolesQuery.data ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && <p className="text-[12.5px] text-danger">{errors.roleId.message}</p>}
            {rolesQuery.data && rolesQuery.data.length === 0 && (
              <p className="text-[12px] text-navy-400">No roles exist yet — create one first under Roles.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}