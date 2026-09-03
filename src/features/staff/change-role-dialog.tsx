'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUpdateStaffRole } from '@/features/staff/hooks';
import { useRoles } from '@/features/roles/hooks';
import { useAuth } from '@/features/auth/auth-context';
import { ApiError } from '@/lib/api-client';
import type { StaffMember } from '@/types/entities';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember: StaffMember | null;
}

export function ChangeRoleDialog({ open, onOpenChange, staffMember }: ChangeRoleDialogProps) {
  const { currentSchoolId } = useAuth();
  const { toast } = useToast();
  const rolesQuery = useRoles(currentSchoolId);
  const updateMutation = useUpdateStaffRole(currentSchoolId);
  const [roleId, setRoleId] = React.useState('');

  React.useEffect(() => {
    if (open && staffMember) setRoleId(staffMember.roleId);
  }, [open, staffMember]);

  async function handleSave() {
    if (!staffMember || !roleId) return;
    try {
      await updateMutation.mutateAsync({ userId: staffMember.userId, payload: { roleId } });
      toast({ title: 'Role updated', description: staffMember.fullName });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't update role",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>Update the role assigned to {staffMember?.fullName}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Select value={roleId} onValueChange={setRoleId}>
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
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={updateMutation.isPending} disabled={!roleId}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}