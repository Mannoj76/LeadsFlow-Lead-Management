import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { leadService, noteService, activityService, followUpService } from '../services/dataService';
import type { Lead, Note, Activity, FollowUp, FollowUpType, FollowUpStatus } from '../types';
import { ArrowLeft, Phone, Mail, User, Calendar, Clock, Plus, Trash2, Building, Tag, Flag, Info, MessageSquare, Video, Users, MapPin, Presentation, FileText, FileCheck, FileSignature, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { cn } from './ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface LeadDetailPageProps {
  leadId: string;
  onBack: () => void;
}

export const LeadDetailPage: React.FC<LeadDetailPageProps> = ({ leadId, onBack }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newFollowUp, setNewFollowUp] = useState({
    dueDate: '',
    dueTime: '09:00',
    notes: '',
    type: 'call' as FollowUpType,
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    try {
      const leadData = await leadService.getById(leadId);
      if (!leadData) {
        toast.error('Lead not found');
        onBack();
        return;
      }

      const [notes, activities, followUps] = await Promise.all([
        noteService.getByLeadId(leadId),
        activityService.getByLeadId(leadId),
        followUpService.getByLeadId(leadId),
      ]);

      setLead(leadData);
      setNotes(notes || []);
      setActivities(activities || []);
      setFollowUps(followUps || []);
    } catch (error) {
      console.error('Failed to load lead details:', error);
      toast.error('Failed to load lead details');
      onBack();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      await noteService.create({
        leadId,
        userId: currentUser?.id || '1',
        userName: currentUser?.name || 'Current User',
        content: newNote,
      });

      toast.success('Note added successfully');
      setNewNote('');
      loadData();
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await noteService.delete(noteId);
        toast.success('Note deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUp.dueDate || !newFollowUp.dueTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!lead) return;

    try {
      await followUpService.create({
        leadId,
        leadName: lead.name,
        userId: lead.assignedTo,
        assignedTo: lead.assignedTo,
        assignedToName: lead.assignedToName || '',
        dueDate: newFollowUp.dueDate,
        dueTime: newFollowUp.dueTime,
        notes: newFollowUp.notes,
        isCompleted: false,
        status: 'scheduled',
        followUpType: newFollowUp.type,
        createdBy: currentUser?.id || '1',
        createdByName: currentUser?.name || 'Current User'
      });

      toast.success('Follow-up scheduled successfully');
      setNewFollowUp({ dueDate: '', dueTime: '09:00', notes: '', type: 'call' });
      loadData();
    } catch (error) {
      toast.error('Failed to schedule follow-up');
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!lead) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Leads
      </Button>

      {/* Lead Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900">{lead.name}</h1>
                <Badge
                  style={{
                    backgroundColor: '#3b82f6' + '20',
                    color: '#3b82f6',
                  }}
                >
                  {lead.status}
                </Badge>
                {lead.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      lead.priority === 'high' ? "border-red-200 bg-red-50 text-red-700" :
                        lead.priority === 'medium' ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                          "border-green-200 bg-green-50 text-green-700"
                    )}
                  >
                    {lead.priority} Priority
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  {lead.leadType || 'Individual'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${lead.phone}`} className="hover:text-indigo-600">
                    {lead.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${lead.email}`} className="hover:text-indigo-600">
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4" />
                  {lead.assignedToName}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span>Source: {lead.source}</span>
                <span>•</span>
                <span>Created: {new Date(lead.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Updated: {new Date(lead.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Lead Details</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity ({activities.length})</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups ({followUps.length})</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-600" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">Full Name</Label>
                    <p className="font-medium text-slate-900">{lead.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">Email Address</Label>
                    <p className="font-medium text-slate-900">{lead.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">Phone Number</Label>
                    <p className="font-medium text-slate-900">{lead.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">Lead Type</Label>
                    <p className="font-medium text-slate-900 capitalize">{lead.leadType || 'Individual'}</p>
                  </div>
                  {lead.leadType === 'business' && (
                    <div className="space-y-1">
                      <Label className="text-slate-500 text-xs uppercase tracking-wider">Company Name</Label>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-400" />
                        <p className="font-medium text-slate-900">{lead.companyName || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-xs uppercase tracking-wider">Lead Source</Label>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-400" />
                      <p className="font-medium text-slate-900">{lead.source}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Label className="text-slate-500 text-xs uppercase tracking-wider mb-2 block">Initial Notes</Label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700 italic">
                    {lead.initialNotes || 'No initial notes provided.'}
                  </div>
                </div>

                {lead.customFields && Object.keys(lead.customFields).length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <Label className="text-slate-500 text-xs uppercase tracking-wider mb-3 block">Additional Fields</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(lead.customFields).map(([key, value]) => (
                        <div key={key} className="p-2 bg-slate-50/50 rounded-md border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">{key}</span>
                          <span className="text-sm font-medium text-slate-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-indigo-600" />
                    <CardTitle>Sales Context</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-xs tracking-wider uppercase">Product Interest</Label>
                    <p className="font-medium text-slate-900">{lead.productInterest || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-xs tracking-wider uppercase">Urgency / Priority</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        lead.priority === 'high' ? "bg-red-500" :
                          lead.priority === 'medium' ? "bg-yellow-500" : "bg-green-500"
                      )} />
                      <p className="font-medium text-slate-900 capitalize">{lead.priority || 'Medium'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-500 text-xs tracking-wider uppercase">Assigned Agent</Label>
                    <p className="font-medium text-slate-900">{lead.assignedToName}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Created On</span>
                    <span className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Last Updated</span>
                    <span className="font-medium">{new Date(lead.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Note */}
            <Card>
              <CardHeader>
                <CardTitle>Add Note</CardTitle>
                <CardDescription>Record important information about this lead</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-4">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your note..."
                    rows={5}
                  />
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Notes List */}
            <Card>
              <CardHeader>
                <CardTitle>All Notes</CardTitle>
                <CardDescription>Chronological note history</CardDescription>
              </CardHeader>
              <CardContent>
                {notes.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-xs text-slate-500">
                            {note.userName} • {formatDateTime(note.createdAt)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No notes yet. Add your first note above.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Chronological history of all lead activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-2 w-2 bg-indigo-600 rounded-full mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-900 capitalize">{activity.action}</span>
                          <span className="text-xs text-slate-500">{formatDateTime(activity.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-600">{activity.details}</p>
                        <p className="text-xs text-slate-500 mt-1">by {activity.userName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No activity recorded yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="followups">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Follow-up */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Follow-up</CardTitle>
                <CardDescription>Set a reminder for this lead</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFollowUp} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type" className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-indigo-600" />
                        Follow-up Action / Type *
                      </Label>
                      <Select
                        value={newFollowUp.type}
                        onValueChange={(value: FollowUpType) =>
                          setNewFollowUp({ ...newFollowUp, type: value })
                        }
                      >
                        <SelectTrigger id="type" className="h-10 border-slate-200">
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>Call</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="whatsapp">
                            <div className="flex items-center gap-2 text-green-600">
                              <MessageSquare className="h-4 w-4" />
                              <span>WhatsApp Follow-up</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="meeting-online">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Video className="h-4 w-4" />
                              <span>Online Meeting (GMeet/Zoom)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="meeting-in-person">
                            <div className="flex items-center gap-2 text-purple-600">
                              <Users className="h-4 w-4" />
                              <span>In-Person Meeting</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="site-visit">
                            <div className="flex items-center gap-2 text-orange-600">
                              <MapPin className="h-4 w-4" />
                              <span>Site Visit</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="product-demo">
                            <div className="flex items-center gap-2 text-amber-600">
                              <Presentation className="h-4 w-4" />
                              <span>Product Demo / Presentation</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="email-followup">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="h-4 w-4" />
                              <span>Email Follow-up</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="document-review">
                            <div className="flex items-center gap-2 text-indigo-600">
                              <FileText className="h-4 w-4" />
                              <span>Document Review</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="proposal-review">
                            <div className="flex items-center gap-2 text-cyan-600">
                              <FileCheck className="h-4 w-4" />
                              <span>Proposal Review</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="contract-discussion">
                            <div className="flex items-center gap-2 text-rose-600">
                              <FileSignature className="h-4 w-4" />
                              <span>Contract Discussion</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="payment-followup">
                            <div className="flex items-center gap-2 text-emerald-600">
                              <Banknote className="h-4 w-4" />
                              <span>Payment Follow-up</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="other">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Other</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dueDate" className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          Due Date *
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newFollowUp.dueDate}
                          onChange={(e) =>
                            setNewFollowUp({ ...newFollowUp, dueDate: e.target.value })
                          }
                          required
                          className="h-10 border-slate-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dueTime" className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-indigo-600" />
                          Due Time *
                        </Label>
                        <Input
                          id="dueTime"
                          type="time"
                          value={newFollowUp.dueTime}
                          onChange={(e) =>
                            setNewFollowUp({ ...newFollowUp, dueTime: e.target.value })
                          }
                          required
                          className="h-10 border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="followUpNotes" className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        Notes
                      </Label>
                      <Textarea
                        id="followUpNotes"
                        value={newFollowUp.notes}
                        onChange={(e) =>
                          setNewFollowUp({ ...newFollowUp, notes: e.target.value })
                        }
                        placeholder="What needs to be discussed?..."
                        rows={3}
                        className="border-slate-200 resize-none px-4 py-3"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Follow-up
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Follow-ups List */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Follow-ups</CardTitle>
                <CardDescription>Upcoming reminders for this lead</CardDescription>
              </CardHeader>
              <CardContent>
                {followUps.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {followUps.map((followUp) => (
                      <div
                        key={followUp.id}
                        className={`p-3 rounded-lg border ${followUp.isCompleted
                          ? 'bg-green-50 border-green-200'
                          : 'bg-slate-50 border-slate-200'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            {getFollowUpTypeIcon(followUp.followUpType)}
                            <span className="font-medium text-slate-900">
                              {getFollowUpTypeLabel(followUp.followUpType)}
                            </span>
                          </div>
                          {followUp.isCompleted ? (
                            <Badge className="bg-green-100 text-green-700">Completed</Badge>
                          ) : (
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                              {followUp.status || 'Scheduled'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(followUp.dueDate).toLocaleDateString()}</span>
                          <Clock className="h-3 w-3 ml-1" />
                          <span>{followUp.dueTime}</span>
                        </div>
                        <p className="text-sm text-slate-600">{followUp.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No follow-ups scheduled yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
