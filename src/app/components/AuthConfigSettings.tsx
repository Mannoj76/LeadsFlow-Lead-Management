import React, { useState, useEffect } from 'react';
import { authConfigService, AuthConfig } from '../services/authConfigService';
import { AlertCircle, CheckCircle, MailIcon, MessageSquare, Loader2 } from 'lucide-react';

interface TestStatus {
  email: boolean | null;
  whatsapp: boolean | null;
  loading: boolean;
}

export default function AuthConfigSettings() {
  const [config, setConfig] = useState<AuthConfig>({
    emailAuthEnabled: false,
    emailVerificationRequired: false,
    emailConfigValid: false,
    whatsappEnabled: false,
    whatsappConfigValid: false,
  });

  const [smtpConfig, setSmtpConfig] = useState({
    emailSmtpServer: '',
    emailSmtpPort: 587,
    emailSmtpUsername: '',
    emailSmtpPassword: '',
    emailSmtpSecure: false,
    emailFromAddress: '',
  });

  const [whatsappConfig, setWhatsappConfig] = useState({
    whatsappBusinessAccountId: '',
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappWebhookToken: '',
  });

  const [testStatus, setTestStatus] = useState<TestStatus>({
    email: null,
    whatsapp: null,
    loading: false,
  });

  const [savingEmail, setSavingEmail] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const authConfig = await authConfigService.getAuthConfig();
      setConfig(authConfig);
    } catch (error) {
      console.error('Error loading auth config:', error);
      setMessage('Error loading configuration');
    }
  };

  const handleEmailConfigChange = (
    field: keyof typeof smtpConfig,
    value: string | number | boolean
  ) => {
    setSmtpConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWhatsappConfigChange = (
    field: keyof typeof whatsappConfig,
    value: string
  ) => {
    setWhatsappConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmailConfigToggle = async () => {
    setSavingEmail(true);
    try {
      const newConfig = {
        emailAuthEnabled: !config.emailAuthEnabled,
        ...smtpConfig,
        emailVerificationRequired: config.emailVerificationRequired,
      };

      await authConfigService.updateEmailConfig(newConfig);
      setConfig((prev) => ({
        ...prev,
        emailAuthEnabled: !prev.emailAuthEnabled,
      }));
      setMessage('Email configuration updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating email config:', error);
      setMessage('Error updating email configuration');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleWhatsappConfigToggle = async () => {
    setSavingWhatsapp(true);
    try {
      await authConfigService.updateWhatsAppConfig({
        whatsappEnabled: !config.whatsappEnabled,
        ...whatsappConfig,
      });
      setConfig((prev) => ({
        ...prev,
        whatsappEnabled: !prev.whatsappEnabled,
      }));
      setMessage('WhatsApp configuration updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating WhatsApp config:', error);
      setMessage('Error updating WhatsApp configuration');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleTestEmail = async () => {
    setTestStatus((prev) => ({ ...prev, loading: true }));
    try {
      const success = await authConfigService.testEmailConnection();
      setTestStatus((prev) => ({
        ...prev,
        email: success,
        loading: false,
      }));
    } catch (error) {
      console.error('Error testing email:', error);
      setTestStatus((prev) => ({
        ...prev,
        email: false,
        loading: false,
      }));
    }
  };

  const handleTestWhatsapp = async () => {
    setTestStatus((prev) => ({ ...prev, loading: true }));
    try {
      const success = await authConfigService.testWhatsAppConnection();
      setTestStatus((prev) => ({
        ...prev,
        whatsapp: success,
        loading: false,
      }));
    } catch (error) {
      console.error('Error testing WhatsApp:', error);
      setTestStatus((prev) => ({
        ...prev,
        whatsapp: false,
        loading: false,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Authentication Configuration
            </h1>
            <p className="text-gray-600 mt-1">
              Configure authentication methods for your CRM
            </p>
          </div>

          {message && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {message}
            </div>
          )}

          {/* Email Configuration */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MailIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Email Authentication
                  </h2>
                  <p className="text-sm text-gray-600">
                    Enable users to login via email
                  </p>
                </div>
              </div>
              <button
                onClick={handleEmailConfigToggle}
                disabled={savingEmail}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  config.emailAuthEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                {savingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : config.emailAuthEnabled ? (
                  'Disable'
                ) : (
                  'Enable'
                )}
              </button>
            </div>

            {config.emailAuthEnabled && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="SMTP Server (e.g., smtp.gmail.com)"
                    value={smtpConfig.emailSmtpServer}
                    onChange={(e) =>
                      handleEmailConfigChange('emailSmtpServer', e.target.value)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="SMTP Port (e.g., 587)"
                    value={smtpConfig.emailSmtpPort}
                    onChange={(e) =>
                      handleEmailConfigChange(
                        'emailSmtpPort',
                        parseInt(e.target.value)
                      )
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <input
                  type="email"
                  placeholder="From Email Address"
                  value={smtpConfig.emailFromAddress}
                  onChange={(e) =>
                    handleEmailConfigChange('emailFromAddress', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="SMTP Username"
                  value={smtpConfig.emailSmtpUsername}
                  onChange={(e) =>
                    handleEmailConfigChange('emailSmtpUsername', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="password"
                  placeholder="SMTP Password"
                  value={smtpConfig.emailSmtpPassword}
                  onChange={(e) =>
                    handleEmailConfigChange('emailSmtpPassword', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={smtpConfig.emailSmtpSecure}
                    onChange={(e) =>
                      handleEmailConfigChange('emailSmtpSecure', e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Use TLS/SSL (secure connection)
                  </span>
                </label>

                <button
                  onClick={handleTestEmail}
                  disabled={testStatus.loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {testStatus.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : testStatus.email === null ? (
                    'Test Email Connection'
                  ) : testStatus.email ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Connection Successful
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Connection Failed
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* WhatsApp Configuration */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    WhatsApp Authentication
                  </h2>
                  <p className="text-sm text-gray-600">
                    Enable users to login via WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={handleWhatsappConfigToggle}
                disabled={savingWhatsapp}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  config.whatsappEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                {savingWhatsapp ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : config.whatsappEnabled ? (
                  'Disable'
                ) : (
                  'Enable'
                )}
              </button>
            </div>

            {config.whatsappEnabled && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="Business Account ID"
                  value={whatsappConfig.whatsappBusinessAccountId}
                  onChange={(e) =>
                    handleWhatsappConfigChange(
                      'whatsappBusinessAccountId',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <input
                  type="text"
                  placeholder="Phone Number ID"
                  value={whatsappConfig.whatsappPhoneNumberId}
                  onChange={(e) =>
                    handleWhatsappConfigChange(
                      'whatsappPhoneNumberId',
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <input
                  type="password"
                  placeholder="Access Token"
                  value={whatsappConfig.whatsappAccessToken}
                  onChange={(e) =>
                    handleWhatsappConfigChange('whatsappAccessToken', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <input
                  type="text"
                  placeholder="Webhook Token"
                  value={whatsappConfig.whatsappWebhookToken}
                  onChange={(e) =>
                    handleWhatsappConfigChange('whatsappWebhookToken', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  onClick={handleTestWhatsapp}
                  disabled={testStatus.loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {testStatus.loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : testStatus.whatsapp === null ? (
                    'Test WhatsApp Connection'
                  ) : testStatus.whatsapp ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Connection Successful
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Connection Failed
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
