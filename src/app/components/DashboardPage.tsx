import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { dashboardService, followUpService, leadService } from '../services/dataService';
import type { DashboardStats, FollowUp } from '../types';
import { AlertCircle, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#10b981', '#64748b'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayFollowUps, setTodayFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboardStats = await dashboardService.getStats();
      setStats(dashboardStats);
      
      const followUps = await followUpService.getTodayFollowUps();
      setTodayFollowUps(followUps);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  if (!stats) {
    return <div className="p-8">Loading...</div>;
  }

  // Prepare chart data
  const statusData = Object.entries(stats.leadsByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  const sourceData = Object.entries(stats.leadsBySource).map(([name, value]) => ({
    name,
    value,
  }));

  const userLeadsData = Object.entries(stats.leadsByUser).map(([name, leads]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    leads,
  }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your leads and activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.totalLeads}</div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.activeLeads}</div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Converted Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{stats.convertedLeads}</div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Follow-ups Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.todayFollowUps}</div>
                {stats.overdueFollowUps > 0 && (
                  <div className="text-sm text-red-600 mt-1">
                    {stats.overdueFollowUps} overdue
                  </div>
                )}
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <CardDescription>Distribution of leads across different statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 py-8">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Leads by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 py-8">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leads by User */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Leads by User</CardTitle>
          <CardDescription>Lead distribution across team members</CardDescription>
        </CardHeader>
        <CardContent>
          {userLeadsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userLeadsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-slate-500 py-8">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Today's Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Follow-ups</CardTitle>
          <CardDescription>Follow-ups scheduled for today</CardDescription>
        </CardHeader>
        <CardContent>
          {todayFollowUps.length > 0 ? (
            <div className="space-y-3">
              {todayFollowUps.map(followUp => (
                <div
                  key={followUp.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">{followUp.leadName}</p>
                    <p className="text-sm text-slate-600">{followUp.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{followUp.dueTime}</p>
                    <p className="text-xs text-slate-500">{followUp.assignedToName}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              No follow-ups scheduled for today
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
