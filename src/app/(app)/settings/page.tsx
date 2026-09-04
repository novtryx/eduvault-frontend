'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CreditCard, Plus, ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { SubscriptionStatusBadge } from '@/components/shared/subscription-status-badge';
import { ImageUpload } from '@/components/shared/image-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/features/auth/auth-context';
import {
  useAcademicSessions,
  useSchool,
  useSetCurrentSession,
  useSetCurrentTerm,
  useUpdateSchool,
} from '@/features/schools/hooks';
import { CreateSessionDialog } from '@/features/schools/create-session-dialog';
import { CreateTermDialog } from '@/features/schools/create-term-dialog';
import {
  receiptSettingsSchema,
  schoolInfoSchema,
  type ReceiptSettingsFormValues,
  type SchoolInfoFormValues,
} from '@/features/schools/schemas';
import { useSubscription } from '@/features/subscriptions/hooks';
import { PlanPicker } from '@/features/subscriptions/plan-picker';
import { useAuditLogs } from '@/features/audit/hooks';
import { ApiError } from '@/lib/api-client';
import { hasPermission } from '@/lib/permissions';
import { formatDate, formatDateTime } from '@/lib/format-date';
import { formatKobo } from '@/lib/currency';
import type { School } from '@/types/entities';

export default function SettingsPage() {
  const { currentSchoolId, isOwner, permissionKeys } = useAuth();

  // Distinct backend permissions for distinct concerns — settings:update
  // gates PATCH /schools/:schoolId (name/logo/address/receipt fields),
  // sessions:manage gates the separate academic-session/term endpoints,
  // and billing:manage gates subscription changes. These must not be
  // collapsed into one flag, or a role granted only one of them would
  // see controls it can't actually use (and the backend would reject
  // the request anyway).
  const canManageSchool = hasPermission('settings:update', { isOwner, permissionKeys });
  const canManageSessions = hasPermission('sessions:manage', { isOwner, permissionKeys });
  const canManageBilling = hasPermission('billing:manage', { isOwner, permissionKeys });

  return (
    <div className="space-y-6 pb-10">
      <PageHeader title="Settings" description="Manage your school's information, academic structure, and billing." />

      <Tabs defaultValue="school">
        <TabsList>
          <TabsTrigger value="school">School</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="academic">Academic Sessions</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="school">
          <SchoolInfoTab schoolId={currentSchoolId} canManage={canManageSchool} />
        </TabsContent>

        <TabsContent value="receipts">
          <ReceiptSettingsTab schoolId={currentSchoolId} canManage={canManageSchool} />
        </TabsContent>

        <TabsContent value="academic">
          <AcademicSessionsTab schoolId={currentSchoolId} canManage={canManageSessions} />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTab schoolId={currentSchoolId} canManage={canManageBilling} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogTab schoolId={currentSchoolId} canView={hasPermission('audit:view', { isOwner, permissionKeys })} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── School Information ──────────────────────────────────────────────

function SchoolInfoTab({ schoolId, canManage }: { schoolId: string | null; canManage: boolean }) {
  const schoolQuery = useSchool(schoolId);
  const { toast } = useToast();
  const updateMutation = useUpdateSchool(schoolId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SchoolInfoFormValues>({ resolver: zodResolver(schoolInfoSchema) });

  const logoUrl = watch('logoUrl');

  React.useEffect(() => {
    if (!schoolQuery.data) return;
    reset(toFormValues(schoolQuery.data));
  }, [schoolQuery.data, reset]);

  async function onSubmit(values: SchoolInfoFormValues) {
    try {
      const updated = await updateMutation.mutateAsync(cleanPayload(values));
      reset(toFormValues(updated));
      toast({ title: 'School information updated' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't update school information",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  if (schoolQuery.isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (schoolQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorState error={schoolQuery.error} onRetry={() => schoolQuery.refetch()} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Information</CardTitle>
        <p className="mt-1 text-[13px] text-navy-400">
          This appears on receipts and across the app wherever your school is identified.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">School name</Label>
              <Input id="name" disabled={!canManage} {...register('name')} />
              {errors.name && <p className="text-[12.5px] text-danger">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>School logo</Label>
              <ImageUpload
                value={logoUrl}
                onChange={(url) => setValue('logoUrl', url, { shouldDirty: true, shouldValidate: true })}
                folder="/eduvault/school-logos"
                disabled={!canManage}
                label="Upload logo"
              />
              {errors.logoUrl && <p className="text-[12.5px] text-danger">{errors.logoUrl.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" disabled={!canManage} {...register('address')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" disabled={!canManage} {...register('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" disabled={!canManage} {...register('email')} />
              {errors.email && <p className="text-[12.5px] text-danger">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://…" disabled={!canManage} {...register('website')} />
              {errors.website && <p className="text-[12.5px] text-danger">{errors.website.message}</p>}
            </div>
          </div>

          {canManage && (
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// ── Receipt Settings ────────────────────────────────────────────────

function ReceiptSettingsTab({ schoolId, canManage }: { schoolId: string | null; canManage: boolean }) {
  const schoolQuery = useSchool(schoolId);
  const { toast } = useToast();
  const updateMutation = useUpdateSchool(schoolId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ReceiptSettingsFormValues>({ resolver: zodResolver(receiptSettingsSchema) });

  React.useEffect(() => {
    if (!schoolQuery.data) return;
    reset({
      receiptPrefix: schoolQuery.data.receiptPrefix ?? 'RCPT-',
      receiptFooter: schoolQuery.data.receiptFooter ?? '',
      receiptSignature: schoolQuery.data.receiptSignature ?? '',
    });
  }, [schoolQuery.data, reset]);

  async function onSubmit(values: ReceiptSettingsFormValues) {
    try {
      const updated = await updateMutation.mutateAsync({
        receiptPrefix: values.receiptPrefix,
        receiptFooter: values.receiptFooter || undefined,
        receiptSignature: values.receiptSignature || undefined,
      });
      reset({
        receiptPrefix: updated.receiptPrefix ?? 'RCPT-',
        receiptFooter: updated.receiptFooter ?? '',
        receiptSignature: updated.receiptSignature ?? '',
      });
      toast({ title: 'Receipt settings updated' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't update receipt settings",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  if (schoolQuery.isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (schoolQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorState error={schoolQuery.error} onRetry={() => schoolQuery.refetch()} />
        </CardContent>
      </Card>
    );
  }

  const nextNumber = schoolQuery.data?.nextReceiptNumber ?? 1;
  const prefix = schoolQuery.data?.receiptPrefix ?? 'RCPT-';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt Settings</CardTitle>
        <p className="mt-1 text-[13px] text-navy-400">
          Controls how receipts are numbered and what appears at the bottom of every printed receipt.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="receiptPrefix">Receipt prefix</Label>
            <Input id="receiptPrefix" className="max-w-[200px]" disabled={!canManage} {...register('receiptPrefix')} />
            {errors.receiptPrefix && <p className="text-[12.5px] text-danger">{errors.receiptPrefix.message}</p>}
            <p className="text-[12px] text-navy-400">
              Next receipt will be numbered <span className="font-medium text-navy-600">{prefix}{nextNumber}</span>.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="receiptFooter">Footer message</Label>
            <Textarea id="receiptFooter" placeholder="Thank you for your payment." disabled={!canManage} {...register('receiptFooter')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="receiptSignature">Signatory name</Label>
            <Input id="receiptSignature" placeholder="e.g. Bursar, EduVault Schools" disabled={!canManage} {...register('receiptSignature')} />
          </div>

          {canManage && (
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// ── Academic Sessions ───────────────────────────────────────────────

function AcademicSessionsTab({ schoolId, canManage }: { schoolId: string | null; canManage: boolean }) {
  const { toast } = useToast();
  const sessionsQuery = useAcademicSessions(schoolId);
  const setCurrentSessionMutation = useSetCurrentSession(schoolId);
  const setCurrentTermMutation = useSetCurrentTerm(schoolId);

  const [sessionDialogOpen, setSessionDialogOpen] = React.useState(false);
  const [termDialogFor, setTermDialogFor] = React.useState<{ id: string; name: string } | null>(null);

  async function handleSetCurrentSession(sessionId: string) {
    try {
      await setCurrentSessionMutation.mutateAsync(sessionId);
      toast({ title: 'Current session updated' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't update current session",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  async function handleSetCurrentTerm(termId: string) {
    try {
      await setCurrentTermMutation.mutateAsync(termId);
      toast({ title: 'Current term updated' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't update current term",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Academic Sessions</CardTitle>
          <p className="mt-1 text-[13px] text-navy-400">
            Sessions and terms drive every fee, payment, and report — set one up to get started.
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setSessionDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sessionsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : sessionsQuery.isError ? (
          <ErrorState error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />
        ) : sessionsQuery.data && sessionsQuery.data.length > 0 ? (
          <div className="space-y-5">
            {sessionsQuery.data.map((session, idx) => (
              <div key={session.id}>
                {idx > 0 && <Separator className="mb-5" />}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-navy-900">{session.name}</p>
                    {session.isCurrent && <Badge variant="success">Current</Badge>}
                    {(session.startDate || session.endDate) && (
                      <span className="text-[12px] text-navy-400">
                        {formatDate(session.startDate)} – {formatDate(session.endDate)}
                      </span>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-2">
                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetCurrentSession(session.id)}
                          loading={setCurrentSessionMutation.isPending}
                        >
                          Set as current
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setTermDialogFor({ id: session.id, name: session.name })}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Term
                      </Button>
                    </div>
                  )}
                </div>

                {session.terms && session.terms.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.terms.map((term) => (
                      <div
                        key={term.id}
                        className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-1.5"
                      >
                        <span className="text-[13px] text-navy-700">{term.name}</span>
                        {term.isCurrent ? (
                          <Badge variant="success">Current</Badge>
                        ) : (
                          canManage && (
                            <button
                              onClick={() => handleSetCurrentTerm(term.id)}
                              className="text-[11.5px] font-medium text-navy-400 hover:text-navy-900 hover:underline"
                            >
                              Set current
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[12.5px] text-navy-400">No terms yet — add one to enable fees and payments for this session.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="h-5 w-5" />}
            title="No academic sessions yet"
            description="Create your first academic session (e.g. 2026/2027), then add terms to it. This is required before you can set fees or record payments."
            action={
              canManage ? (
                <Button size="sm" onClick={() => setSessionDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create Session
                </Button>
              ) : undefined
            }
          />
        )}
      </CardContent>

      <CreateSessionDialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen} />
      {termDialogFor && (
        <CreateTermDialog
          open={Boolean(termDialogFor)}
          onOpenChange={(open) => !open && setTermDialogFor(null)}
          sessionId={termDialogFor.id}
          sessionName={termDialogFor.name}
        />
      )}
    </Card>
  );
}

// ── Subscription ────────────────────────────────────────────────────
//
// GET /plans is now public and backend-fixed to return real pricing
// data, so this tab shows a genuine plan picker (see PlanPicker) below
// the current-subscription summary — Owners can subscribe or upgrade
// directly, redirected to Paystack checkout and back via /billing/callback.

function SubscriptionTab({ schoolId, canManage }: { schoolId: string | null; canManage: boolean }) {
  const subscriptionQuery = useSubscription(schoolId);

  if (subscriptionQuery.isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (subscriptionQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorState error={subscriptionQuery.error} onRetry={() => subscriptionQuery.refetch()} />
        </CardContent>
      </Card>
    );
  }

  const subscription = subscriptionQuery.data;
  if (!subscription) return null;

  const hasPlan = Boolean(subscription.plan);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <p className="mt-1 text-[13px] text-navy-400">Your school's current billing plan and status.</p>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </CardHeader>
        <CardContent>
          {hasPlan && subscription.plan ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[12px] text-navy-400">Plan</p>
                  <p className="mt-1 text-[15px] font-semibold text-navy-900">{subscription.plan.name}</p>
                </div>
                <div>
                  <p className="text-[12px] text-navy-400">Price</p>
                  <p className="mt-1 text-[15px] font-semibold text-navy-900">
                    {formatKobo(subscription.plan.priceKobo)}
                    <span className="text-[12px] font-normal text-navy-400">
                      {' '}
                      / {subscription.plan.billingCycle === 'ANNUAL' ? 'year' : 'month'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-navy-400">Renews</p>
                  <p className="mt-1 text-[15px] font-semibold text-navy-900">
                    {subscription.cancelAtPeriodEnd ? 'Not renewing' : formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              </div>
              {subscription.status === 'PAST_DUE' && (
                <p className="rounded-md bg-warning-bg px-3 py-2 text-[13px] text-warning">
                  Your last payment didn't go through. Please update your payment method to avoid interruption.
                </p>
              )}
              {subscription.cancelAtPeriodEnd && (
                <p className="rounded-md bg-info-bg px-3 py-2 text-[13px] text-info">
                  Your subscription is set to end on {formatDate(subscription.currentPeriodEnd)} and won't renew.
                </p>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<CreditCard className="h-5 w-5" />}
              title={subscription.status === 'TRIALING' ? "You're on a trial" : 'No active plan'}
              description={
                canManage
                  ? 'Choose a plan below to get started.'
                  : 'Ask a school owner to choose a plan for your school.'
              }
            />
          )}
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>{hasPlan ? 'Change plan' : 'Choose a plan'}</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanPicker schoolId={schoolId} currentPlanId={subscription.planId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Audit Log ────────────────────────────────────────────────────────
//
// Read-only — GET /schools/:schoolId/audit-logs, gated behind its own
// audit:view permission (deliberately separate from settings:view /
// reports:view — see AuditController's own comment on why this is a
// more sensitive, security-adjacent view a school might not want to
// hand a bookkeeper along with reporting access).

const ENTITY_TYPE_OPTIONS = [
  'Payment',
  'Role',
  'FeeStructure',
  'Student',
  'StaffInvite',
  'UserSchoolRole',
  'Subscription',
];

function humanizeAction(action: string): string {
  // "payment.created" -> "Payment created" — every action string in
  // the backend follows this "resource.verb" convention (see
  // AuditService's RecordAuditLogParams comment), so this is a safe,
  // general transform rather than a hardcoded lookup table that could
  // drift from new actions added later.
  const [, verb] = action.split('.');
  const words = (verb ?? action).split('_').join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function AuditLogTab({ schoolId, canView }: { schoolId: string | null; canView: boolean }) {
  const [page, setPage] = React.useState(1);
  const [entityType, setEntityType] = React.useState<string>('all');

  const logsQuery = useAuditLogs(schoolId, {
    page,
    limit: 25,
    entityType: entityType !== 'all' ? entityType : undefined,
  });

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={<ScrollText className="h-5 w-5" />}
            title="No access to the audit log"
            description="Ask a school owner to grant you the audit log permission if you need to see this."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Audit Log</CardTitle>
          <p className="mt-1 text-[13px] text-navy-400">
            A record of sensitive actions taken across your school — payments, roles, staff, and fees.
          </p>
        </div>
        <Select
          value={entityType}
          onValueChange={(value) => {
            setEntityType(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            {ENTITY_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        {logsQuery.isLoading ? (
          <div className="space-y-2 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : logsQuery.isError ? (
          <div className="p-6">
            <ErrorState error={logsQuery.error} onRetry={() => logsQuery.refetch()} />
          </div>
        ) : logsQuery.data && logsQuery.data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Staff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsQuery.data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-navy-500">{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell className="font-medium text-navy-900">{humanizeAction(log.action)}</TableCell>
                    <TableCell className="text-navy-500">{log.entityType}</TableCell>
                    <TableCell className="text-navy-500">{log.user?.fullName ?? 'System'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-6 pb-2">
              <Pagination
                page={logsQuery.data.page}
                totalPages={logsQuery.data.totalPages}
                total={logsQuery.data.total}
                limit={logsQuery.data.limit}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={<ScrollText className="h-5 w-5" />}
              title="No activity yet"
              description="Sensitive actions like payments, role changes, and fee updates will show up here as they happen."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── helpers ──────────────────────────────────────────────────────────

function toFormValues(school: School): SchoolInfoFormValues {
  return {
    name: school.name,
    logoUrl: school.logoUrl ?? '',
    address: school.address ?? '',
    phone: school.phone ?? '',
    email: school.email ?? '',
    website: school.website ?? '',
  };
}

function cleanPayload(values: SchoolInfoFormValues) {
  return {
    name: values.name,
    logoUrl: values.logoUrl || undefined,
    address: values.address || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    website: values.website || undefined,
  };
}