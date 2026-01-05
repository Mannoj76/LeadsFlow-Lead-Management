import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { InlineForm, FormActions } from './ui/inline-form';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { userService } from '../services/apiService';
import type { User, UserRole } from '../types';
import { Plus, Edit, Trash2, UserCheck, UserX, Eye, EyeOff, Key, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { validatePassword, validateUsername } from '../utils/passwordSecurity';
import { getRoleInfo } from '../utils/permissions';
import { countryCodes, formatE164, parseE164 } from '../utils/phoneUtils';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    localPhone: '',
    role: 'sales' as UserRole,
    department: '',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAll();
      setUsers(allUsers);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error(error.message || 'Failed to load users');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
      phone: '',
      countryCode: '+91',
      localPhone: '',
      role: 'sales',
      department: '',
      isActive: true,
    });
    setEditingUser(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsChangePasswordMode(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    const { countryCode, localNumber } = parseE164(user.phone || '');
    setFormData({
      username: user.username,
      password: '',
      confirmPassword: '',
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      countryCode: countryCode || '+91',
      localPhone: localNumber,
      role: user.role,
      department: user.department || '',
      isActive: user.isActive,
    });
    setEditingUser(user);
    setIsChangePasswordMode(false);
    setIsFormOpen(true);
  };

  const handleOpenChangePassword = (user: User) => {
    const { countryCode, localNumber } = parseE164(user.phone || '');
    setFormData({
      username: user.username,
      password: '',
      confirmPassword: '',
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      countryCode: countryCode || '+91',
      localPhone: localNumber,
      role: user.role,
      department: user.department || '',
      isActive: user.isActive,
    });
    setEditingUser(user);
    setIsChangePasswordMode(true);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.username || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate username format
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.valid) {
      toast.error(usernameValidation.error || 'Invalid username');
      return;
    }

    // Check for duplicate username
    const existingUser = users.find(
      (u) => u.username === formData.username && u.id !== editingUser?.id
    );
    if (existingUser) {
      toast.error('Username already exists');
      return;
    }

    // Password validation (only on create or change password mode)
    if (!editingUser || isChangePasswordMode) {
      if (!formData.password || !formData.confirmPassword) {
        toast.error('Password is required');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        toast.error(passwordValidation.errors[0]);
        return;
      }
    }

    try {
      // Combine phone if provided
      const fullPhone = formData.localPhone ? formatE164(formData.countryCode, formData.localPhone) : '';

      // Prepare user data
      const userData: any = {
        username: formData.username,
        name: formData.name,
        email: formData.email || undefined,
        phone: fullPhone || undefined,
        role: formData.role,
        department: formData.department || undefined,
        isActive: formData.isActive,
        updatedAt: new Date().toISOString(),
      };

      // Passwords should be hashed on the backend.
      // We send the plain text password here, and the User model pre-save hook 
      // will handle the bcrypt hashing.
      if (formData.password) {
        userData.password = formData.password;
      }

      if (editingUser) {
        if (isChangePasswordMode) {
          // Only update password
          await userService.update(editingUser.id, {
            password: userData.password,
            updatedAt: userData.updatedAt,
          });
          toast.success('Password changed successfully');
        } else {
          // Update user (exclude password if not provided)
          const { password, ...updateData } = userData;
          await userService.update(editingUser.id, updateData);
          toast.success('User updated successfully');
        }
      } else {
        // Create new user
        await userService.create(userData);
        toast.success('User created successfully');
      }

      handleCloseForm();
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred. Please try again.');
      console.error('Error saving user:', error);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userService.update(user.id, { isActive: !user.isActive });
      toast.success(
        user.isActive ? 'User deactivated successfully' : 'User activated successfully'
      );
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await userService.delete(user.id);
        toast.success('User deleted successfully');
        await loadUsers();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const managerCount = users.filter((u) => u.role === 'manager').length;
  const salesCount = users.filter((u) => u.role === 'sales').length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1">Manage team members and access</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{adminCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Managers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{managerCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sales Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{salesCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-4 border rounded-lg ${user.isActive
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <Badge
                          variant="secondary"
                          className={
                            user.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-700'
                              : user.role === 'manager'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {getRoleInfo(user.role).icon} {getRoleInfo(user.role).label}
                        </Badge>
                        {user.isActive ? (
                          <Badge className="bg-green-100 text-green-700">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">@{user.username}</span>
                        {user.email && <span className="text-slate-500"> • {user.email}</span>}
                        {user.phone && <span className="text-slate-500"> • {user.phone}</span>}
                      </p>
                      {user.department && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Department: {user.department}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                        {user.lastLogin && (
                          <span className="ml-3">
                            Last login: {new Date(user.lastLogin).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <Label htmlFor={`active-${user.id}`} className="text-sm text-slate-600">
                        Active
                      </Label>
                      <Switch
                        id={`active-${user.id}`}
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleActive(user)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenChangePassword(user)}
                      title="Change Password"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(user)}
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Inline Form */}
      <InlineForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={
          isChangePasswordMode
            ? 'Change Password'
            : editingUser
              ? 'Edit User'
              : 'Create New User'
        }
        description={
          isChangePasswordMode
            ? `Change password for ${editingUser?.name}`
            : editingUser
              ? 'Update user information'
              : 'Add a new internal employee account'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isChangePasswordMode && (
            <>
              {/* Username - Required for login */}
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="john.doe"
                  required
                  pattern="[a-zA-Z0-9._-]+"
                  title="Only letters, numbers, dots, underscores, and hyphens"
                  disabled={!!editingUser}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Used for login. Must be unique. {editingUser && '(Cannot be changed)'}
                </p>
              </div>

              {/* Full Name - Required */}
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
            </>
          )}

          {/* Password - Required only on create */}
          {(!editingUser || isChangePasswordMode) && (
            <>
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 8 characters. Must include uppercase, lowercase, number, and special character.
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {!isChangePasswordMode && (
            <>
              {/* Email - Optional */}
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@company.com"
                />
                <p className="text-xs text-slate-500 mt-1">
                  For internal communication only. Not used for login.
                </p>
              </div>

              {/* Phone - Optional */}
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <div className="grid grid-cols-12 gap-2 mt-1">
                  <div className="col-span-4 md:col-span-3">
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                    >
                      <SelectTrigger className="h-9 px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map(country => (
                          <SelectItem key={`${country.name}-${country.code}`} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span className="font-mono">{country.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-8 md:col-span-9">
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.localPhone}
                      onChange={(e) => setFormData({ ...formData, localPhone: e.target.value.replace(/\D/g, '') })}
                      placeholder={countryCodes.find(c => c.code === formData.countryCode)?.placeholder || "9876543210"}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {/* Role - Required */}
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <span>{getRoleInfo('admin').icon}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{getRoleInfo('admin').label}</span>
                          <span className="text-xs text-slate-500">{getRoleInfo('admin').description}</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div className="flex items-center gap-2">
                        <span>{getRoleInfo('manager').icon}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{getRoleInfo('manager').label}</span>
                          <span className="text-xs text-slate-500">{getRoleInfo('manager').description}</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="sales">
                      <div className="flex items-center gap-2">
                        <span>{getRoleInfo('sales').icon}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{getRoleInfo('sales').label}</span>
                          <span className="text-xs text-slate-500">{getRoleInfo('sales').description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department - Optional */}
              <div>
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Sales, Marketing, Support"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                  <Label htmlFor="isActive" className="font-medium">Active User</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Inactive users cannot log in to the system
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </>
          )}

          <FormActions
            onCancel={handleCloseForm}
            submitLabel={
              isChangePasswordMode
                ? 'Change Password'
                : editingUser
                  ? 'Update User'
                  : 'Create User'
            }
          />
        </form>
      </InlineForm>
    </div>
  );
};
