'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, MessageCircle, Plus, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { ClassSelect } from '@/components/shared/class-select';
import { TermSelect } from '@/components/shared/term-select';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/auth-context';
import { useAcademicSessions } from '@/features/schools/hooks';
import { useClasses } from '@/features/classes/hooks';
import { useStudent } from '@/features/students/hooks';
import { useDashboardSummary } from '@/features/dashboard/hooks';
import { useOutstandingReport } from '@/features/reports/hooks';
import { WhatsAppReminderDialog } from '@/features/payments/whatsapp-reminder-dialog';
import { hasPermission } from '@/lib/permissions';

const PAGE_SIZE = 15;

export default function OutstandingPage() {
  const { currentSchoolId, currentMembership, isOwner, permissionKeys } = useAuth();
  const sessionsQuery = useAcademicSessions(currentSchoolId);
  const classesQuery = useClasses(currentSchoolId);

  const [termId, setTermId] = React.useState<string | undefined>(undefined);
  const [classId, setClassId] = React.useState<string>('all');
  const [page, setPage] = React.useState(1);
  const [reminderStudentId, setReminderStudentId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (termId || !sessionsQuery.data) return;
    const currentSession = sessionsQuery.data.find((s) => s.isCurrent) ?? sessionsQuery.data[0];
    const currentTerm = currentSession?.terms?.find((t) => t.isCurrent) ?? currentSession?.terms?.[0];
    if (currentTerm) setTermId(currentTerm.id);
  }, [sessionsQuery.data, termId]);

  const summaryQuery = useDashboardSummary(currentSchoolId, termId);

  // GET /reports/outstanding is NOT paginated on the backend — it returns
  // every matching row as a plain array (capped server-side, throwing a
  // 400 if the school has more than MAX_REPORT_ROWS outstanding students
  // for the given filters). We paginate the already-fetched array
  // client-side purely for a readable table; the server did the real
  // filtering by term/class.
  const outstandingQuery = useOutstandingReport(currentSchoolId, {
    termId: termId as string,
    classId: classId !== 'all' ? classId : undefined,
  });

  const allRows = outstandingQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const pageRows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [termId, classId]);

  const reminderStudentQuery = useStudent(currentSchoolId, reminderStudentId);

  const canRecordPayment = hasPermission('payments:create', { isOwner, permissionKeys });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outstanding Fees"
        description="Everyone who currently owes a balance, and how much."
        actions={
          sessionsQuery.data && sessionsQuery.data.length > 0 ? (
            <TermSelect sessions={sessionsQuery.data} value={termId} onChange={setTermId} className="w-[200px]" />
          ) : undefined
        }
      />

      {summaryQuery.data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total Outstanding" value={<CurrencyDisplay kobo={summaryQuery.data.outstandingKobo} emphasis />} emphasis />
          <StatCard label="Students Owing" value={allRows.length.toLocaleString()} />
          <StatCard label="Collection Rate" value={`${summaryQuery.data.collectionRatePercent.toFixed(1)}%`} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <ClassSelect classes={classesQuery.data ?? []} value={classId} onChange={setClassId} includeAll />
      </div>

      <Card>
        {outstandingQuery.isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        ) : outstandingQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState error={outstandingQuery.error} onRetry={() => outstandingQuery.refetch()} />
          </CardContent>
        ) : pageRows.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>
                      <Link href={`/students/${row.studentId}`} className="font-medium text-navy-900 hover:underline">
                        {row.fullName}
                      </Link>
                      <p className="text-[12px] text-navy-400">{row.admissionNumber}</p>
                    </TableCell>
                    <TableCell className="text-navy-500">{row.className ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay kobo={row.expectedFeeKobo} muted />
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay kobo={row.totalPaidKobo} muted />
                    </TableCell>
                    <TableCell className="text-right">
                      {row.isOverpaid ? (
                        <Badge variant="info">Overpaid</Badge>
                      ) : (
                        <CurrencyDisplay kobo={row.outstandingKobo} />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReminderStudentId(row.studentId)}
                          title="Send WhatsApp reminder"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                        {canRecordPayment && (
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/payments/record?studentId=${row.studentId}${termId ? `&termId=${termId}` : ''}`}>
                              <Plus className="h-3.5 w-3.5" />
                              Record
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={allRows.length}
              limit={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        ) : (
          <CardContent className="p-0">
            <EmptyState
              icon={classId !== 'all' ? <AlertCircle className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              title={classId !== 'all' ? 'No one in this class owes a balance' : 'Everyone is fully paid up'}
              description="No students currently have an outstanding balance for this term."
            />
          </CardContent>
        )}
      </Card>

      <WhatsAppReminderDialog
        open={Boolean(reminderStudentId)}
        onOpenChange={(open) => !open && setReminderStudentId(null)}
        studentName={reminderStudentQuery.data?.fullName ?? ''}
        parentName={reminderStudentQuery.data?.parentName}
        parentPhone={reminderStudentQuery.data?.parentPhone}
        outstandingKobo={allRows.find((r) => r.studentId === reminderStudentId)?.outstandingKobo}
        schoolName={currentMembership?.schoolName}
      />
    </div>
  );
}