// Type definitions for LeadsFlow CRM

export type UserRole = 'admin' | 'manager' | 'sales';

export interface User {
  id: string;
  username: string;        // PRIMARY: Used for login (unique, required)
  password: string;         // Hashed password (never plain text)
  name: string;            // Full name (required)
  email?: string;          // OPTIONAL: Internal communication only, not used for authentication
  phone?: string;          // OPTIONAL: Internal contact number
  role: UserRole;          // Admin, Manager, or Sales User
  department?: string;     // OPTIONAL: Department/team assignment
  isActive: boolean;       // Account status (inactive users cannot login)
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;      // Track last successful login for security
}

export type LeadType = 'individual' | 'business';
export type LeadPriority = 'high' | 'medium' | 'low';

export interface Lead {
  id: string;
  name: string;                    // Full name of contact person (required)
  phone: string;                   // Primary identifier - must be unique (required)
  email?: string;                  // Optional - not used for authentication
  source: string;                  // Lead source (required)
  status: string;                  // Lead status/pipeline stage (required)
  assignedTo: string;              // Assigned user ID (required)
  assignedToName?: string;         // Assigned user name (for display)
  leadType?: LeadType;             // Individual or Business
  companyName?: string;            // Company name (if business lead)
  productInterest?: string;        // Product/service they're interested in
  priority?: LeadPriority;         // Priority level (high, medium, low)
  initialNotes?: string;           // Initial notes/comments
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, string>;
}

export interface Note {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export type FollowUpType =
  | 'call'
  | 'whatsapp'
  | 'meeting-online'
  | 'meeting-in-person'
  | 'email-followup'
  | 'site-visit'
  | 'product-demo'
  | 'document-review'
  | 'proposal-review'
  | 'contract-discussion'
  | 'payment-followup'
  | 'other';

export type FollowUpStatus =
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'missed'
  | 'cancelled'
  | 'rescheduled';

export type FollowUpPriority = 'high' | 'medium' | 'low';

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  followUpType: FollowUpType;
  dueDate: string;
  dueTime: string;
  assignedTo: string;
  assignedToName: string;
  status: FollowUpStatus;
  notes?: string;
  priority?: FollowUpPriority;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  completedDate?: string;
  // Legacy fields for backward compatibility
  userId?: string;
  isCompleted?: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface LeadSource {
  id: string;
  name: string;
}

export interface LeadStatus {
  id: string;
  name: string;
  color: string;
}

export interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface Notification {
  id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'lead_new' | 'followup_upcoming' | 'followup_missed' | 'system';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  todayFollowUps: number;
  overdueFollowUps: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  leadsByUser: Record<string, number>;
}
