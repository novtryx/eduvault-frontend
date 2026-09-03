'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { CollectionChart } from '@/components/shared/collection-chart';
import { TermSelect } from '@/components/shared/term-select';
import { PaymentMethodBadge } from '@/components/shared/payment-method-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-context';
import { useAcademicSessions } from '@/features/schools/hooks';
import {
  useCollectionOverview,
  useDashboardOutstanding,
  useDashboardSummary,
  useRecentPayments,
} from '@/features/dashboard/hooks';
import { formatDate } from '@/lib/format-date';

export default function DashboardPage() {
  const { user, currentSchoolId, currentMembership } = useAuth();
  const sessionsQuery = useAcademicSessions(currentSchoolId);
  const [termId, setTermId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (termId || !sessionsQuery.data) return;
    const currentSession = sessionsQuery.data.find((s) => s.isCurrent) ?? sessionsQuery.data[0];
    const currentTerm = currentSession?.terms?.find((t) => t.isCurrent) ?? currentSession?.terms?.[0];
    if (currentTerm) setTermId(currentTerm.id);
  }, [sessionsQuery.data, termId]);

  const summaryQuery = useDashboardSummary(currentSchoolId, termId);
  const overviewQuery = useCollectionOverview(currentSchoolId, termId);
  const recentPaymentsQuery = useRecentPayments(currentSchoolId, 5);
  const outstandingQuery = useDashboardOutstanding(currentSchoolId, termId, { limit: 5 });

  const firstName = user?.fullName?.split(' ')[0];

  if (sessionsQuery.isSuccess && sessionsQuery.data.length === 0) {
    return (
      <div className="space-y-8 pb-10">
        <PageHeader
          title={firstName ? `Good day, ${firstName}` : 'Dashboard'}
          description={
            currentMembership ? `Welcome to ${currentMembership.schoolName} on EduVault.` : undefined
          }
        />
        <EmptyState
          icon={<Calendar className="h-5 w-5" />}
          title="Set up your first academic session"
          description="Before you can track fees or record payments, create an academic session and at least one term. It only takes a minute."
          action={
            <Button size="sm" asChild>
              <Link href="/settings">
                Go to Settings
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title={firstName ? `Good day, ${firstName}` : 'Dashboard'}
        description={
          currentMembership
            ? `Here's how ${currentMembership.schoolName} is doing this term.`
            : undefined
        }
        actions={
          sessionsQuery.data && sessionsQuery.data.length > 0 ? (
            <TermSelect sessions={sessionsQuery.data} value={termId} onChange={setTermId} />
          ) : undefined
        }
      />

      {/* Expected | Collected | Outstanding | Students */}
      {summaryQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
      ) : summaryQuery.isError ? (
        <ErrorState error={summaryQuery.error} onRetry={() => summaryQuery.refetch()} />
      ) : summaryQuery.data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Expected Fees" value={<CurrencyDisplay kobo={summaryQuery.data.expectedKobo} emphasis />} emphasis />
          <StatCard
            label="Total Collected"
            value={<CurrencyDisplay kobo={summaryQuery.data.collectedKobo} emphasis />}
            sublabel={`${summaryQuery.data.collectionRatePercent.toFixed(1)}% collection rate`}
            emphasis
          />
          <StatCard label="Outstanding" value={<CurrencyDisplay kobo={summaryQuery.data.outstandingKobo} emphasis />} emphasis />
          <StatCard
            label="Students"
            value={summaryQuery.data.totalStudents.toLocaleString()}
            sublabel={summaryQuery.data.termName}
          />
        </div>
      ) : null}

      {/* Collection Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {overviewQuery.isLoading ? (
            <Skeleton className="h-[220px] rounded-lg" />
          ) : overviewQuery.isError ? (
            <ErrorState error={overviewQuery.error} onRetry={() => overviewQuery.refetch()} />
          ) : overviewQuery.data ? (
            <CollectionChart overview={overviewQuery.data} />
          ) : null}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Payments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/payments">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentPaymentsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : recentPaymentsQuery.isError ? (
            <ErrorState error={recentPaymentsQuery.error} onRetry={() => recentPaymentsQuery.refetch()} />
          ) : recentPaymentsQuery.data && recentPaymentsQuery.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPaymentsQuery.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-navy-900">
                      {payment.student?.fullName ?? '—'}
                    </TableCell>
                    <TableCell>
                      <PaymentMethodBadge method={payment.method} />
                    </TableCell>
                    <TableCell className="text-navy-500">{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay kobo={payment.amountKobo} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No payments recorded yet"
              description="Once you record a payment, it will show up here."
            />
          )}
        </CardContent>
      </Card>

      {/* Students With Outstanding Fees */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Students With Outstanding Fees</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/outstanding">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {outstandingQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : outstandingQuery.isError ? (
            <ErrorState error={outstandingQuery.error} onRetry={() => outstandingQuery.refetch()} />
          ) : outstandingQuery.data && outstandingQuery.data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingQuery.data.items.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>
                      <Link href={`/students/${row.studentId}`} className="font-medium text-navy-900 hover:underline">
                        {row.fullName}
                      </Link>
                      <p className="text-[12px] text-navy-400">{row.admissionNumber}</p>
                    </TableCell>
                    <TableCell className="text-navy-500">{row.className ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      {row.isOverpaid ? (
                        <Badge variant="info">Overpaid</Badge>
                      ) : (
                        <CurrencyDisplay kobo={row.outstandingKobo} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="Everyone is fully paid up"
              description="No students currently have an outstanding balance for this term."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}