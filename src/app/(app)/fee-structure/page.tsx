'use client';

import * as React from 'react';
import { MoreHorizontal, Plus, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { TermSelect } from '@/components/shared/term-select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useClasses } from '@/features/classes/hooks';
import { useDeleteFeeStructure, useFeeStructures } from '@/features/fees/hooks';
import { FeeStructureFormDialog } from '@/features/fees/fee-structure-form-dialog';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api-client';
import type { FeeStructure } from '@/types/entities';

export default function FeeStructurePage() {
  const { currentSchoolId, isOwner, permissionKeys } = useAuth();
  const { toast } = useToast();

  const sessionsQuery = useAcademicSessions(currentSchoolId);
  const classesQuery = useClasses(currentSchoolId);
  const [termId, setTermId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (termId || !sessionsQuery.data) return;
    const currentSession = sessionsQuery.data.find((s) => s.isCurrent) ?? sessionsQuery.data[0];
    const currentTerm = currentSession?.terms?.find((t) => t.isCurrent) ?? currentSession?.terms?.[0];
    if (currentTerm) setTermId(currentTerm.id);
  }, [sessionsQuery.data, termId]);

  const activeSession = sessionsQuery.data?.find((s) => s.terms?.some((t) => t.id === termId));
  const activeTerm = activeSession?.terms?.find((t) => t.id === termId);

  const feeStructuresQuery = useFeeStructures(currentSchoolId, termId);
  const deleteMutation = useDeleteFeeStructure(currentSchoolId);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingFee, setEditingFee] = React.useState<FeeStructure | null>(null);
  const [presetClassId, setPresetClassId] = React.useState<string | undefined>(undefined);
  const [deletingFee, setDeletingFee] = React.useState<FeeStructure | null>(null);

  const canCreate = hasPermission('fees:create', { isOwner, permissionKeys });
  const canUpdate = hasPermission('fees:update', { isOwner, permissionKeys });
  const canDelete = hasPermission('fees:delete', { isOwner, permissionKeys });

  const feeByClassId = React.useMemo(() => {
    const map = new Map<string, FeeStructure>();
    feeStructuresQuery.data?.forEach((fs) => map.set(fs.classId, fs));
    return map;
  }, [feeStructuresQuery.data]);

  async function handleDelete() {
    if (!deletingFee) return;
    try {
      await deleteMutation.mutateAsync(deletingFee.id);
      toast({ title: 'Fee structure removed' });
      setDeletingFee(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't remove fee structure",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  const classes = classesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structure"
        description="Set the expected fee per class for a term."
        actions={
          sessionsQuery.data && sessionsQuery.data.length > 0 ? (
            <TermSelect sessions={sessionsQuery.data} value={termId} onChange={setTermId} className="w-[200px]" />
          ) : undefined
        }
      />

      <Card>
        {classesQuery.isLoading || feeStructuresQuery.isLoading ? (
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
        ) : feeStructuresQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState error={feeStructuresQuery.error} onRetry={() => feeStructuresQuery.refetch()} />
          </CardContent>
        ) : classes.length === 0 ? (
          <CardContent className="p-0">
            <EmptyState
              icon={<Wallet className="h-5 w-5" />}
              title="No classes yet"
              description="Add classes first, then set a fee for each one here."
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Fee Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((klass) => {
                const fee = feeByClassId.get(klass.id);
                return (
                  <TableRow key={klass.id}>
                    <TableCell className="font-medium text-navy-900">{klass.name}</TableCell>
                    <TableCell className="text-right">
                      {fee ? (
                        <div className="flex flex-col items-end">
                          <CurrencyDisplay kobo={fee.amountKobo} />
                          {fee.components && fee.components.length > 0 && (
                            <span className="text-[11.5px] text-navy-400">
                              {fee.components.map((c) => c.label).join(' + ')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-navy-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {fee ? (
                        <Badge variant="success">Set</Badge>
                      ) : (
                        <Badge variant="warning">Not set</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!fee && canCreate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingFee(null);
                            setPresetClassId(klass.id);
                            setFormOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Set fee
                        </Button>
                      )}
                      {fee && (canUpdate || canDelete) && (
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
                                  setEditingFee(fee);
                                  setPresetClassId(undefined);
                                  setFormOpen(true);
                                }}
                              >
                                Edit amount
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem destructive onClick={() => setDeletingFee(fee)}>
                                Remove
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
        )}
      </Card>

      {activeSession && activeTerm && (
        <FeeStructureFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          academicSessionId={activeSession.id}
          termId={activeTerm.id}
          termName={`${activeSession.name} · ${activeTerm.name}`}
          classes={classes}
          feeStructure={editingFee}
          presetClassId={presetClassId}
        />
      )}

      <ConfirmDialog
        open={Boolean(deletingFee)}
        onOpenChange={(open) => !open && setDeletingFee(null)}
        title="Remove this fee structure?"
        description="Students in this class will no longer have an expected fee for this term until a new one is set."
        confirmLabel="Remove"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}