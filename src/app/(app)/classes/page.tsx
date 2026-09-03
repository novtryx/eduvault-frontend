'use client';

import * as React from 'react';
import { GraduationCap, MoreHorizontal, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { TermSelect } from '@/components/shared/term-select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/features/auth/auth-context';
import { useAcademicSessions } from '@/features/schools/hooks';
import { useClasses, useDeleteClass } from '@/features/classes/hooks';
import { useCollectionSummary } from '@/features/reports/hooks';
import { ClassFormDialog } from '@/features/classes/class-form-dialog';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api-client';
import type { SchoolClass } from '@/types/entities';

export default function ClassesPage() {
  const { currentSchoolId, isOwner, permissionKeys } = useAuth();
  const { toast } = useToast();

  const classesQuery = useClasses(currentSchoolId);
  const sessionsQuery = useAcademicSessions(currentSchoolId);
  const [termId, setTermId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (termId || !sessionsQuery.data) return;
    const currentSession = sessionsQuery.data.find((s) => s.isCurrent) ?? sessionsQuery.data[0];
    const currentTerm = currentSession?.terms?.find((t) => t.isCurrent) ?? currentSession?.terms?.[0];
    if (currentTerm) setTermId(currentTerm.id);
  }, [sessionsQuery.data, termId]);

  const summaryQuery = useCollectionSummary(currentSchoolId, termId);
  const deleteMutation = useDeleteClass(currentSchoolId);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<SchoolClass | null>(null);
  const [deletingClass, setDeletingClass] = React.useState<SchoolClass | null>(null);

  const canCreate = hasPermission('classes:create', { isOwner, permissionKeys });
  const canUpdate = hasPermission('classes:update', { isOwner, permissionKeys });
  const canDelete = hasPermission('classes:delete', { isOwner, permissionKeys });

  const financialsByClassId = React.useMemo(() => {
    const map = new Map<string, { expectedKobo: number; collectedKobo: number; outstandingKobo: number }>();
    summaryQuery.data?.byClass.forEach((row) => map.set(row.classId, row));
    return map;
  }, [summaryQuery.data]);

  async function handleDelete() {
    if (!deletingClass) return;
    try {
      await deleteMutation.mutateAsync(deletingClass.id);
      toast({ title: 'Class deleted', description: deletingClass.name });
      setDeletingClass(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't delete class",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Student counts and fee collection, broken down by class."
        actions={
          <div className="flex items-center gap-2">
            {sessionsQuery.data && sessionsQuery.data.length > 0 && (
              <TermSelect sessions={sessionsQuery.data} value={termId} onChange={setTermId} className="w-[180px]" />
            )}
            {canCreate && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingClass(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Class
              </Button>
            )}
          </div>
        }
      />

      <Card>
        {classesQuery.isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        ) : classesQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState error={classesQuery.error} onRetry={() => classesQuery.refetch()} />
          </CardContent>
        ) : classesQuery.data && classesQuery.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Collected</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {classesQuery.data.map((klass) => {
                const financials = financialsByClassId.get(klass.id);
                return (
                  <TableRow key={klass.id}>
                    <TableCell className="font-medium text-navy-900">{klass.name}</TableCell>
                    <TableCell className="text-right text-navy-500">
                      {klass.studentCount ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {financials ? <CurrencyDisplay kobo={financials.expectedKobo} muted /> : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {financials ? <CurrencyDisplay kobo={financials.collectedKobo} /> : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {financials ? <CurrencyDisplay kobo={financials.outstandingKobo} /> : '—'}
                    </TableCell>
                    <TableCell>
                      {(canUpdate || canDelete) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canUpdate && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingClass(klass);
                                  setFormOpen(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem destructive onClick={() => setDeletingClass(klass)}>
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <CardContent className="p-0">
            <EmptyState
              icon={<GraduationCap className="h-5 w-5" />}
              title="No classes yet"
              description="Add your first class to start assigning students and fee structures."
              action={
                canCreate ? (
                  <Button size="sm" onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Class
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        )}
      </Card>

      <ClassFormDialog open={formOpen} onOpenChange={setFormOpen} klass={editingClass} />

      <ConfirmDialog
        open={Boolean(deletingClass)}
        onOpenChange={(open) => !open && setDeletingClass(null)}
        title="Delete this class?"
        description={`"${deletingClass?.name}" will be permanently removed. Students currently assigned to it will become unassigned.`}
        confirmLabel="Delete class"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}