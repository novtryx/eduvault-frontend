'use client';

import * as React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatKobo } from '@/lib/currency';

interface WhatsAppReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  parentName?: string | null;
  parentPhone?: string | null;
  outstandingKobo?: number | null;
  schoolName?: string;
}

function normalizePhoneForWa(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  return digits;
}

export function WhatsAppReminderDialog({
  open,
  onOpenChange,
  studentName,
  parentName,
  parentPhone,
  outstandingKobo,
  schoolName,
}: WhatsAppReminderDialogProps) {
  const defaultMessage = React.useMemo(() => {
    const greeting = parentName ? `Dear ${parentName},` : 'Dear Parent/Guardian,';
    const amount = outstandingKobo ? formatKobo(outstandingKobo) : 'an outstanding balance';
    return `${greeting}\n\nThis is a friendly reminder that ${studentName} has ${amount} outstanding in school fees${schoolName ? ` at ${schoolName}` : ''}. Kindly make payment at your earliest convenience.\n\nThank you.`;
  }, [studentName, parentName, outstandingKobo, schoolName]);

  const [message, setMessage] = React.useState(defaultMessage);

  React.useEffect(() => {
    if (open) setMessage(defaultMessage);
  }, [open, defaultMessage]);

  const hasPhone = Boolean(parentPhone);

  function handleSend() {
    if (!parentPhone) return;
    const phone = normalizePhoneForWa(parentPhone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send WhatsApp reminder</DialogTitle>
          <DialogDescription>
            {hasPhone
              ? 'Review the message below. It will open in WhatsApp for you to send.'
              : 'No parent phone number is on file for this student — add one to send a reminder.'}
          </DialogDescription>
        </DialogHeader>

        {hasPhone && (
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} className="text-[13.5px]" />
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!hasPhone}>
            <MessageCircle className="h-4 w-4" />
            Open in WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}