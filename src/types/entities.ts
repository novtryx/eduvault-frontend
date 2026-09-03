// These mirror src/database/entities/*.ts and the various service return
// shapes on the backend. Dates arrive as ISO strings over JSON.

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface SchoolMembership {
  schoolId: string;
  schoolName: string;
  roleId: string;
  roleName: string;
  isSystem: boolean;
}

export interface School {
  id: string;
  name: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  receiptPrefix: string;
  receiptFooter: string | null;
  receiptSignature: string | null;
  nextReceiptNumber: number;
  currentAcademicSessionId: string | null;
  currentTermId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Term {
  id: string;
  schoolId: string;
  academicSessionId: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSession {
  id: string;
  schoolId: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  terms?: Term[];
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
}

export type StudentStatus = 'ACTIVE' | 'GRADUATED' | 'WITHDRAWN' | 'ARCHIVED';

export interface Student {
  id: string;
  schoolId: string;
  classId: string | null;
  class?: SchoolClass | null;
  fullName: string;
  admissionNumber: string;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  dateOfAdmission: string | null;
  status: StudentStatus;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructure {
  id: string;
  schoolId: string;
  academicSessionId: string;
  academicSession?: AcademicSession;
  termId: string;
  term?: Term;
  classId: string;
  class?: SchoolClass;
  amountKobo: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'POS';
export type PaymentStatus = 'ACTIVE' | 'REVERSED';

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  student?: Student;
  academicSessionId: string;
  academicSession?: AcademicSession;
  termId: string;
  term?: Term;
  amountKobo: number;
  expectedFeeKoboSnapshot: number | null;
  method: PaymentMethod;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
  status: PaymentStatus;
  reversalReason: string | null;
  reversedAt: string | null;
  reversedByUserId: string | null;
  recordedByUserId: string;
  recordedByUser?: User;
  createdAt: string;
  updatedAt: string;
  receipt?: Receipt;
}

export interface Receipt {
  id: string;
  schoolId: string;
  paymentId: string;
  payment?: Payment;
  receiptNumber: string;
  pdfUrl: string | null;
  generatedAt: string;
}

export interface StudentBalance {
  studentId: string;
  termId: string;
  expectedFeeKobo: number | null;
  totalPaidKobo: number;
  outstandingKobo: number | null;
  isOverpaid: boolean;
}

export interface OutstandingRow {
  studentId: string;
  fullName: string;
  admissionNumber: string;
  classId: string | null;
  className: string | null;
  expectedFeeKobo: number | null;
  totalPaidKobo: number;
  outstandingKobo: number | null;
  isOverpaid: boolean;
}

export interface DashboardSummary {
  termId: string;
  termName: string;
  totalStudents: number;
  expectedKobo: number;
  collectedKobo: number;
  outstandingKobo: number;
  collectionRatePercent: number;
}

export interface CollectionOverview {
  termId: string;
  expectedKobo: number;
  collectedKobo: number;
  outstandingKobo: number;
}

export interface ClassCollectionRow {
  classId: string;
  className: string;
  studentCount: number;
  expectedKobo: number;
  collectedKobo: number;
  outstandingKobo: number;
}

export interface CollectionSummaryReport extends DashboardSummary {
  byClass: ClassCollectionRow[];
}

export interface StaffMember {
  userId: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  isSystem: boolean;
  joinedAt: string;
}

export interface Permission {
  id: string;
  key: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Role {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  // The backend always eager-loads this on findAll/findOne — see
  // roles.service.ts (`relations: { rolePermissions: { permission: true } }`).
  // There is no flat permissionKeys array on the API response.
  rolePermissions: RolePermission[];
}

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
export type PlanBillingCycle = 'MONTHLY' | 'ANNUAL';

export interface Plan {
  id: string;
  key: string;
  familyKey: string;
  name: string;
  billingCycle: PlanBillingCycle;
  priceKobo: number;
  comparePriceKobo: number | null;
  studentLimit: number | null;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface Subscription {
  id: string;
  schoolId: string;
  // Nullable: a new school is created TRIALING with no plan chosen yet —
  // see Subscription.planId in the backend entity.
  planId: string | null;
  plan?: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

// Shape returned by the PUBLIC GET /plans endpoint — deliberately
// narrower than Plan (see PlansService.PublicPlan on the backend): no
// isActive, paystackPlanCode, or timestamps, since this is public
// pricing-page data. GET /subscription's embedded `plan` field is the
// full Plan entity instead — keep these two distinct rather than
// reusing one type for both.
export interface PublicPlan {
  id: string;
  key: string;
  familyKey: string;
  name: string;
  billingCycle: PlanBillingCycle;
  priceKobo: number;
  comparePriceKobo: number | null;
  studentLimit: number | null;
  features: string[];
  sortOrder: number;
}

// Matches AuditLog entity + its eager-loaded `user` relation
// (AuditService.findAll leftJoinAndSelects it). userId/user are both
// null for system-triggered events (e.g. a Paystack webhook expiring a
// subscription) — never assume a human actor.
export interface AuditLog {
  id: string;
  schoolId: string;
  userId: string | null;
  user: User | null;
  // e.g. "payment.created", "role.deleted" — see AuditService's ACTIONS
  // convention. Free-text on the backend, not an enum, so keep this a
  // plain string rather than a closed union that could drift.
  action: string;
  // e.g. "Payment", "Role"
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface BulkImportRowFailure {
  row: number;
  fullName?: string;
  admissionNumber?: string;
  reason: string;
}

export interface BulkImportResult {
  totalRows: number;
  imported: number;
  failed: BulkImportRowFailure[];
}