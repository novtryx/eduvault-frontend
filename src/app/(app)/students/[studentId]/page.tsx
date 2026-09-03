'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, PenLine, Plus, Receipt as ReceiptIcon, Undo2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StudentStatusBadge } from '@/components/shared/student-status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { PaymentMethodBadge } from '@/components/shared/payment-method-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { TermSelect } from '@/components/shared/term-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/auth-context';
import { useAcademicSessions } from '@/features/schools/hooks';
import { useStudent, useStudentBalance } from '@/features/students/hooks';
import { usePayments } from '@/features/payments/hooks';
import { StudentFormDialog } from '@/features/students/student-form-dialog';
import { WhatsAppReminderDialog } from '@/features/payments/whatsapp-reminder-dialog';
import { ReversePaymentDialog } from '@/features/payments/reverse-payment-dialog';
import { formatDate } from '@/lib/format-date';
import { hasPermission } from '@/lib/permissions';
import type { Payment } from '@/types/entities';

export default function StudentProfilePage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const { currentSchoolId, currentMembership, isOwner, permissionKeys } = useAuth();

  const studentQuery = useStudent(currentSchoolId, params.studentId);
  const sessionsQuery = useAcademicSessions(currentSchoolId);

  const [termId, setTermId] = React.useState<string | undefined>(undefined);
  const [editOpen, setEditOpen] = React.useState(false);
  const [reminderOpen, setReminderOpen] = React.useState(false);
  const [reversingPayment, setReversingPayment] = React.useState<Payment | null>(null);

  React.useEffect(() => {
    if (termId || !sessionsQuery.data) return;
    const currentSession = sessionsQuery.data.find((s) => s.isCurrent) ?? sessionsQuery.data[0];
    const currentTerm = currentSession?.terms?.find((t) => t.isCurrent) ?? currentSession?.terms?.[0];
    if (currentTerm) setTermId(currentTerm.id);
  }, [sessionsQuery.data, termId]);

  const balanceQuery = useStudentBalance(currentSchoolId, params.studentId, termId);
  const paymentsQuery = usePayments(currentSchoolId, {
    studentId: params.studentId,
    page: 1,
    limit: 20,
  });

  const canUpdate = hasPermission('students:update', { isOwner, permissionKeys });
  const canRecordPayment = hasPermission('payments:create', { isOwner, permissionKeys });
  const canReverse = hasPermission('payments:reverse', { isOwner, permissionKeys });

  if (studentQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (studentQuery.isError || !studentQuery.data) {
    return <ErrorState error={studentQuery.error} title="Couldn't load this student" onRetry={() => studentQuery.refetch()} />;
  }

  const student = studentQuery.data;
  const balance = balanceQuery.data;
  const progressPercent =
    balance?.expectedFeeKobo && balance.expectedFeeKobo > 0
      ? Math.min(100, Math.round((balance.totalPaidKobo / balance.expectedFeeKobo) * 100))
      : null;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2 text-navy-400" onClick={() => router.push('/students')}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Students
        </Button>
        <PageHeader
          title={student.fullName}
          description={`${student.admissionNumber} · ${student.class?.name ?? 'Unassigned'}`}
          actions={
            <div className="flex items-center gap-2">
              {sessionsQuery.data && sessionsQuery.data.length > 0 && (
                <TermSelect sessions={sessionsQuery.data} value={termId} onChange={setTermId} className="w-[180px]" />
              )}
              {canUpdate && (
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                  <PenLine className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          }
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Fee Summary</CardTitle>
          <StudentStatusBadge status={student.status} />
        </CardHeader>
        <CardContent>
          {balanceQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : balanceQuery.isError ? (
            <ErrorState error={balanceQuery.error} onRetry={() => balanceQuery.refetch()} />
          ) : balance ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[12.5px] text-navy-400">Expected Fee</p>
                  <CurrencyDisplay kobo={balance.expectedFeeKobo} className="text-[20px]" />
                </div>
                <div>
                  <p className="text-[12.5px] text-navy-400">Amount Paid</p>
                  <CurrencyDisplay kobo={balance.totalPaidKobo} className="text-[20px]" />
                </div>
                <div>
                  <p className="text-[12.5px] text-navy-400">
                    {balance.isOverpaid ? 'Overpaid By' : 'Outstanding'}
                  </p>
                  {balance.isOverpaid ? (
                    <Badge variant="info" className="mt-1">
                      Overpaid
                    </Badge>
                  ) : (
                    <CurrencyDisplay kobo={balance.outstandingKobo} className="text-[20px]" />
                  )}
                </div>
              </div>

              {progressPercent !== null && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12.5px] text-navy-400">
                    <span>Payment progress</span>
                    <span className="font-medium text-navy-700">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-navy-900 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {canRecordPayment && (
                  <Button size="sm" asChild>
                    <Link href={`/payments/record?studentId=${student.id}${termId ? `&termId=${termId}` : ''}`}>
                      <Plus className="h-3.5 w-3.5" />
                      Record Payment
                    </Link>
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setReminderOpen(true)}>
                  <MessageCircle className="h-3.5 w-3.5" />
                  Send Reminder
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[13.5px] text-navy-400">Select a term to see this student&apos;s balance.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent / Guardian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[12.5px] text-navy-400">Name</p>
              <p className="text-[13.5px] text-navy-800">{student.parentName ?? '—'}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-navy-400">Phone</p>
              <p className="text-[13.5px] text-navy-800">{student.parentPhone ?? '—'}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-navy-400">Email</p>
              <p className="text-[13.5px] text-navy-800">{student.parentEmail ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : paymentsQuery.isError ? (
            <ErrorState error={paymentsQuery.error} onRetry={() => paymentsQuery.refetch()} />
          ) : paymentsQuery.data && paymentsQuery.data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsQuery.data.items.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-navy-500">{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="text-navy-500">{payment.term?.name ?? '—'}</TableCell>
                    <TableCell>
                      <PaymentMethodBadge method={payment.method} />
                    </TableCell>
                    <TableCell className="text-navy-500">{payment.reference ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {payment.status === 'ACTIVE' ? 'Active' : 'Reversed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay kobo={payment.amountKobo} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/receipts/${payment.id}`}>
                            <ReceiptIcon className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                        {canReverse && payment.status === 'ACTIVE' && (
                          <Button variant="ghost" size="sm" onClick={() => setReversingPayment(payment)}>
                            <Undo2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No payments yet" description="Payments recorded for this student will appear here." />
          )}
        </CardContent>
      </Card>

      <StudentFormDialog open={editOpen} onOpenChange={setEditOpen} student={student} />
      <WhatsAppReminderDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        studentName={student.fullName}
        parentName={student.parentName}
        parentPhone={student.parentPhone}
        outstandingKobo={balance?.outstandingKobo}
        schoolName={currentMembership?.schoolName}
      />
      <ReversePaymentDialog
        schoolId={currentSchoolId}
        payment={reversingPayment}
        open={Boolean(reversingPayment)}
        onOpenChange={(open) => !open && setReversingPayment(null)}
      />
    </div>
  );
}