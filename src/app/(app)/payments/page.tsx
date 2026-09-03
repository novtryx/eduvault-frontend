'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Receipt as ReceiptIcon, Undo2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { PaymentMethodBadge } from '@/components/shared/payment-method-badge';
import { ClassSelect } from '@/components/shared/class-select';
import { TermSelect } from '@/components/shared/term-select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/auth-context';
import { useAcademicSessions } from '@/features/schools/hooks';
import { useClasses } from '@/features/classes/hooks';
import { usePayments } from '@/features/payments/hooks';
import { ReversePaymentDialog } from '@/features/payments/reverse-payment-dialog';
import { formatDate } from '@/lib/format-date';
import { hasPermission } from '@/lib/permissions';
import type { Payment, PaymentMethod } from '@/types/entities';

export default function PaymentsPage() {
  const { currentSchoolId, isOwner, permissionKeys } = useAuth();
  const sessionsQuery = useAcademicSessions(currentSchoolId);
  const classesQuery = useClasses(currentSchoolId);

  const [page, setPage] = React.useState(1);
  const [termId, setTermId] = React.useState<string | undefined>(undefined);
  const [classId, setClassId] = React.useState<string>('all');
  const [method, setMethod] = React.useState<string>('all');

  const paymentsQuery = usePayments(currentSchoolId, {
    page,
    limit: 20,
    termId,
    classId: classId !== 'all' ? classId : undefined,
    method: method !== 'all' ? (method as PaymentMethod) : undefined,
  });

  const canCreate = hasPermission('payments:create', { isOwner, permissionKeys });
  const canReverse = hasPermission('payments:reverse', { isOwner, permissionKeys });
  const [reversingPayment, setReversingPayment] = React.useState<Payment | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Every payment recorded across your school."
        actions={
          canCreate ? (
            <Button size="sm" asChild>
              <Link href="/payments/record">
                <Plus className="h-4 w-4" />
                Record Payment
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        {sessionsQuery.data && sessionsQuery.data.length > 0 && (
          <TermSelect
            sessions={sessionsQuery.data}
            value={termId}
            onChange={(v) => {
              setTermId(v);
              setPage(1);
            }}
            className="w-[180px]"
          />
        )}
        <ClassSelect
          classes={classesQuery.data ?? []}
          value={classId}
          onChange={(v) => {
            setClassId(v);
            setPage(1);
          }}
          includeAll
        />
        <Select
          value={method}
          onValueChange={(v) => {
            setMethod(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            <SelectItem value="POS">POS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        {paymentsQuery.isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        ) : paymentsQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState error={paymentsQuery.error} onRetry={() => paymentsQuery.refetch()} />
          </CardContent>
        ) : paymentsQuery.data && paymentsQuery.data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsQuery.data.items.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-navy-500">{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <Link href={`/students/${payment.studentId}`} className="font-medium text-navy-900 hover:underline">
                        {payment.student?.fullName ?? '—'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-navy-500">{payment.student?.class?.name ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay kobo={payment.amountKobo} />
                    </TableCell>
                    <TableCell>
                      <PaymentMethodBadge method={payment.method} />
                    </TableCell>
                    <TableCell className="text-navy-500">{payment.reference ?? '—'}</TableCell>
                    <TableCell className="text-navy-500">{payment.recordedByUser?.fullName ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {payment.status === 'ACTIVE' ? 'Active' : 'Reversed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/receipts/${payment.id}`}>
                            <ReceiptIcon className="h-3.5 w-3.5" />
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
            <Pagination
              page={paymentsQuery.data.page}
              totalPages={paymentsQuery.data.totalPages}
              total={paymentsQuery.data.total}
              limit={paymentsQuery.data.limit}
              onPageChange={setPage}
            />
          </>
        ) : (
          <CardContent className="p-0">
            <EmptyState
              title="No payments found"
              description="Try adjusting your filters, or record a new payment."
              action={
                canCreate ? (
                  <Button size="sm" asChild>
                    <Link href="/payments/record">
                      <Plus className="h-4 w-4" />
                      Record Payment
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        )}
      </Card>

      <ReversePaymentDialog
        schoolId={currentSchoolId}
        payment={reversingPayment}
        open={Boolean(reversingPayment)}
        onOpenChange={(open) => !open && setReversingPayment(null)}
      />
    </div>
  );
}