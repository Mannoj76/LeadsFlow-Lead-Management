import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { InlineForm, FormActions } from './ui/inline-form';
import { Badge } from './ui/badge';
import { followUpService, leadService, userService } from '../services/dataService';
import type { FollowUp, Lead, User, FollowUpType, FollowUpStatus, FollowUpPriority } from '../types';
import { Plus, Calendar, Clock, AlertCircle, CheckCircle, Trash2, Edit, Phone, Users, MapPin, Mail, FileText, FileCheck, FileSignature, Video, MessageSquare, Presentation, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const FollowUpsPage: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    leadId: '',
    followUpType: 'call' as FollowUpType,
    dueDate: '',
    dueTime: '',
    assignedTo: '',
    status: 'scheduled' as FollowUpStatus,
    notes: '',
    priority: 'medium' as FollowUpPriority,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allFollowUps, allLeads, allUsers] = await Promise.all([
        followUpService.getAll(),
        leadService.getAll(),
        userService.getAll(),
      ]);
      setFollowUps(allFollowUps || []);
      setLeads(allLeads || []);
      const activeUsers = (allUsers || []).filter(u => u.isActive);
      setUsers(activeUsers);
      setCurrentUser(activeUsers.find(u => u.role === 'admin') || activeUsers[0] || null);
    } catch (error) {
      console.error('Failed to load follow-ups data:', error);
      setFollowUps([]);
      setLeads([]);
      setUsers([]);
    }
  };

  const getFilteredFollowUps = () => {
    const today = new Date().toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        return followUps.filter(f =>
          f.dueDate === today &&
          f.status !== 'completed' &&
          f.status !== 'cancelled'
        );
      case 'overdue':
        return followUps.filter(f =>
          f.dueDate < today &&
          f.status !== 'completed' &&
          f.status !== 'cancelled'
        );
      case 'upcoming':
        return followUps.filter(f =>
          f.dueDate > today &&
          f.status !== 'completed' &&
          f.status !== 'cancelled'
        );
      default:
        return followUps;
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      leadId: leads[0]?.id || '',
      followUpType: 'call',
      dueDate: today,
      dueTime: '09:00',
      assignedTo: currentUser?.id || '',
      status: 'scheduled',
      notes: '',
      priority: 'medium',
    });
  };

  const handleOpenCreate = () => {
    setEditingFollowUp(null);
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    setFormData({
      leadId: followUp.leadId,
      followUpType: followUp.followUpType,
      dueDate: followUp.dueDate,
      dueTime: followUp.dueTime,
      assignedTo: followUp.assignedTo,
      status: followUp.status,
      notes: followUp.notes || '',
      priority: followUp.priority || 'medium',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFollowUp(null);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leadId || !formData.followUpType || !formData.dueDate || !formData.dueTime || !formData.assignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }

    const lead = leads.find(l => l.id === formData.leadId);
    if (!lead) {
      toast.error('Lead not found');
      return;
    }

    const assignedUser = users.find(u => u.id === formData.assignedTo);
    if (!assignedUser) {
      toast.error('Assigned user not found');
      return;
    }

    if (editingFollowUp) {
      // Update existing follow-up
      followUpService.update(editingFollowUp.id, {
        leadId: formData.leadId,
        leadName: lead.name,
        followUpType: formData.followUpType,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime,
        assignedTo: formData.assignedTo,
        assignedToName: assignedUser.name,
        status: formData.status,
        notes: formData.notes,
        priority: formData.priority,
      });
      toast.success('Follow-up updated successfully');
    } else {
      // Create new follow-up
      followUpService.create({
        leadId: formData.leadId,
        leadName: lead.name,
        followUpType: formData.followUpType,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime,
        assignedTo: formData.assignedTo,
        assignedToName: assignedUser.name,
        status: formData.status,
        notes: formData.notes,
        priority: formData.priority,
        createdBy: currentUser?.id || '',
        createdByName: currentUser?.name || '',
      });
      toast.success('Follow-up created successfully');
    }

    handleCloseForm();
    loadData();
  };

  const handleStatusChange = (followUp: FollowUp, newStatus: FollowUpStatus) => {
    followUpService.update(followUp.id, { status: newStatus });
    const statusLabels: Record<FollowUpStatus, string> = {
      'scheduled': 'Scheduled',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'missed': 'Missed',
      'cancelled': 'Cancelled',
      'rescheduled': 'Rescheduled',
    };
    toast.success(`Follow-up marked as ${statusLabels[newStatus]}`);
    loadData();
  };

  const handleDelete = (followUp: FollowUp) => {
    if (window.confirm(`Are you sure you want to delete this follow-up for ${followUp.leadName}?`)) {
      followUpService.delete(followUp.id);
      toast.success('Follow-up deleted successfully');
      loadData();
    }
  };

  const getFollowUpTypeIcon = (type: FollowUpType) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'call': return <Phone className={iconClass} />;
      case 'whatsapp': return <MessageSquare className={`${iconClass} text-green-600`} />;
      case 'meeting-online': return <Video className={`${iconClass} text-blue-600`} />;
      case 'meeting-in-person': return <Users className={iconClass} />;
      case 'site-visit': return <MapPin className={iconClass} />;
      case 'product-demo': return <Presentation className={`${iconClass} text-amber-600`} />;
      case 'email-followup': return <Mail className={iconClass} />;
      case 'document-review': return <FileText className={iconClass} />;
      case 'proposal-review': return <FileCheck className={iconClass} />;
      case 'contract-discussion': return <FileSignature className={iconClass} />;
      case 'payment-followup': return <Banknote className={`${iconClass} text-emerald-600`} />;
      default: return <Clock className={iconClass} />;
    }
  };

  const getFollowUpTypeLabel = (type: FollowUpType): string => {
    const labels: Record<FollowUpType, string> = {
      'call': 'Call',
      'whatsapp': 'WhatsApp Follow-up',
      'meeting-online': 'Online Meeting (GMeet/Zoom)',
      'meeting-in-person': 'In-Person Meeting',
      'site-visit': 'Site Visit',
      'product-demo': 'Product Demo / Presentation',
      'email-followup': 'Email Follow-up',
      'document-review': 'Document Review',
      'proposal-review': 'Proposal Review',
      'contract-discussion': 'Contract Discussion',
      'payment-followup': 'Payment Follow-up',
      'other': 'Other',
    };
    return labels[type];
  };

  const getStatusBadge = (status: FollowUpStatus) => {
    const badges: Record<FollowUpStatus, React.ReactElement> = {
      'scheduled': <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>,
      'in-progress': <Badge className="bg-purple-100 text-purple-700">In Progress</Badge>,
      'completed': <Badge className="bg-green-100 text-green-700">Completed</Badge>,
      'missed': <Badge className="bg-red-100 text-red-700">Missed</Badge>,
      'cancelled': <Badge className="bg-gray-100 text-gray-700">Cancelled</Badge>,
      'rescheduled': <Badge className="bg-amber-100 text-amber-700">Rescheduled</Badge>,
    };
    return badges[status];
  };

  const getPriorityBadge = (priority?: FollowUpPriority) => {
    if (!priority) return null;
    const badges: Record<FollowUpPriority, React.ReactElement> = {
      'high': <Badge className="bg-red-100 text-red-700">High Priority</Badge>,
      'medium': <Badge className="bg-yellow-100 text-yellow-700">Medium Priority</Badge>,
      'low': <Badge className="bg-green-100 text-green-700">Low Priority</Badge>,
    };
    return badges[priority];
  };

  const isOverdue = (followUp: FollowUp): boolean => {
    if (followUp.status === 'completed' || followUp.status === 'cancelled') return false;
    const today = new Date().toISOString().split('T')[0];
    return followUp.dueDate < today;
  };

  const isDueToday = (followUp: FollowUp): boolean => {
    if (followUp.status === 'completed' || followUp.status === 'cancelled') return false;
    const today = new Date().toISOString().split('T')[0];
    return followUp.dueDate === today;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredFollowUps = getFilteredFollowUps();
  const todayCount = followUps.filter(f => isDueToday(f)).length;
  const overdueCount = followUps.filter(f => isOverdue(f)).length;
  const activeCount = followUps.filter(f =>
    f.status !== 'completed' && f.status !== 'cancelled'
  ).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Follow-ups</h1>
            <p className="text-slate-600 mt-1">Manage and track your follow-up activities</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Follow-up
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Due Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{todayCount}</div>
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{overdueCount}</div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{activeCount}</div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'today' ? 'default' : 'outline'}
            onClick={() => setFilter('today')}
            size="sm"
          >
            Today
          </Button>
          <Button
            variant={filter === 'overdue' ? 'default' : 'outline'}
            onClick={() => setFilter('overdue')}
            size="sm"
          >
            Overdue
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilter('upcoming')}
            size="sm"
          >
            Upcoming
          </Button>
        </div>
      </div>

      {/* Follow-ups List */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-ups ({filteredFollowUps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFollowUps.length > 0 ? (
            <div className="space-y-3">
              {filteredFollowUps.map(followUp => {
                const overdue = isOverdue(followUp);
                const dueToday = isDueToday(followUp);
                return (
                  <div
                    key={followUp.id}
                    className={`p-4 border rounded-lg ${overdue
                      ? 'border-red-200 bg-red-50'
                      : dueToday
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-slate-200 bg-white'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {getFollowUpTypeIcon(followUp.followUpType)}
                            <h3 className="font-semibold text-slate-900">
                              {followUp.leadName}
                            </h3>
                          </div>
                          {getStatusBadge(followUp.status)}
                          {getPriorityBadge(followUp.priority)}
                          {overdue && <Badge className="bg-red-100 text-red-700">Overdue</Badge>}
                          {dueToday && <Badge className="bg-amber-100 text-amber-700">Due Today</Badge>}
                        </div>

                        <div className="text-sm text-slate-700 mb-2">
                          <span className="font-medium">{getFollowUpTypeLabel(followUp.followUpType)}</span>
                        </div>

                        {followUp.notes && (
                          <p className="text-sm text-slate-600 mb-2">{followUp.notes}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(followUp.dueDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {followUp.dueTime}
                          </div>
                          <div>Assigned to: {followUp.assignedToName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {followUp.status !== 'completed' && followUp.status !== 'cancelled' && (
                          <>
                            <Select
                              value={followUp.status}
                              onValueChange={(value) => handleStatusChange(followUp, value as FollowUpStatus)}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="missed">Missed</SelectItem>
                                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(followUp)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(followUp)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No follow-ups found</p>
              <p className="text-sm text-slate-500 mt-1">
                Schedule follow-ups to stay on top of your leads
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Inline Form */}
      <InlineForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingFollowUp ? 'Edit Follow-up' : 'Schedule Follow-up'}
        description={editingFollowUp ? 'Update follow-up details' : 'Create a new follow-up reminder for a lead'}
        width="full"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* REQUIRED FIELDS SECTION */}
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Required Information
            </h3>

            {/* 2-Column Grid for Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              {/* Lead */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="leadId" className="text-sm font-medium">Lead *</Label>
                  <span className="text-xs text-slate-500">Which lead</span>
                </div>
                <Select
                  value={formData.leadId}
                  onValueChange={(value) => setFormData({ ...formData, leadId: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Follow-up Type */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="followUpType" className="text-sm font-medium">Follow-up Type *</Label>
                  <span className="text-xs text-slate-500">Activity type</span>
                </div>
                <Select
                  value={formData.followUpType}
                  onValueChange={(value) => setFormData({ ...formData, followUpType: value as FollowUpType })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp Follow-up</SelectItem>
                    <SelectItem value="meeting-online">Online Meeting (GMeet/Zoom)</SelectItem>
                    <SelectItem value="meeting-in-person">In-Person Meeting</SelectItem>
                    <SelectItem value="product-demo">Product Demo / Presentation</SelectItem>
                    <SelectItem value="email-followup">Email Follow-up</SelectItem>
                    <SelectItem value="site-visit">Site Visit</SelectItem>
                    <SelectItem value="document-review">Document Review</SelectItem>
                    <SelectItem value="proposal-review">Proposal Review</SelectItem>
                    <SelectItem value="contract-discussion">Contract Discussion</SelectItem>
                    <SelectItem value="payment-followup">Payment Follow-up</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="dueDate" className="text-sm font-medium">Due Date *</Label>
                  <span className="text-xs text-slate-500">When</span>
                </div>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="h-9"
                  required
                />
              </div>

              {/* Due Time */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="dueTime" className="text-sm font-medium">Due Time *</Label>
                  <span className="text-xs text-slate-500">Time</span>
                </div>
                <Input
                  id="dueTime"
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="h-9"
                  required
                />
              </div>

              {/* Assigned To */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="assignedTo" className="text-sm font-medium">Assign To *</Label>
                  <span className="text-xs text-slate-500">Responsible user</span>
                </div>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                  <span className="text-xs text-slate-500">Current status</span>
                </div>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as FollowUpStatus })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* OPTIONAL FIELDS SECTION */}
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Additional Information (Optional)
            </h3>

            {/* 2-Column Grid for Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              {/* Priority */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority Level</Label>
                  <span className="text-xs text-slate-500">Urgency</span>
                </div>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as FollowUpPriority })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Empty space for alignment */}
              <div></div>

              {/* Notes - Spans full width */}
              <div className="md:col-span-2">
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                  <span className="text-xs text-slate-500">Additional context</span>
                </div>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add follow-up notes or instructions..."
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <FormActions
            onCancel={handleCloseForm}
            submitLabel={editingFollowUp ? 'Update Follow-up' : 'Schedule Follow-up'}
          />
        </form>
      </InlineForm>
    </div>
  );
};
