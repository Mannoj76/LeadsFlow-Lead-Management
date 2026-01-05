// API Client for LeadsFlow CRM Backend

const API_BASE_URL = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as any)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));

      // Handle setup required
      if (response.status === 503 && error.setupRequired) {
        throw new Error('SETUP_REQUIRED');
      }

      // Handle authentication errors
      if (response.status === 401) {
        this.clearToken();
        throw new Error(error.error || 'Authentication required');
      }

      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Setup API
  async checkSetupStatus(): Promise<{ setupRequired: boolean; setupCompleted: boolean }> {
    return this.get('/setup/status');
  }

  async testDatabaseConnection(mongodbUri: string, databaseName: string): Promise<{ success: boolean; error?: string }> {
    return this.post('/setup/test-connection', { mongodbUri, databaseName });
  }

  async validateLicense(licenseKey: string): Promise<{ valid: boolean; error?: string }> {
    return this.post('/setup/validate-license', { licenseKey });
  }

  async completeSetup(setupData: {
    mongodbUri: string;
    databaseName: string;
    licenseKey: string;
    companyName: string;
    companyEmail: string;
    companyPhone?: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.post('/setup/complete', setupData);
  }

  async generateTestLicense(): Promise<{ licenseKey: string }> {
    return this.get('/setup/generate-test-license');
  }

  // Auth API
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.post<{ token: string; user: any }>('/auth/login', { email, password });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.post('/auth/logout');
    this.clearToken();
  }

  async getCurrentUser(): Promise<{ user: any }> {
    return this.get('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.post('/auth/change-password', { currentPassword, newPassword });
  }
}

export const apiClient = new ApiClient();

