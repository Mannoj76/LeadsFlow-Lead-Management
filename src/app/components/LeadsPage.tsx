import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { InlineForm, FormActions } from './ui/inline-form';
import { Badge } from './ui/badge';
import { leadService, userService, sourceService, pipelineService } from '../services/dataService';
import type { Lead, User, LeadSource, PipelineStage, LeadType, LeadPriority } from '../types';
import { Plus, Search, Filter, Edit, Trash2, Phone, Mail, User as UserIcon, Eye, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { countryCodes, formatE164, parseE164 } from '../utils/phoneUtils';

interface LeadsPageProps {
  onViewLead?: (leadId: string) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ onViewLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+91',
    localPhone: '',
    email: '',
    source: '',
    status: '',
    assignedTo: '',
    leadType: 'individual' as LeadType,
    companyName: '',
    productInterest: '',
    priority: 'medium' as LeadPriority,
    initialNotes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, searchQuery, filterStatus, filterSource, filterUser]);

  const loadData = async () => {
    try {
      const [allLeads, allUsers, allSources, allStages] = await Promise.all([
        leadService.getAll(),
        userService.getAll(),
        sourceService.getAll(),
        pipelineService.getAll(),
      ]);

      setLeads(allLeads || []);
      setUsers((allUsers || []).filter(u => u.isActive));
      setSources(allSources || []);
      setStages(allStages || []);
    } catch (error) {
      console.error('Failed to load leads data:', error);
      // Set defaults if loading fails
      setLeads([]);
      setUsers([]);
      setSources([]);
      setStages([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        lead =>
          lead.name.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === filterStatus);
    }

    // Source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(lead => lead.source === filterSource);
    }

    // User filter
    if (filterUser !== 'all') {
      filtered = filtered.filter(lead => lead.assignedTo === filterUser);
    }

    setFilteredLeads(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      countryCode: '+91',
      localPhone: '',
      email: '',
      source: sources[0]?.name || '',
      status: stages[0]?.name || 'New',
      assignedTo: users[0]?.id || '',
      leadType: 'individual',
      companyName: '',
      productInterest: '',
      priority: 'medium',
      initialNotes: '',
    });
    setEditingLead(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    const { countryCode, localNumber } = parseE164(lead.phone);
    setFormData({
      name: lead.name,
      phone: lead.phone,
      countryCode: countryCode || '+91',
      localPhone: localNumber,
      email: lead.email || '',
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo,
      leadType: lead.leadType || 'individual',
      companyName: lead.companyName || '',
      productInterest: lead.productInterest || '',
      priority: lead.priority || 'medium',
      initialNotes: lead.initialNotes || '',
    });
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine country code and local phone
    const fullPhone = formatE164(formData.countryCode, formData.localPhone);

    // Validate required fields
    if (!formData.name || !formData.localPhone || !formData.source || !formData.status || !formData.assignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate phone pattern
    const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
    if (selectedCountry?.pattern && !new RegExp(selectedCountry.pattern).test(formData.localPhone.replace(/\D/g, ''))) {
      toast.error(`Invalid phone number format for ${selectedCountry.name}. Expected format: ${selectedCountry.placeholder}`);
      return;
    }

    // Validate phone uniqueness
    const existingLead = leads.find(
      (l) => l.phone === fullPhone && l.id !== editingLead?.id
    );
    if (existingLead) {
      toast.error('A lead with this phone number already exists');
      return;
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const assignedUser = users.find(u => u.id === formData.assignedTo);

    // Prepare lead data (exclude empty optional fields)
    const leadData: any = {
      name: formData.name,
      phone: fullPhone,
      source: formData.source,
      status: formData.status,
      assignedTo: formData.assignedTo,
      assignedToName: assignedUser?.name,
    };

    // Add optional fields only if they have values
    if (formData.email) leadData.email = formData.email;
    if (formData.leadType) leadData.leadType = formData.leadType;
    if (formData.companyName) leadData.companyName = formData.companyName;
    if (formData.productInterest) leadData.productInterest = formData.productInterest;
    if (formData.priority) leadData.priority = formData.priority;
    if (formData.initialNotes) leadData.initialNotes = formData.initialNotes;

    if (editingLead) {
      // Update existing lead
      leadService.update(editingLead.id, leadData);
      toast.success('Lead updated successfully');
    } else {
      // Create new lead (activity log entry is automatically created by leadService)
      leadService.create(leadData);
      toast.success('Lead created successfully');
    }

    handleCloseForm();
    loadData();
  };

  const handleDelete = (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      leadService.delete(lead.id);
      toast.success('Lead deleted successfully');
      loadData();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterSource('all');
    setFilterUser('all');
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
            <p className="text-slate-600 mt-1">Manage and track all your leads</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.name}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source.id} value={source.name}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || filterStatus !== 'all' || filterSource !== 'all' || filterUser !== 'all') && (
            <div className="mt-4">
              <Button variant="ghost" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>
            {filteredLeads.length} of {leads.length} leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLeads.length > 0 ? (
            <div className="space-y-3">
              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                        <Badge
                          style={{
                            backgroundColor: stages.find(s => s.name === lead.status)?.color + '20',
                            color: stages.find(s => s.name === lead.status)?.color,
                          }}
                        >
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {lead.assignedToName}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Source: {lead.source}</span>
                        <span>•</span>
                        <span>
                          Created: {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {onViewLead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewLead(lead.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(lead)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No leads found</p>
              <p className="text-sm text-slate-500 mt-1">
                Try adjusting your filters or create a new lead
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Inline Form */}
      <InlineForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingLead ? 'Edit Lead' : 'Create New Lead'}
        description={editingLead ? 'Update lead information' : 'Add a new lead to your sales pipeline'}
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
              {/* Lead Type */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="leadType" className="text-sm font-medium">Lead Type *</Label>
                  <span className="text-xs text-slate-500">Individual or Business?</span>
                </div>
                <Select
                  value={formData.leadType}
                  onValueChange={(value: LeadType) => setFormData({ ...formData, leadType: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business / Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Name */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="name" className="text-sm font-medium">Contact Name *</Label>
                  <span className="text-xs text-slate-500">Full name</span>
                </div>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-9"
                  required
                />
              </div>

              {/* Company Name (conditional - spans 2 columns when visible) */}
              {formData.leadType === 'business' && (
                <div className="md:col-span-2">
                  <div className="flex items-baseline justify-between mb-1">
                    <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                    <span className="text-xs text-slate-500">Business or organization name</span>
                  </div>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme Corporation"
                    className="h-9"
                  />
                </div>
              )}

              {/* Phone Number */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <span className="text-xs text-slate-500">Select country and enter local number</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
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
                      required
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Digits only. Combined: <span className="font-mono">{formData.countryCode}{formData.localPhone}</span>
                </p>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <span className="text-xs text-slate-500">Optional</span>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  className="h-9"
                />
              </div>

              {/* Lead Source */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="source" className="text-sm font-medium">Lead Source *</Label>
                  <span className="text-xs text-slate-500">How they found us</span>
                </div>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(source => (
                      <SelectItem key={source.id} value={source.name}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lead Status */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="status" className="text-sm font-medium">Lead Status *</Label>
                  <span className="text-xs text-slate-500">Pipeline stage</span>
                </div>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.name}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned User */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="assignedTo" className="text-sm font-medium">Assign To *</Label>
                  <span className="text-xs text-slate-500">Team member</span>
                </div>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.isActive).map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Level */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority Level</Label>
                  <span className="text-xs text-slate-500">Urgency</span>
                </div>
                <Select
                  value={formData.priority}
                  onValueChange={(value: LeadPriority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span>High Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span>Medium Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Low Priority</span>
                      </div>
                    </SelectItem>
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
              {/* Product Interest */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="productInterest" className="text-sm font-medium">Product/Service Interest</Label>
                  <span className="text-xs text-slate-500">What they want</span>
                </div>
                <Input
                  id="productInterest"
                  value={formData.productInterest}
                  onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                  placeholder="e.g., Premium Package, Consulting"
                  className="h-9"
                />
              </div>

              {/* Empty space for alignment - Priority moved to required section */}
              <div></div>

              {/* Initial Notes - Spans full width */}
              <div className="md:col-span-2">
                <div className="flex items-baseline justify-between mb-1">
                  <Label htmlFor="initialNotes" className="text-sm font-medium">Initial Notes</Label>
                  <span className="text-xs text-slate-500">Context or comments</span>
                </div>
                <textarea
                  id="initialNotes"
                  value={formData.initialNotes}
                  onChange={(e) => setFormData({ ...formData, initialNotes: e.target.value })}
                  placeholder="Add any initial comments or context about this lead..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>
          </div>

          <FormActions
            onCancel={handleCloseForm}
            submitLabel={editingLead ? 'Update Lead' : 'Create Lead'}
          />
        </form>
      </InlineForm>
    </div>
  );
};
