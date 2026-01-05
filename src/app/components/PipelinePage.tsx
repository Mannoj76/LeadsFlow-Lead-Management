import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { leadService, pipelineService } from '../services/dataService';
import type { Lead, PipelineStage } from '../types';
import { Phone, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

interface LeadCardProps {
  lead: Lead;
  onViewLead?: (leadId: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onViewLead }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'LEAD',
    item: { id: lead.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-move transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => onViewLead?.(lead.id)}
    >
      <h4 className="font-semibold text-slate-900 mb-2">{lead.name}</h4>
      <div className="space-y-1 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3" />
          <span className="truncate">{lead.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3" />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-3 w-3" />
          <span className="truncate">{lead.assignedToName}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Source: {lead.source}
      </div>
    </div>
  );
};

interface StageColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onDrop: (leadId: string, newStatus: string) => void;
  onViewLead?: (leadId: string) => void;
}

const StageColumn: React.FC<StageColumnProps> = ({ stage, leads, onDrop, onViewLead }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'LEAD',
    drop: (item: { id: string }) => {
      onDrop(item.id, stage.name);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex-shrink-0 w-80 bg-slate-50 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : ''
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{stage.name}</h3>
          <Badge
            variant="secondary"
            style={{
              backgroundColor: stage.color + '20',
              color: stage.color,
            }}
          >
            {leads.length}
          </Badge>
        </div>
        <div
          className="h-1 rounded-full mt-2"
          style={{ backgroundColor: stage.color }}
        />
      </div>

      <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
        {leads.length > 0 ? (
          leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onViewLead={onViewLead} />
          ))
        ) : (
          <div className="text-center py-8 text-sm text-slate-400">
            No leads in this stage
          </div>
        )}
      </div>
    </div>
  );
};

interface PipelinePageProps {
  onViewLead?: (leadId: string) => void;
}

export const PipelinePage: React.FC<PipelinePageProps> = ({ onViewLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allLeads, allStages] = await Promise.all([
        leadService.getAll(),
        pipelineService.getAll(),
      ]);
      setLeads(allLeads || []);
      setStages(allStages || []);
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
      setLeads([]);
      setStages([]);
    }
  };

  const handleDrop = (leadId: string, newStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      leadService.update(leadId, { status: newStatus });
      toast.success(`Lead moved to ${newStatus}`);
      loadData();
    }
  };

  const getLeadsByStage = (stageName: string) => {
    return leads.filter(lead => lead.status === stageName);
  };

  const totalLeads = leads.length;
  const totalValue = stages.reduce((sum, stage) => {
    return sum + getLeadsByStage(stage.name).length;
  }, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Sales Pipeline</h1>
          <p className="text-slate-600 mt-1">
            Drag and drop leads between stages
          </p>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div>
              <span className="text-slate-600">Total Leads:</span>
              <span className="ml-2 font-semibold text-slate-900">{totalLeads}</span>
            </div>
            <div>
              <span className="text-slate-600">Pipeline Stages:</span>
              <span className="ml-2 font-semibold text-slate-900">{stages.length}</span>
            </div>
          </div>
        </div>

        {/* Pipeline Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {stages.map(stage => (
              <StageColumn
                key={stage.id}
                stage={stage}
                leads={getLeadsByStage(stage.name)}
                onDrop={handleDrop}
                onViewLead={onViewLead}
              />
            ))}
          </div>
        </div>

        {/* Pipeline Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {stages.map(stage => {
                const stageLeads = getLeadsByStage(stage.name);
                const percentage = totalLeads > 0 ? ((stageLeads.length / totalLeads) * 100).toFixed(1) : '0';
                
                return (
                  <div key={stage.id} className="text-center p-4 bg-slate-50 rounded-lg">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: stage.color }}
                    >
                      {stageLeads.length}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{stage.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
};
