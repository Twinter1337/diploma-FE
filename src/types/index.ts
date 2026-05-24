// ── Enums ──────────────────────────────────────────────────────────────────

export enum UserRole {
  Client = 0,
  Trainer = 1,
  Admin = 2,
}

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
}

export enum VerificationStatus {
  NotVerified = 0,
  Pending = 1,
  Verified = 2,
  Rejected = 3,
}

export enum SlotFormat {
  Online = 0,
  Offline = 1,
}

export enum SlotStatus {
  Available = 0,
  Booked = 1,
  SoldOut = 2,
  Cancelled = 3,
  Completed = 4,
}

export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3,
}

export enum CancelledBy {
  Client = 0,
  Trainer = 1,
  Admin = 2,
}

export enum PaymentMethod {
  Online = 0,
  Cash = 1,
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Refunded = 2,
  Failed = 3,
}

export enum DocumentType {
  Certificate = 0,
  Diploma = 1,
  License = 2,
  Other = 3,
}

export enum DocumentStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum TagCategory {
  Specialization = 0,
  Disability = 1,
  Methodology = 2,
}

export enum NotificationType {
  BookingConfirmed = 0,
  BookingCancelled = 1,
  PaymentSuccess = 2,
  PaymentRefunded = 3,
  VerificationApproved = 4,
  VerificationRejected = 5,
  SessionReminder = 6,
}

export enum TicketStatus {
  Open = 0,
  InProgress = 1,
  Resolved = 2,
  Closed = 3,
}

// ── Core models ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  city: string | null;
  phone: string | null;
  birthDate: string | null;
  gender: Gender | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInfo {
  heightCm: number | null;
  weightKg: number | null;
  fitnessGoals: string | null;
}

export interface TrainerInfo {
  bio: string | null;
  experienceYears: number;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewsCount: number;
}

export interface Tag {
  id: number;
  name: string;
  category: TagCategory;
  description: string | null;
}

export interface ScheduleSlot {
  id: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  format: SlotFormat;
  price: number;
  maxClients: number;
  description: string | null;
  gymName: string | null;
  gymAddress: string | null;
  status: SlotStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  slotId: string;
  clientId: string;
  status: BookingStatus;
  cancellationReason: string | null;
  cancelledBy: CancelledBy | null;
  reminderMinutes: number;
  createdAt: string;
  updatedAt: string;
  slot?: ScheduleSlot;
  payment?: Payment;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  trainerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  client?: Pick<User, 'firstName' | 'lastName' | 'avatarUrl'>;
}

export interface TrainerDocument {
  id: string;
  trainerId: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  documentType: DocumentType;
  status: DocumentStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  uploadedAt: string;
}

export interface SessionNote {
  id: string;
  bookingId: string;
  authorId: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: number;
  type: number;
  title: string;
  description: string;
  iconUrl: string;
  earnedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  sentAt: string;
}

export interface SupportTicket {
  id: string;
  createdBy: string;
  subject: string;
  description: string;
  status: TicketStatus;
  relatedBookingId: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Paginated response ─────────────────────────────────────────────────────

export interface Paginated<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole.Client | UserRole.Trainer;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Trainer search ────────────────────────────────────────────────────────

export interface TrainerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  city: string | null;
  avatarUrl: string | null;
  rating: number;
  reviewsCount: number;
  minPrice: number | null;
  verificationStatus: VerificationStatus;
  specializationTags: Tag[];
  disabilityTags: Tag[];
  methodologyTags: Tag[];
}

export interface TrainerSearchRequest {
  name?: string | null;
  city?: string | null;
  minRating?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isVerified?: boolean | null;
  isAccess?: boolean | null;
  specializationTagIds?: number[] | null;
  disabilityTagIds?: number[] | null;
  methodologyTagIds?: number[] | null;
}

// ── Platform stats ─────────────────────────────────────────────────────────

export interface PlatformStats {
  avgRating: number;
  avgPrice: number;
  numOfCities: number;
  numOfVerified: number;
  numOfTrainers: number;
}

// ── Booking API ───────────────────────────────────────────────────────────

export interface CreateBookingResponse {
  bookingId: string;
  checkoutUrl: string;
  status: BookingStatus.Pending;
  serviceFeeApplied: boolean;
  totalAmount: number;
}

export interface BookingTrainerSummary {
  firstName: string;
  lastName: string;
  specializations: string[];
  rating: number;
}

// ── Trainer profile (public) ───────────────────────────────────────────────

export interface TrainerProfile {
  firstName: string;
  lastName: string;
  verificationStatus: VerificationStatus;
  isAccessible: boolean;
  avatarUrl: string | null;
  experienceYears: number;
  bio: string | null;
  rating: number;
  minPrice: number | null;
  city: string | null;
  numOfReviews: number;
  numOfCompletedClasses: number;
  numOfActiveClients: number;
  specializationTags: Tag[];
  methodologyTags: Tag[];
  disabilityTags?: Tag[];
}

export interface TrainerAvailableSlot {
  id: string;
  startDateTime: string;
  durationInMinutes: number;
  price: number;
  description?: string | null;
  gymName?: string | null;
  gymAddress?: string | null;
}

export interface TrainerProfileReview {
  avatarUrl: string | null;
  fullName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

// ── Client dashboard ──────────────────────────────────────────────────────

export interface ClientProfileData {
  firstName: string;
  lastName: string;
  email: string;
  city: string | null;
  heightCm: number | null;
  weightKg: number | null;
  avatarUrl: string | null;
  disabilityTags: Array<{ id: number; name: string; isSelected: boolean }>;
}

export interface ClientBooking {
  id: string;
  trainerFullName: string;
  trainerAvatarUrl: string | null;
  status: BookingStatus;
  startTime: string;
  durationMinutes: number;
  format: SlotFormat;
  createdAt: string;
}

export interface BookingHistoryItem {
  id: string;
  startTime: string;
  trainerId: string;
  trainerFullName: string;
  trainerAvatarUrl: string | null;
  price: number;
  bookingStatus: BookingStatus;
  review: { rating: number; comment: string | null } | null;
}

export interface PostReviewResponse {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface AchievementItem {
  id: number;
  type: number;
  title: string;
  description: string;
  iconUrl: string;
  isEarned: boolean;
  earnedAt: string | null;
}

export interface UserAchievementsResponse {
  totalCount: number;
  earnedCount: number;
  achievements: AchievementItem[];
}

// ── Trainer dashboard ─────────────────────────────────────────────────────

export interface TrainerDashboardSlot {
  id: string;
  startDateTime: string;
  durationInMinutes: number;
  format: SlotFormat;
  price: number;
  maxClients: number;
  currentNumOfClients: number;
  description?: string | null;
  gymName?: string | null;
  gymAddress?: string | null;
}

export interface TrainerSlotCount {
  numOfAllSlots: number;
  numOfBookedSlots: number;
}

export interface TrainerSlotFilters {
  isClosed?: boolean;
  isReserved?: boolean;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
}

export interface TrainerBooking {
  id: string;
  clientId: string;
  clientFullName: string;
  clientAvatarUrl: string | null;
  startDateTime: string;
  durationInMinutes: number;
  format: SlotFormat;
  status: BookingStatus;
}

export interface TrainerClient {
  clientId: string;
  clientFullName: string;
  clientAvatarUrl: string | null;
  numOfClasses: number;
  lastSlotDate: string | null;
  tags: Tag[];
}

export interface TrainerStatsMonthly {
  month: number;
  numOfCompletedSlots: number;
}

export interface TrainerStats {
  numOfCompletedSlots: number;
  avgRating: number;
  activeClientsThisMonth: number;
  completedSlotsPerMonth: TrainerStatsMonthly[];
}

export interface PatchSlotPayload {
  startTime?: string | null;
  endTime?: string | null;
  format?: SlotFormat | null;
  price?: number | null;
  maxClients?: number | null;
  description?: string | null;
  gymName?: string | null;
  gymAddress?: string | null;
}

export interface PatchSlotResponse {
  id: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  format: SlotFormat;
  price: number;
  maxClients: number;
  description: string | null;
  gymName: string | null;
  gymAddress: string | null;
  status: SlotStatus;
  createdAt: string;
}

// ── API error ──────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// ── Admin panel ────────────────────────────────────────────────────────────

export type AdminTicketKanbanStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type AdminTicketType = 'request' | 'document';
export type AdminDocType = 'certificate' | 'diploma' | 'license' | 'other';

export interface AdminStats {
  openTickets: number;
  pendingDocuments: number;
  unassignedTickets: number;
}

export interface AdminAssignee {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface AdminTicketCreator {
  id: string;
  fullName: string;
  role: 'Client' | 'Trainer' | 'Admin';
  email: string;
  avatarUrl: string | null;
}

export interface AdminTicketListItem {
  id: string;
  type: AdminTicketType;
  status: number;
  priority: number;
  subject: string;
  docType: AdminDocType | null;
  createdBy: AdminTicketCreator;
  assignedTo: AdminAssignee | null;
  createdAt: string;
}

export interface AdminTicketDocument {
  id: string;
  type: AdminDocType;
  fileName: string;
  fileSizeBytes: number;
  fileUrl: string;
  status: number;
}

export interface AdminTicketDetail {
  id: string;
  type: AdminTicketType;
  status: number;
  priority: number;
  subject: string;
  description: string | null;
  createdBy: AdminTicketCreator;
  assignedTo: AdminAssignee | null;
  relatedBookingId: string | null;
  relatedTrainerId: string | null;
  document: AdminTicketDocument | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicketsQuery {
  type?: 'all' | 'request' | 'document';
  assignedTo?: string | 'unassigned';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminTicketsPage {
  items: AdminTicketListItem[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface PatchAdminTicketPayload {
  status?: number;
  assignedTo?: string;
  unassign?: boolean;
}

export interface AdminDocReviewResponse {
  documentId: string;
  status: number;
  ticketStatus: number;
  reviewedAt: string;
}
