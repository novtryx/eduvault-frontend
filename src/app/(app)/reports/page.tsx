'use client';

import * as React from 'react';
import { Download, FileBarChart } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { PaymentMethodBadge } from '@/components/shared/payment-method-badge';
import { ClassSelect } from '@/components/shared/class-select';
import { TermSelect } from '@/components/shared/term-select';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/features/auth/auth-context';
import { useAcademicSessions } from '@/features/schools/hooks';
import { useClasses } from '@/features/classes/hooks';
import { useCollectionSummary, useOutstandingReport, usePaymentHistoryReport } from '@/features/reports/hooks';
import { reportsExportApi } from '@/features/reports/api';
import { hasPermission } from '@/lib/permissions';
import { ApiError } from '@/lib/api-client';
import { formatDate } from '@/lib/format-date';
import type { SchoolClass } from '@/types/entities';

export default function ReportsPage() {
  const { currentSchoolId, isOwner, permissionKeys } = useAuth();
  const sessionsQuery = useAcademicSessions(currentSchoolId);
  const classesQuery = useClasses(currentSchoolId);
  const { toast } = useToast();

  const [termId, setTermId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (termId || !sessionsQuery.data) return;
    const currentSession = sessionsQuery.data.find((s) => s.isCurrent) ?? sessionsQuery.data[0];
    const currentTerm = currentSession?.terms?.find((t) => t.isCurrent) ?? currentSession?.terms?.[0];
    if (currentTerm) setTermId(currentTerm.id);
  }, [sessionsQuery.data, termId]);

  const canExport = hasPermission('reports:export', { isOwner, permissionKeys });

  async function handleExport(exportFn: () => Promise<void>, label: string) {
    try {
      await exportFn();
      toast({ title: 'Export ready', description: `${label} downloaded.` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't export report",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Reports"
        description="Collection performance, outstanding fees, and payment history."
        actions={
          sessionsQuery.data && sessionsQuery.data.length > 0 ? (
            <TermSelect sessions={sessionsQuery.data} value={termId} onChange={setTermId} className="w-[200px]" />
          ) : undefined
        }
      />

      <Tabs defaultValue="collection">
        <TabsList>
          <TabsTrigger value="collection">Collection Summary</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding Fees</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="collection">
          <CollectionSummaryTab
            schoolId={currentSchoolId}
            termId={termId}
            canExport={canExport}
            onExport={() => handleExport(() => reportsExportApi.collectionSummary(currentSchoolId as string, termId as string), 'Collection summary')}
          />
        </TabsContent>

        <TabsContent value="outstanding">
          <OutstandingTab
            schoolId={currentSchoolId}
            termId={termId}
            classes={classesQuery.data ?? []}
            canExport={canExport}
            onExport={(classId) =>
              handleExport(
                () => reportsExportApi.outstanding(currentSchoolId as string, { termId: termId as string, classId }),
                'Outstanding fees',
              )
            }
          />
        </TabsContent>

        <TabsContent value="history">
          <PaymentHistoryTab
            schoolId={currentSchoolId}
            termId={termId}
            classes={classesQuery.data ?? []}
            canExport={canExport}
            onExport={(params) =>
              handleExport(() => reportsExportApi.paymentHistory(currentSchoolId as string, params), 'Payment history')
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Collection Summary ──────────────────────────────────────────────

function CollectionSummaryTab({
  schoolId,
  termId,
  canExport,
  onExport,
}: {
  schoolId: string | null;
  termId?: string;
  canExport: boolean;
  onExport: () => void;
}) {
  const summaryQuery = useCollectionSummary(schoolId, termId);

  if (summaryQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (summaryQuery.isError) {
    return <ErrorState error={summaryQuery.error} onRetry={() => summaryQuery.refetch()} />;
  }

  const summary = summaryQuery.data;
  if (!summary) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Expected" value={<CurrencyDisplay kobo={summary.expectedKobo} emphasis />} emphasis />
        <StatCard label="Collected" value={<CurrencyDisplay kobo={summary.collectedKobo} emphasis />} emphasis />
        <StatCard label="Outstanding" value={<CurrencyDisplay kobo={summary.outstandingKobo} emphasis />} emphasis />
        <StatCard label="Collection Rate" value={`${summary.collectionRatePercent.toFixed(1)}%`} sublabel={summary.termName} />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-6 pb-4">
          <p className="text-[14px] font-medium text-navy-900">By Class</p>
          {canExport && (
            <Button variant="secondary" size="sm" onClick={onExport}>
              <Download className="h-3.5 w-3.5" />
              Export Excel
            </Button>
          )}
        </CardContent>
        {summary.byClass.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Collected</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.byClass.map((row) => (
                <TableRow key={row.classId}>
                  <TableCell className="font-medium text-navy-900">{row.className}</TableCell>
                  <TableCell className="text-right text-navy-500">{row.studentCount}</TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay kobo={row.expectedKobo} muted />
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay kobo={row.collectedKobo} />
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay kobo={row.outstandingKobo} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <CardContent className="p-0">
            <EmptyState title="No data for this term" description="Once fees and payments exist for this term, the breakdown will appear here." />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ── Outstanding Fees ─────────────────────────────────────────────────

function OutstandingTab({
  schoolId,
  termId,
  classes,
  canExport,
  onExport,
}: {
  schoolId: string | null;
  termId?: string;
  classes: SchoolClass[];
  canExport: boolean;
  onExport: (classId?: string) => void;
}) {
  const [classId, setClassId] = React.useState('all');
  const outstandingQuery = useOutstandingReport(schoolId, {
    termId: termId as string,
    classId: classId !== 'all' ? classId : undefined,
  });

  const rows = outstandingQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <ClassSelect classes={classes} value={classId} onChange={setClassId} includeAll />
        {canExport && (
          <Button variant="secondary" size="sm" onClick={() => onExport(classId !== 'all' ? classId : undefined)}>
            <Download className="h-3.5 w-3.5" />
            Export Excel
          </Button>
        )}
      </div>

      <Card>
        {outstandingQuery.isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          </CardContent>
        ) : outstandingQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState error={outstandingQuery.error} onRetry={() => outstandingQuery.refetch()} />
          </CardContent>
        ) : rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.studentId}>
                  <TableCell className="font-medium text-navy-900">{row.fullName}</TableCell>
                  <TableCell className="text-navy-500">{row.className ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay kobo={row.expectedFeeKobo} muted />
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay kobo={row.totalPaidKobo} muted />
                  </TableCell>
                  <TableCell className="text-right">
                    {row.isOverpaid ? <Badge variant="info">Overpaid</Badge> : <CurrencyDisplay kobo={row.outstandingKobo} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <CardContent className="p-0">
            <EmptyState icon={<FileBarChart className="h-5 w-5" />} title="No outstanding balances" description="Nobody currently owes a balance for this term." />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ── Payment History ──────────────────────────────────────────────────

function PaymentHistoryTab({
  schoolId,
  termId,
  classes,
  canExport,
  onExport,
}: {
  schoolId: string | null;
  termId?: string;
  classes: SchoolClass[];
  canExport: boolean;
  onExport: (params: { termId?: string; classId?: string; fromDate?: string; toDate?: string }) => void;
}) {
  const [classId, setClassId] = React.useState('all');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const params = {
    termId,
    classId: classId !== 'all' ? classId : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };
  const historyQuery = usePaymentHistoryReport(schoolId, params);
  const rows = historyQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <ClassSelect classes={classes} value={classId} onChange={setClassId} includeAll />
        <div className="space-y-1">
          <Label htmlFor="fromDate" className="text-[11.5px]">From</Label>
          <Input id="fromDate" type="date" className="w-[150px]" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="toDate" className="text-[11.5px]">To</Label>
          <Input id="toDate" type="date" className="w-[150px]" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        {canExport && (
          <Button variant="secondary" size="sm" onClick={() => onExport(params)}>
            <Download className="h-3.5 w-3.5" />
            Export Excel
          </Button>
        )}
      </div>

      <Card>
        {historyQuery.isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          </CardContent>
        ) : historyQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState error={historyQuery.error} onRetry={() => historyQuery.refetch()} />
          </CardContent>
        ) : rows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-navy-500">{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell className="font-medium text-navy-900">{payment.student?.fullName ?? '—'}</TableCell>
                  <TableCell className="text-navy-500">{payment.student?.class?.name ?? '—'}</TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={payment.method} />
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay kobo={payment.amountKobo} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {payment.status === 'ACTIVE' ? 'Active' : 'Reversed'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <CardContent className="p-0">
            <EmptyState title="No payments found" description="Try adjusting your filters." />
          </CardContent>
        )}
      </Card>
    </div>
  );
}