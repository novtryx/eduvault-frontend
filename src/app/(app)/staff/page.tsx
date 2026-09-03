'use client';

import * as React from 'react';
import { MoreHorizontal, Plus, Shield, UserPlus, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/features/auth/auth-context';
import { useRemoveStaff, useStaff } from '@/features/staff/hooks';
import { useDeleteRole, useRoles } from '@/features/roles/hooks';
import { InviteStaffDialog } from '@/features/staff/invite-staff-dialog';
import { ChangeRoleDialog } from '@/features/staff/change-role-dialog';
import { RoleFormDialog } from '@/features/roles/role-form-dialog';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api-client';
import { formatDate } from '@/lib/format-date';
import type { Role, StaffMember } from '@/types/entities';

export default function StaffPage() {
  const { user, isOwner, permissionKeys } = useAuth();

  const canInvite = hasPermission('staff:create', { isOwner, permissionKeys });
  const canManageRoles = hasPermission('roles:create', { isOwner, permissionKeys });

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" description="Manage who has access to your school, and what they can do." />

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="team">
          <TeamTab currentUserId={user?.id} canInvite={canInvite} />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab canManage={canManageRoles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Team tab ─────────────────────────────────────────────────────────

function TeamTab({ currentUserId, canInvite }: { currentUserId?: string; canInvite: boolean }) {
  const { currentSchoolId } = useAuth();
  const { toast } = useToast();
  const staffQuery = useStaff(currentSchoolId);
  const removeMutation = useRemoveStaff(currentSchoolId);

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [changingRoleFor, setChangingRoleFor] = React.useState<StaffMember | null>(null);
  const [removingStaff, setRemovingStaff] = React.useState<StaffMember | null>(null);

  async function handleRemove() {
    if (!removingStaff) return;
    try {
      await removeMutation.mutateAsync(removingStaff.userId);
      toast({ title: 'Staff member removed', description: removingStaff.fullName });
      setRemovingStaff(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't remove staff member",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canInvite && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite Staff
          </Button>
        )}
      </div>

      <Card>
        {staffQuery.isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        ) : staffQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState error={staffQuery.error} onRetry={() => staffQuery.refetch()} />
          </CardContent>
        ) : staffQuery.data && staffQuery.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffQuery.data.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium text-navy-900">
                    {member.fullName}
                    {member.userId === currentUserId && <span className="ml-1.5 text-[12px] text-navy-400">(you)</span>}
                  </TableCell>
                  <TableCell className="text-navy-500">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={member.isSystem ? 'default' : 'outline'}>{member.roleName}</Badge>
                  </TableCell>
                  <TableCell className="text-navy-500">{formatDate(member.joinedAt)}</TableCell>
                  <TableCell>
                    {!member.isSystem && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setChangingRoleFor(member)}>Change role</DropdownMenuItem>
                          <DropdownMenuItem destructive onClick={() => setRemovingStaff(member)}>
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <CardContent className="p-0">
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No staff yet"
              description="Invite your team so they can help manage students, fees, and payments."
              action={
                canInvite ? (
                  <Button size="sm" onClick={() => setInviteOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    Invite Staff
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        )}
      </Card>

      <InviteStaffDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <ChangeRoleDialog open={Boolean(changingRoleFor)} onOpenChange={(o) => !o && setChangingRoleFor(null)} staffMember={changingRoleFor} />
      <ConfirmDialog
        open={Boolean(removingStaff)}
        onOpenChange={(o) => !o && setRemovingStaff(null)}
        title="Remove this staff member?"
        description={`${removingStaff?.fullName} will lose access to this school immediately.`}
        confirmLabel="Remove"
        destructive
        loading={removeMutation.isPending}
        onConfirm={handleRemove}
      />
    </div>
  );
}

// ── Roles tab ────────────────────────────────────────────────────────

function RolesTab({ canManage }: { canManage: boolean }) {
  const { currentSchoolId } = useAuth();
  const { toast } = useToast();
  const rolesQuery = useRoles(currentSchoolId);
  const deleteMutation = useDeleteRole(currentSchoolId);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = React.useState<Role | null>(null);

  async function handleDelete() {
    if (!deletingRole) return;
    try {
      await deleteMutation.mutateAsync(deletingRole.id);
      toast({ title: 'Role deleted', description: deletingRole.name });
      setDeletingRole(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't delete role",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              setEditingRole(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Role
          </Button>
        )}
      </div>

      <Card>
        {rolesQuery.isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </CardContent>
        ) : rolesQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState
              error={rolesQuery.error}
              title="Couldn't load roles"
              onRetry={() => rolesQuery.refetch()}
            />
          </CardContent>
        ) : rolesQuery.data && rolesQuery.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Permissions</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesQuery.data.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium text-navy-900">
                    {role.name}
                    {role.isSystem && (
                      <Badge variant="default" className="ml-2">
                        <Shield className="mr-1 h-3 w-3" />
                        Protected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-navy-500">{role.description ?? '—'}</TableCell>
                  <TableCell className="text-right text-navy-500">{role.rolePermissions.length}</TableCell>
                  <TableCell>
                    {!role.isSystem && canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingRole(role);
                              setFormOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem destructive onClick={() => setDeletingRole(role)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <CardContent className="p-0">
            <EmptyState
              icon={<Shield className="h-5 w-5" />}
              title="No custom roles yet"
              description="Every school starts with a protected Owner role. Create additional roles to give staff limited access."
              action={
                canManage ? (
                  <Button size="sm" onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    New Role
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        )}
      </Card>

      <RoleFormDialog open={formOpen} onOpenChange={setFormOpen} role={editingRole} />
      <ConfirmDialog
        open={Boolean(deletingRole)}
        onOpenChange={(o) => !o && setDeletingRole(null)}
        title="Delete this role?"
        description={`"${deletingRole?.name}" will be permanently deleted. This only works if no staff are currently assigned to it.`}
        confirmLabel="Delete role"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}