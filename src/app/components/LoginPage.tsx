import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Eye, EyeOff, Loader2, Mail, MessageSquare, User } from 'lucide-react';
import { authConfigService, AuthMethods } from '../services/authConfigService';

type AuthMethod = 'username' | 'email' | 'whatsapp';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [credential, setCredential] = useState(''); // Can be username, email, or phone
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState<AuthMethod>('username');
  const [authMethods, setAuthMethods] = useState<AuthMethods | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    loadAuthMethods();
  }, []);

  const loadAuthMethods = async () => {
    try {
      const methods = await authConfigService.getAuthMethods();
      setAuthMethods(methods);
      // Set active method to first available enabled method
      if (methods.username.enabled) {
        setActiveMethod('username');
      } else if (methods.email.enabled) {
        setActiveMethod('email');
      } else if (methods.whatsapp.enabled) {
        setActiveMethod('whatsapp');
      }
    } catch (error) {
      console.error('Error loading auth methods:', error);
      // Default to username if API fails
      setAuthMethods({
        username: {
          enabled: true,
          name: 'Username/Password',
          requiresVerification: false,
          configValid: true,
        },
        email: {
          enabled: false,
          name: 'Email',
          requiresVerification: false,
          configValid: false,
        },
        whatsapp: {
          enabled: false,
          name: 'WhatsApp',
          requiresVerification: true,
          configValid: false,
        },
      });
    }
  };

  const handleUsernamePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credential || !password) {
      setError('Please enter both username/email and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(credential, password);
      if (!success) {
        setError('Invalid credentials or inactive user');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credential) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const success = await authConfigService.sendEmailVerificationCode(credential);
      if (success) {
        setShowVerification(true);
        setError('');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } catch (error) {
      setError('Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsappVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credential) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const success = await authConfigService.sendWhatsAppVerificationCode(credential);
      if (success) {
        setShowVerification(true);
        setError('');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } catch (error) {
      setError('Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authMethods) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">LF</span>
            </div>
          </div>
          <CardTitle className="text-center text-2xl">LeadsFlow CRM</CardTitle>
          <CardDescription className="text-center">
            Sign in to manage your leads and pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Authentication Method Tabs */}
          {(authMethods.username.enabled ||
            authMethods.email.enabled ||
            authMethods.whatsapp.enabled) && (
            <div className="mb-6 grid grid-cols-3 gap-2">
              {authMethods.username.enabled && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('username');
                    setShowVerification(false);
                    setError('');
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    activeMethod === 'username'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Username</span>
                </button>
              )}
              {authMethods.email.enabled && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('email');
                    setShowVerification(false);
                    setError('');
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    activeMethod === 'email'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!authMethods.email.configValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!authMethods.email.configValid}
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email</span>
                </button>
              )}
              {authMethods.whatsapp.enabled && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('whatsapp');
                    setShowVerification(false);
                    setError('');
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    activeMethod === 'whatsapp'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!authMethods.whatsapp.configValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!authMethods.whatsapp.configValid}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              )}
            </div>
          )}

          {/* Username/Password Login */}
          {activeMethod === 'username' && (
            <form onSubmit={handleUsernamePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="credential">Username or Email</Label>
                <Input
                  id="credential"
                  type="text"
                  placeholder="admin or admin@ents.com"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}

          {/* Email Login */}
          {activeMethod === 'email' && (
            <form
              onSubmit={
                showVerification
                  ? (e) => {
                      e.preventDefault();
                      // Implement email verification with code
                    }
                  : handleEmailVerificationRequest
              }
              className="space-y-4"
            >
              {!showVerification ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    We sent a verification code to {credential}
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      autoFocus
                      maxLength={6}
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowVerification(false)}
                  >
                    Use Different Email
                  </Button>
                </>
              )}
            </form>
          )}

          {/* WhatsApp Login */}
          {activeMethod === 'whatsapp' && (
            <form
              onSubmit={
                showVerification
                  ? (e) => {
                      e.preventDefault();
                      // Implement WhatsApp verification with code
                    }
                  : handleWhatsappVerificationRequest
              }
              className="space-y-4"
            >
              {!showVerification ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500">
                      Include country code (e.g., +1 for USA)
                    </p>
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Code via WhatsApp'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Check WhatsApp on {credential} for your verification code
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="wcode">Verification Code</Label>
                    <Input
                      id="wcode"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      autoFocus
                      maxLength={6}
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowVerification(false)}
                  >
                    Use Different Phone Number
                  </Button>
                </>
              )}
            </form>
          )}

          {/* Demo Credentials */}
          {activeMethod === 'username' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800">
              <p className="font-semibold mb-2">Demo Account:</p>
              <p>
                <strong>Email:</strong> sujeet.karn@erpca.com
              </p>
              <p>
                <strong>Username:</strong> sujeet.karn
              </p>
              <p className="mt-2 text-blue-600">
                Use the password you set during setup or reset
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
