'use client';

import * as React from 'react';
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useClasses } from '@/features/classes/hooks';
import { useBulkImportStudents, useDownloadImportTemplate } from '@/features/students/hooks';
import { ApiError } from '@/lib/api-client';
import type { BulkImportResult } from '@/types/entities';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // matches MAX_BULK_IMPORT_FILE_SIZE_BYTES on the backend
const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

interface BulkImportStudentsDialogProps {
  schoolId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Every imported row lands in ONE class (BulkImportStudentsDto.classId)
// — a file with students across several classes needs one upload per
// class. That's a real backend constraint, not a frontend shortcut, so
// the dialog is upfront about it via the class picker being required
// before a file can even be chosen.
export function BulkImportStudentsDialog({ schoolId, open, onOpenChange }: BulkImportStudentsDialogProps) {
  const { toast } = useToast();
  const classesQuery = useClasses(schoolId);
  const templateMutation = useDownloadImportTemplate(schoolId);
  const importMutation = useBulkImportStudents(schoolId);

  const [classId, setClassId] = React.useState<string>('');
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<BulkImportResult | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setClassId('');
      setFile(null);
      setFileError(null);
      setResult(null);
    }
  }, [open]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    const extension = selected.name.slice(selected.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFileError('Only .csv, .xlsx, or .xls files are accepted.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setFileError('This file is larger than 5MB. Please split it into smaller files.');
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleDownloadTemplate() {
    try {
      await templateMutation.mutateAsync();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't download template",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  async function handleImport() {
    if (!classId || !file) return;
    try {
      const outcome = await importMutation.mutateAsync({ classId, file });
      setResult(outcome);
      if (outcome.failed.length === 0) {
        toast({ title: `${outcome.imported} student${outcome.imported === 1 ? '' : 's'} imported` });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't import students",
        description: error instanceof ApiError ? error.message : 'Please check the file and try again.',
      });
    }
  }

  const canImport = Boolean(classId && file) && !fileError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to add multiple students at once, all to the same class.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <ImportResultView result={result} onClose={() => onOpenChange(false)} onImportAnother={() => setResult(null)} />
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="import-class">Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger id="import-class">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classesQuery.data?.map((klass) => (
                    <SelectItem key={klass.id} value={klass.id}>
                      {klass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[12px] text-navy-400">Every student in the file will be added to this class.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="import-file">File</Label>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={templateMutation.isPending}
                  className="flex items-center gap-1 text-[12.5px] font-medium text-navy-500 hover:text-navy-900 hover:underline disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download template
                </button>
              </div>

              {file ? (
                <div className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-3 py-2">
                  <div className="flex items-center gap-2 text-[13px] text-navy-700">
                    <FileSpreadsheet className="h-4 w-4 text-navy-400" />
                    {file.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-navy-400 hover:text-navy-900"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="import-file"
                  className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed border-border bg-surface-muted px-4 py-6 text-center hover:border-navy-300"
                >
                  <Upload className="h-4 w-4 text-navy-400" />
                  <span className="text-[13px] text-navy-600">Click to choose a file</span>
                  <span className="text-[12px] text-navy-400">.csv, .xlsx, or .xls — up to 5MB, 2,000 rows</span>
                </label>
              )}
              <input
                ref={fileInputRef}
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="sr-only"
              />
              {fileError && <p className="text-[12.5px] text-danger">{fileError}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleImport} loading={importMutation.isPending} disabled={!canImport}>
                Import Students
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ImportResultView({
  result,
  onClose,
  onImportAnother,
}: {
  result: BulkImportResult;
  onClose: () => void;
  onImportAnother: () => void;
}) {
  const hasFailures = result.failed.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface-muted px-4 py-3">
        <div>
          <p className="text-[20px] font-semibold text-navy-900">{result.imported}</p>
          <p className="text-[12px] text-navy-400">of {result.totalRows} rows imported</p>
        </div>
        {hasFailures && (
          <Badge variant="warning" className="ml-auto">
            {result.failed.length} row{result.failed.length === 1 ? '' : 's'} failed
          </Badge>
        )}
      </div>

      {hasFailures && (
        <div className="max-h-[240px] overflow-y-auto rounded-md border border-border">
          <table className="w-full text-[12.5px]">
            <thead className="sticky top-0 bg-surface-muted text-navy-400">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Row</th>
                <th className="px-3 py-2 text-left font-medium">Student</th>
                <th className="px-3 py-2 text-left font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {result.failed.map((failure) => (
                <tr key={failure.row} className="border-t border-border">
                  <td className="px-3 py-2 text-navy-500">{failure.row}</td>
                  <td className="px-3 py-2 text-navy-700">
                    {failure.fullName || failure.admissionNumber || '—'}
                  </td>
                  <td className="px-3 py-2 text-danger">{failure.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DialogFooter>
        {hasFailures ? (
          <>
            <Button type="button" variant="secondary" onClick={onImportAnother}>
              Fix and re-upload
            </Button>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <Button type="button" className="ml-auto" onClick={onClose}>
            Done
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}