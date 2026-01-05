/**
 * Role-Based Access Control (RBAC) System
 * For internal employee management
 */

import type { User, UserRole } from '../types';

/**
 * System Permissions
 * Define all available permissions in the system
 */
export const PERMISSIONS = {
  // User Management
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  VIEW_USERS: 'view_users',
  CHANGE_USER_ROLE: 'change_user_role',
  ACTIVATE_DEACTIVATE_USER: 'activate_deactivate_user',
  
  // Lead Management
  CREATE_LEAD: 'create_lead',
  EDIT_ALL_LEADS: 'edit_all_leads',
  EDIT_OWN_LEADS: 'edit_own_leads',
  DELETE_LEAD: 'delete_lead',
  VIEW_ALL_LEADS: 'view_all_leads',
  VIEW_OWN_LEADS: 'view_own_leads',
  ASSIGN_LEADS: 'assign_leads',
  REASSIGN_LEADS: 'reassign_leads',
  
  // Follow-ups
  CREATE_FOLLOWUP: 'create_followup',
  EDIT_ALL_FOLLOWUPS: 'edit_all_followups',
  EDIT_OWN_FOLLOWUPS: 'edit_own_followups',
  DELETE_FOLLOWUP: 'delete_followup',
  VIEW_ALL_FOLLOWUPS: 'view_all_followups',
  VIEW_OWN_FOLLOWUPS: 'view_own_followups',
  
  // Reports & Analytics
  VIEW_REPORTS: 'view_reports',
  VIEW_TEAM_REPORTS: 'view_team_reports',
  VIEW_OWN_REPORTS: 'view_own_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Settings & Configuration
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_SOURCES: 'manage_sources',
  MANAGE_STATUSES: 'manage_statuses',
  MANAGE_PIPELINE_STAGES: 'manage_pipeline_stages',
} as const;

/**
 * Role Permissions Mapping
 * Define which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  /**
   * ADMIN - Full system access
   * - Complete user management
   * - All lead operations
   * - System configuration
   * - All reports and analytics
   */
  admin: [
    // User Management - Full Access
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CHANGE_USER_ROLE,
    PERMISSIONS.ACTIVATE_DEACTIVATE_USER,
    
    // Lead Management - Full Access
    PERMISSIONS.CREATE_LEAD,
    PERMISSIONS.EDIT_ALL_LEADS,
    PERMISSIONS.DELETE_LEAD,
    PERMISSIONS.VIEW_ALL_LEADS,
    PERMISSIONS.ASSIGN_LEADS,
    PERMISSIONS.REASSIGN_LEADS,
    
    // Follow-ups - Full Access
    PERMISSIONS.CREATE_FOLLOWUP,
    PERMISSIONS.EDIT_ALL_FOLLOWUPS,
    PERMISSIONS.DELETE_FOLLOWUP,
    PERMISSIONS.VIEW_ALL_FOLLOWUPS,
    
    // Reports - Full Access
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_TEAM_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    
    // Settings - Full Access
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_SOURCES,
    PERMISSIONS.MANAGE_STATUSES,
    PERMISSIONS.MANAGE_PIPELINE_STAGES,
  ],

  /**
   * MANAGER - Team oversight and management
   * - View users (no create/delete)
   * - All lead operations
   * - Lead assignment
   * - Team reports
   * - Limited settings
   */
  manager: [
    // User Management - View Only
    PERMISSIONS.VIEW_USERS,
    
    // Lead Management - Full Access
    PERMISSIONS.CREATE_LEAD,
    PERMISSIONS.EDIT_ALL_LEADS,
    PERMISSIONS.VIEW_ALL_LEADS,
    PERMISSIONS.ASSIGN_LEADS,
    PERMISSIONS.REASSIGN_LEADS,
    
    // Follow-ups - Full Access
    PERMISSIONS.CREATE_FOLLOWUP,
    PERMISSIONS.EDIT_ALL_FOLLOWUPS,
    PERMISSIONS.VIEW_ALL_FOLLOWUPS,
    
    // Reports - Team Level
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_TEAM_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    
    // Settings - Limited
    PERMISSIONS.MANAGE_SOURCES,
    PERMISSIONS.MANAGE_STATUSES,
    PERMISSIONS.MANAGE_PIPELINE_STAGES,
  ],

  /**
   * SALES - Individual contributor
   * - No user management
   * - Own leads only
   * - Own follow-ups only
   * - Own reports only
   * - No settings access
   */
  sales: [
    // Lead Management - Own Leads Only
    PERMISSIONS.CREATE_LEAD,
    PERMISSIONS.EDIT_OWN_LEADS,
    PERMISSIONS.VIEW_OWN_LEADS,
    
    // Follow-ups - Own Only
    PERMISSIONS.CREATE_FOLLOWUP,
    PERMISSIONS.EDIT_OWN_FOLLOWUPS,
    PERMISSIONS.VIEW_OWN_FOLLOWUPS,
    
    // Reports - Own Only
    PERMISSIONS.VIEW_OWN_REPORTS,
  ],
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user || !user.isActive) {
    return false;
  }
  
  return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user || !user.isActive) {
    return false;
  }
  
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  if (!user || !user.isActive) {
    return false;
  }
  
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get role display information
 */
export const getRoleInfo = (role: UserRole) => {
  const roleInfo = {
    admin: {
      label: 'Administrator',
      description: 'Full system access and user management',
      color: 'indigo',
      icon: '👑',
    },
    manager: {
      label: 'Manager',
      description: 'Team oversight, reports, and lead assignment',
      color: 'purple',
      icon: '📊',
    },
    sales: {
      label: 'Sales User',
      description: 'Manage assigned leads and follow-ups',
      color: 'blue',
      icon: '💼',
    },
  };
  
  return roleInfo[role];
};

