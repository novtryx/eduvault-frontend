'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, MessageCircle, Receipt as ReceiptIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { TermSelect } from '@/components/shared/term-select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/features/auth/auth-context';
import { useAcademicSessions } from '@/features/schools/hooks';
import { useStudent } from '@/features/students/hooks';
import { StudentCombobox } from '@/features/students/student-combobox';
import { useCreatePayment } from '@/features/payments/hooks';
import { recordPaymentSchema, type RecordPaymentFormValues } from '@/features/payments/schemas';
import { WhatsAppReminderDialog } from '@/features/payments/whatsapp-reminder-dialog';
import { ApiError } from '@/lib/api-client';
import { nairaToKobo } from '@/lib/currency';
import type { Payment, Student } from '@/types/entities';

export default function RecordPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentSchoolId, currentMembership } = useAuth();
  const { toast } = useToast();

  const sessionsQuery = useAcademicSessions(currentSchoolId);
  const createPayment = useCreatePayment(currentSchoolId);

  const presetStudentId = searchParams.get('studentId') ?? undefined;
  const presetStudent = useStudent(currentSchoolId, presetStudentId ?? null);

  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [recordedPayment, setRecordedPayment] = React.useState<Payment | null>(null);
  const [reminderOpen, setReminderOpen] = React.useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().slice(0, 10),
      method: 'CASH',
      termId: searchParams.get('termId') ?? '',
    },
  });

  React.useEffect(() => {
    if (presetStudent.data && !selectedStudent) {
      setSelectedStudent(presetStudent.data);
      setValue('studentId', presetStudent.data.id);
    }
  }, [presetStudent.data, selectedStudent, setValue]);

  React.useEffect(() => {
    if (!watch('termId') && sessionsQuery.data) {
      const currentSession = sessionsQuery.data.find((s) => s.isCurrent) ?? sessionsQuery.data[0];
      const currentTerm = currentSession?.terms?.find((t) => t.isCurrent) ?? currentSession?.terms?.[0];
      if (currentTerm) setValue('termId', currentTerm.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsQuery.data]);

  const termId = watch('termId');
  const method = watch('method');
  const activeSession = sessionsQuery.data?.find((s) => s.terms?.some((t) => t.id === termId));

  async function onSubmit(values: RecordPaymentFormValues) {
    if (!activeSession) {
      toast({ variant: 'destructive', title: "Couldn't record payment", description: 'Select a valid term.' });
      return;
    }
    try {
      const payment = await createPayment.mutateAsync({
        studentId: values.studentId,
        academicSessionId: activeSession.id,
        termId: values.termId,
        amountKobo: nairaToKobo(values.amountNaira),
        method: values.method,
        paymentDate: values.paymentDate,
        reference: values.reference || undefined,
        notes: values.notes || undefined,
      });
      setRecordedPayment(payment);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't record payment",
        description: error instanceof ApiError ? error.message : 'Please check the details and try again.',
      });
    }
  }

  function recordAnother() {
    setRecordedPayment(null);
    setSelectedStudent(null);
    reset({ paymentDate: new Date().toISOString().slice(0, 10), method: 'CASH', termId });
  }

  // ── Success state ──────────────────────────────────────────────
  if (recordedPayment) {
    return (
      <div className="mx-auto max-w-lg space-y-6 pb-10 pt-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[17px] font-semibold text-navy-900">Payment recorded</p>
              <p className="mt-1 text-[13.5px] text-navy-400">
                {selectedStudent?.fullName ?? 'Student'} · {recordedPayment.term?.name ?? ''}
              </p>
            </div>
            <CurrencyDisplay kobo={recordedPayment.amountKobo} className="text-[32px]" />

            <div className="flex w-full flex-col gap-2 pt-2 sm:flex-row">
              <Button className="flex-1" asChild>
                <Link href={`/receipts/${recordedPayment.id}`}>
                  <ReceiptIcon className="h-4 w-4" />
                  Generate Receipt
                </Link>
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setReminderOpen(true)}>
                <MessageCircle className="h-4 w-4" />
                Send Receipt
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={recordAnother}>
              Record another payment
            </Button>
          </CardContent>
        </Card>

        <WhatsAppReminderDialog
          open={reminderOpen}
          onOpenChange={setReminderOpen}
          studentName={selectedStudent?.fullName ?? 'Student'}
          parentName={selectedStudent?.parentName}
          parentPhone={selectedStudent?.parentPhone}
          outstandingKobo={null}
          schoolName={currentMembership?.schoolName}
        />
      </div>
    );
  }

  // ── Form state ──────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2 text-navy-400" onClick={() => router.back()}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <PageHeader title="Record Payment" description="Log a fee payment in a few seconds." />
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Student</Label>
              <StudentCombobox
                value={selectedStudent}
                onChange={(student) => {
                  setSelectedStudent(student);
                  setValue('studentId', student.id, { shouldValidate: true });
                }}
              />
              {errors.studentId && <p className="text-[12.5px] text-danger">{errors.studentId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Term</Label>
              {sessionsQuery.data && sessionsQuery.data.length > 0 && (
                <TermSelect
                  sessions={sessionsQuery.data}
                  value={termId}
                  onChange={(v) => setValue('termId', v, { shouldValidate: true })}
                  className="w-full"
                />
              )}
              {errors.termId && <p className="text-[12.5px] text-danger">{errors.termId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="amountNaira">Amount (₦)</Label>
                <Input id="amountNaira" type="number" step="0.01" placeholder="50000" {...register('amountNaira')} />
                {errors.amountNaira && <p className="text-[12.5px] text-danger">{errors.amountNaira.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paymentDate">Payment date</Label>
                <Input id="paymentDate" type="date" {...register('paymentDate')} />
                {errors.paymentDate && <p className="text-[12.5px] text-danger">{errors.paymentDate.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <Select value={method} onValueChange={(v) => setValue('method', v as RecordPaymentFormValues['method'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="POS">POS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method !== 'CASH' && (
              <div className="space-y-1.5">
                <Label htmlFor="reference">Reference (optional)</Label>
                <Input id="reference" placeholder="Transaction reference" {...register('reference')} />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" rows={2} placeholder="Any additional context..." {...register('notes')} />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Record Payment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}