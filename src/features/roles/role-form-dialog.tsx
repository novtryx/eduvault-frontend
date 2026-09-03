'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { roleSchema, type RoleFormValues } from '@/features/roles/schemas';
import { useCreateRole, usePermissionCatalog, useUpdateRole } from '@/features/roles/hooks';
import { useAuth } from '@/features/auth/auth-context';
import { ApiError } from '@/lib/api-client';
import type { Role } from '@/types/entities';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
}

export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const { currentSchoolId } = useAuth();
  const { toast } = useToast();
  const { catalog } = usePermissionCatalog(currentSchoolId);
  const createMutation = useCreateRole(currentSchoolId);
  const updateMutation = useUpdateRole(currentSchoolId, role?.id ?? '');
  const isEditing = Boolean(role);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({ resolver: zodResolver(roleSchema), defaultValues: { permissionKeys: [] } });

  React.useEffect(() => {
    if (open) {
      reset({
        name: role?.name ?? '',
        description: role?.description ?? '',
        permissionKeys: role?.rolePermissions.map((rp) => rp.permission.key) ?? [],
      });
    }
  }, [open, role, reset]);

  const selectedKeys = watch('permissionKeys');

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof catalog>();
    for (const permission of catalog) {
      const list = map.get(permission.resource) ?? [];
      list.push(permission);
      map.set(permission.resource, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  function togglePermission(key: string, checked: boolean) {
    const next = checked ? [...selectedKeys, key] : selectedKeys.filter((k) => k !== key);
    setValue('permissionKeys', next, { shouldValidate: true });
  }

  async function onSubmit(values: RoleFormValues) {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(values);
        toast({ title: 'Role updated', description: values.name });
      } else {
        await createMutation.mutateAsync(values);
        toast({ title: 'Role created', description: values.name });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: isEditing ? "Couldn't update role" : "Couldn't create role",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit role' : 'New role'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this role's name, description, or permissions."
              : 'Define a role and choose exactly what it can access.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Role name</Label>
            <Input id="name" placeholder="Bursar" {...register('name')} />
            {errors.name && <p className="text-[12.5px] text-danger">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" rows={2} placeholder="What this role is for..." {...register('description')} />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="max-h-64 space-y-4 overflow-y-auto scrollbar-thin rounded-md border border-border p-3">
              {grouped.length === 0 ? (
                <p className="text-[12.5px] text-navy-400">
                  No permission catalog available yet. This usually means the current account&apos;s role doesn&apos;t
                  have access to the Owner role&apos;s permission list.
                </p>
              ) : (
                grouped.map(([resource, permissions]) => (
                  <div key={resource}>
                    <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-navy-400">
                      {resource}
                    </p>
                    <div className="space-y-1.5">
                      {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-start gap-2 text-[13px] text-navy-700">
                          <Checkbox
                            checked={selectedKeys.includes(permission.key)}
                            onCheckedChange={(checked) => togglePermission(permission.key, checked === true)}
                            className="mt-0.5"
                          />
                          <span>
                            {permission.action}
                            {permission.description && (
                              <span className="ml-1.5 text-navy-400">— {permission.description}</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Create role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}