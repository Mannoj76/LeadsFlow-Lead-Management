import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  settingsService,
  sourceService,
  pipelineService,
  statusService,
} from '../services/dataService';
import type { SystemSettings, LeadSource, PipelineStage, LeadStatus } from '../types';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { InlineForm, FormActions } from './ui/inline-form';

export const SettingsPage: React.FC = () => {
  // Company Settings
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'UTC',
  });

  // Sources
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [isSourceFormOpen, setIsSourceFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [sourceName, setSourceName] = useState('');

  // Pipeline Stages
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [stageForm, setStageForm] = useState({ name: '', color: '#3b82f6' });

  // Statuses
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<LeadStatus | null>(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#3b82f6' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settings, sources, stages, statuses] = await Promise.all([
        settingsService.get(),
        sourceService.getAll(),
        pipelineService.getAll(),
        statusService.getAll(),
      ]);
      setSettings(settings);
      setSources(sources || []);
      setStages(stages || []);
      setStatuses(statuses || []);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Set defaults if loading fails
      setSources([]);
      setStages([]);
      setStatuses([]);
    }
  };

  // Company Settings Handlers
  const handleSaveSettings = () => {
    settingsService.update(settings);
    toast.success('Settings saved successfully');
  };

  // Source Handlers
  const handleAddSource = () => {
    setSourceName('');
    setEditingSource(null);
    setIsSourceFormOpen(true);
  };

  const handleEditSource = (source: LeadSource) => {
    setSourceName(source.name);
    setEditingSource(source);
    setIsSourceFormOpen(true);
  };

  const handleCloseSourceForm = () => {
    setIsSourceFormOpen(false);
    setSourceName('');
    setEditingSource(null);
  };

  const handleSaveSource = () => {
    if (!sourceName.trim()) {
      toast.error('Please enter a source name');
      return;
    }

    if (editingSource) {
      sourceService.update(editingSource.id, { name: sourceName });
      toast.success('Source updated successfully');
    } else {
      sourceService.create({ name: sourceName });
      toast.success('Source created successfully');
    }

    handleCloseSourceForm();
    loadData();
  };

  const handleDeleteSource = (source: LeadSource) => {
    if (window.confirm(`Are you sure you want to delete "${source.name}"?`)) {
      sourceService.delete(source.id);
      toast.success('Source deleted successfully');
      loadData();
    }
  };

  // Stage Handlers
  const handleAddStage = () => {
    const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) : 0;
    setStageForm({ name: '', color: '#3b82f6' });
    setEditingStage(null);
    setIsStageFormOpen(true);
  };

  const handleEditStage = (stage: PipelineStage) => {
    setStageForm({ name: stage.name, color: stage.color });
    setEditingStage(stage);
    setIsStageFormOpen(true);
  };

  const handleCloseStageForm = () => {
    setIsStageFormOpen(false);
    setStageForm({ name: '', color: '#3b82f6' });
    setEditingStage(null);
  };

  const handleSaveStage = () => {
    if (!stageForm.name.trim()) {
      toast.error('Please enter a stage name');
      return;
    }

    if (editingStage) {
      pipelineService.update(editingStage.id, stageForm);
      toast.success('Stage updated successfully');
    } else {
      const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) : 0;
      pipelineService.create({ ...stageForm, order: maxOrder + 1 });
      toast.success('Stage created successfully');
    }

    handleCloseStageForm();
    loadData();
  };

  const handleDeleteStage = (stage: PipelineStage) => {
    if (window.confirm(`Are you sure you want to delete "${stage.name}"?`)) {
      pipelineService.delete(stage.id);
      toast.success('Stage deleted successfully');
      loadData();
    }
  };

  // Status Handlers
  const handleAddStatus = () => {
    setStatusForm({ name: '', color: '#3b82f6' });
    setEditingStatus(null);
    setIsStatusFormOpen(true);
  };

  const handleEditStatus = (status: LeadStatus) => {
    setStatusForm({ name: status.name, color: status.color });
    setEditingStatus(status);
    setIsStatusFormOpen(true);
  };

  const handleCloseStatusForm = () => {
    setIsStatusFormOpen(false);
    setStatusForm({ name: '', color: '#3b82f6' });
    setEditingStatus(null);
  };

  const handleSaveStatus = () => {
    if (!statusForm.name.trim()) {
      toast.error('Please enter a status name');
      return;
    }

    if (editingStatus) {
      statusService.update(editingStatus.id, statusForm);
      toast.success('Status updated successfully');
    } else {
      statusService.create(statusForm);
      toast.success('Status created successfully');
    }

    handleCloseStatusForm();
    loadData();
  };

  const handleDeleteStatus = (status: LeadStatus) => {
    if (window.confirm(`Are you sure you want to delete "${status.name}"?`)) {
      statusService.delete(status.id);
      toast.success('Status deleted successfully');
      loadData();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Configure your CRM system</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="stages">Pipeline Stages</TabsTrigger>
          <TabsTrigger value="statuses">Lead Statuses</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) =>
                      setSettings({ ...settings, companyName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, companyEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyPhone}
                    onChange={(e) =>
                      setSettings({ ...settings, companyPhone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Input
                    id="dateFormat"
                    value={settings.dateFormat}
                    onChange={(e) =>
                      setSettings({ ...settings, dateFormat: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Sources */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Manage where your leads come from</CardDescription>
                </div>
                <Button onClick={handleAddSource} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <span className="text-slate-900">{source.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSource(source)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSource(source)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Stages */}
        <TabsContent value="stages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pipeline Stages</CardTitle>
                  <CardDescription>Configure your sales pipeline stages</CardDescription>
                </div>
                <Button onClick={handleAddStage} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-slate-900">{stage.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStage(stage)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStage(stage)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Statuses */}
        <TabsContent value="statuses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Statuses</CardTitle>
                  <CardDescription>Define lead status types</CardDescription>
                </div>
                <Button onClick={handleAddStatus} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Status
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        style={{
                          backgroundColor: status.color + '20',
                          color: status.color,
                        }}
                      >
                        {status.name}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStatus(status)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStatus(status)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Source Inline Form */}
      <InlineForm
        isOpen={isSourceFormOpen}
        onClose={handleCloseSourceForm}
        title={editingSource ? 'Edit Source' : 'Add Source'}
        description={editingSource ? 'Update the source name' : 'Create a new lead source'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="sourceName">Source Name</Label>
            <Input
              id="sourceName"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g., LinkedIn, Trade Show"
            />
          </div>
          <FormActions
            onCancel={handleCloseSourceForm}
            onSubmit={handleSaveSource}
            submitLabel={editingSource ? 'Update' : 'Create'}
          />
        </div>
      </InlineForm>

      {/* Stage Inline Form */}
      <InlineForm
        isOpen={isStageFormOpen}
        onClose={handleCloseStageForm}
        title={editingStage ? 'Edit Stage' : 'Add Stage'}
        description={editingStage ? 'Update the pipeline stage' : 'Create a new pipeline stage'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="stageName">Stage Name</Label>
            <Input
              id="stageName"
              value={stageForm.name}
              onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
              placeholder="e.g., Discovery Call"
            />
          </div>
          <div>
            <Label htmlFor="stageColor">Stage Color</Label>
            <Input
              id="stageColor"
              type="color"
              value={stageForm.color}
              onChange={(e) => setStageForm({ ...stageForm, color: e.target.value })}
            />
          </div>
          <FormActions
            onCancel={handleCloseStageForm}
            onSubmit={handleSaveStage}
            submitLabel={editingStage ? 'Update' : 'Create'}
          />
        </div>
      </InlineForm>

      {/* Status Inline Form */}
      <InlineForm
        isOpen={isStatusFormOpen}
        onClose={handleCloseStatusForm}
        title={editingStatus ? 'Edit Status' : 'Add Status'}
        description={editingStatus ? 'Update the lead status' : 'Create a new lead status'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="statusName">Status Name</Label>
            <Input
              id="statusName"
              value={statusForm.name}
              onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
              placeholder="e.g., Follow-up Needed"
            />
          </div>
          <div>
            <Label htmlFor="statusColor">Status Color</Label>
            <Input
              id="statusColor"
              type="color"
              value={statusForm.color}
              onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
            />
          </div>
          <FormActions
            onCancel={handleCloseStatusForm}
            onSubmit={handleSaveStatus}
            submitLabel={editingStatus ? 'Update' : 'Create'}
          />
        </div>
      </InlineForm>
    </div>
  );
};
