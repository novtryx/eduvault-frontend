'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { StudentStatusBadge } from '@/components/shared/student-status-badge';
import { ClassSelect } from '@/components/shared/class-select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/auth-context';
import { useClasses } from '@/features/classes/hooks';
import { useStudents } from '@/features/students/hooks';
import { StudentFormDialog } from '@/features/students/student-form-dialog';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { hasPermission } from '@/lib/permissions';

export default function StudentsPage() {
  const { currentSchoolId, isOwner, permissionKeys } = useAuth();
  const classesQuery = useClasses(currentSchoolId);

  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [classId, setClassId] = React.useState<string>('all');
  const [page, setPage] = React.useState(1);
  const [addOpen, setAddOpen] = React.useState(false);

  const studentsQuery = useStudents(currentSchoolId, {
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    classId: classId !== 'all' ? classId : undefined,
  });

  const canCreate = hasPermission('students:create', { isOwner, permissionKeys });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Search, filter, and manage every student in your school."
        actions={
          canCreate ? (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <Input
            placeholder="Search by name or admission no."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <ClassSelect
          classes={classesQuery.data ?? []}
          value={classId}
          onChange={(v) => {
            setClassId(v);
            setPage(1);
          }}
          includeAll
          className="w-full sm:w-[180px]"
        />
      </div>

      <Card>
        {studentsQuery.isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        ) : studentsQuery.isError ? (
          <CardContent className="p-6">
            <ErrorState error={studentsQuery.error} onRetry={() => studentsQuery.refetch()} />
          </CardContent>
        ) : studentsQuery.data && studentsQuery.data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent / Guardian</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsQuery.data.items.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Link href={`/students/${student.id}`} className="font-medium text-navy-900 hover:underline">
                        {student.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-navy-500">{student.admissionNumber}</TableCell>
                    <TableCell className="text-navy-500">{student.class?.name ?? '—'}</TableCell>
                    <TableCell className="text-navy-500">
                      {student.parentName ?? '—'}
                      {student.parentPhone && <p className="text-[12px] text-navy-400">{student.parentPhone}</p>}
                    </TableCell>
                    <TableCell>
                      <StudentStatusBadge status={student.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={studentsQuery.data.page}
              totalPages={studentsQuery.data.totalPages}
              total={studentsQuery.data.total}
              limit={studentsQuery.data.limit}
              onPageChange={setPage}
            />
          </>
        ) : (
          <CardContent className="p-0">
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title={debouncedSearch || classId !== 'all' ? 'No students match your filters' : 'No students yet'}
              description={
                debouncedSearch || classId !== 'all'
                  ? 'Try adjusting your search or class filter.'
                  : 'Add your first student to begin tracking school fees.'
              }
              action={
                canCreate && !debouncedSearch && classId === 'all' ? (
                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Student
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        )}
      </Card>

      <StudentFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}