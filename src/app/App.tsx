import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { SidebarLayout } from './components/SidebarLayout';
import { DashboardPage } from './components/DashboardPage';
import { LeadsPage } from './components/LeadsPage';
import { LeadDetailPage } from './components/LeadDetailPage';
import { PipelinePage } from './components/PipelinePage';
import { FollowUpsPage } from './components/FollowUpsPage';
import { ReportsPage } from './components/ReportsPage';
import { ImportPage } from './components/ImportPage';
import { SettingsPage } from './components/SettingsPage';
import { UsersPage } from './components/UsersPage';
import { SetupWizard } from './components/SetupWizard';
import { Toaster } from './components/ui/sonner';
import { apiClient } from './services/apiClient';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Check if setup is required on mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await apiClient.checkSetupStatus();
        setSetupRequired(status.setupRequired);
      } catch (error) {
        console.error('Failed to check setup status:', error);
        // If API call fails, assume setup is NOT required (user might already be set up)
        // and let them try to login. If they need setup, they'll see the error.
        setSetupRequired(false);
      } finally {
        setCheckingSetup(false);
      }
    };

    checkSetup();
  }, []);

  const handleSetupComplete = () => {
    setSetupRequired(false);
    window.location.reload(); // Reload to initialize the app with new config
  };

  // Show loading while checking setup status
  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show setup wizard if setup is required
  if (setupRequired) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedLeadId(null);
  };

  const handleViewLead = (leadId: string) => {
    setSelectedLeadId(leadId);
  };

  const handleBackToLeads = () => {
    setSelectedLeadId(null);
    setCurrentPage('leads');
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    // If viewing a specific lead
    if (selectedLeadId) {
      return <LeadDetailPage leadId={selectedLeadId} onBack={handleBackToLeads} />;
    }

    // Regular page navigation
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'leads':
        return <LeadsPage onViewLead={handleViewLead} />;
      case 'pipeline':
        return <PipelinePage onViewLead={handleViewLead} />;
      case 'follow-ups':
        return <FollowUpsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'import':
        return <ImportPage />;
      case 'settings':
        return <SettingsPage />;
      case 'users':
        return <UsersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <SidebarLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </SidebarLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="size-full">
        <AppContent />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}
