// API Service for LeadsFlow CRM - MongoDB Backend Integration
import type {
  User,
  Lead,
  Note,
  Activity,
  FollowUp,
  PipelineStage,
  LeadSource,
  LeadStatus,
  SystemSettings,
  DashboardStats
} from '../types';
import { apiClient } from './apiClient';

// User management
export const userService = {
  getAll: async (): Promise<User[]> => {
    return apiClient.get('/users');
  },

  getById: async (id: string): Promise<User> => {
    return apiClient.get(`/users/${id}`);
  },

  create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    return apiClient.post('/users', user);
  },

  update: async (id: string, updates: Partial<User>): Promise<User> => {
    return apiClient.put(`/users/${id}`, updates);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

// Lead management
export const leadService = {
  getAll: async (): Promise<Lead[]> => {
    return apiClient.get('/leads');
  },

  getById: async (id: string): Promise<Lead> => {
    return apiClient.get(`/leads/${id}`);
  },

  create: async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    return apiClient.post('/leads', lead);
  },

  update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    return apiClient.put(`/leads/${id}`, updates);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/leads/${id}`);
  },

  bulkImport: async (leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<{ message: string; count: number }> => {
    return apiClient.post('/leads/bulk-import', { leads });
  },
};

// Note management
export const noteService = {
  getByLeadId: async (leadId: string): Promise<Note[]> => {
    return apiClient.get(`/notes/lead/${leadId}`);
  },

  create: async (note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> => {
    return apiClient.post('/notes', note);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/${id}`);
  },
};

// Activity management
export const activityService = {
  getByLeadId: async (leadId: string): Promise<Activity[]> => {
    return apiClient.get(`/activities/lead/${leadId}`);
  },

  create: async (activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> => {
    return apiClient.post('/activities', activity);
  },
};

// Follow-up management
export const followUpService = {
  getAll: async (): Promise<FollowUp[]> => {
    return apiClient.get('/followups');
  },

  getByLeadId: async (leadId: string): Promise<FollowUp[]> => {
    return apiClient.get(`/followups/lead/${leadId}`);
  },

  getTodayFollowUps: async (): Promise<FollowUp[]> => {
    const allFollowUps = await followUpService.getAll();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return allFollowUps.filter(followUp => {
      const dueDate = new Date(followUp.dueDate);
      return dueDate >= today && dueDate < tomorrow && followUp.status === 'scheduled';
    });
  },

  getOverdueFollowUps: async (): Promise<FollowUp[]> => {
    const allFollowUps = await followUpService.getAll();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return allFollowUps.filter(followUp => {
      const dueDate = new Date(followUp.dueDate);
      return dueDate < today && followUp.status === 'scheduled';
    });
  },

  create: async (followUp: Omit<FollowUp, 'id' | 'createdAt'>): Promise<FollowUp> => {
    return apiClient.post('/followups', followUp);
  },

  update: async (id: string, updates: Partial<FollowUp>): Promise<FollowUp> => {
    return apiClient.put(`/followups/${id}`, updates);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/followups/${id}`);
  },

  markAsCompleted: async (id: string): Promise<FollowUp> => {
    return apiClient.put(`/followups/${id}`, {
      status: 'completed',
      completedDate: new Date().toISOString()
    });
  },
};

// Pipeline stages
export const pipelineService = {
  getAll: async (): Promise<PipelineStage[]> => {
    return apiClient.get('/config/pipeline-stages');
  },

  create: async (stage: Omit<PipelineStage, 'id'>): Promise<PipelineStage> => {
    return apiClient.post('/config/pipeline-stages', stage);
  },

  update: async (id: string, updates: Partial<PipelineStage>): Promise<PipelineStage> => {
    return apiClient.put(`/config/pipeline-stages/${id}`, updates);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/config/pipeline-stages/${id}`);
  },
};

// Lead sources
export const sourceService = {
  getAll: async (): Promise<LeadSource[]> => {
    return apiClient.get('/config/lead-sources');
  },

  create: async (source: Omit<LeadSource, 'id'>): Promise<LeadSource> => {
    return apiClient.post('/config/lead-sources', source);
  },
};

// Lead statuses
export const statusService = {
  getAll: async (): Promise<LeadStatus[]> => {
    return apiClient.get('/config/lead-statuses');
  },

  create: async (status: Omit<LeadStatus, 'id'>): Promise<LeadStatus> => {
    return apiClient.post('/config/lead-statuses', status);
  },

  update: async (id: string, updates: Partial<LeadStatus>): Promise<LeadStatus> => {
    return apiClient.put(`/config/lead-statuses/${id}`, updates);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/config/lead-statuses/${id}`);
  },
};

// Settings
export const settingsService = {
  get: async (): Promise<SystemSettings> => {
    return apiClient.get('/config/settings');
  },

  update: async (settings: SystemSettings): Promise<SystemSettings> => {
    return apiClient.put('/config/settings', settings);
  },
};

// Authentication
export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.login(email, password);
    return response.user;
  },

  logout: async (): Promise<void> => {
    await apiClient.logout();
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.getCurrentUser();
      return response.user;
    } catch (error) {
      return null;
    }
  },
};

// Dashboard statistics
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get('/dashboard/stats');
  },
};

// Notifications
export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    return apiClient.get('/notifications');
  },
  markAsRead: async (id: string): Promise<Notification> => {
    return apiClient.patch(`/notifications/${id}/read`, {});
  },
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    return apiClient.patch('/notifications/read-all', {});
  },
  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/notifications/${id}`);
  },
};

export default apiClient;
