import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { dashboardService } from '../services/dataService';
import type { DashboardStats } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Target, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#10b981', '#64748b'];

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const dashboardStats = await dashboardService.getStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      }
    };
    loadStats();
  }, []);

  if (!stats) {
    return <div className="p-8">Loading...</div>;
  }

  const statusData = Object.entries(stats.leadsByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  const sourceData = Object.entries(stats.leadsBySource).map(([name, value]) => ({
    name,
    value,
  }));

  const userLeadsData = Object.entries(stats.leadsByUser).map(([name, leads]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    leads,
  }));

  const conversionRate = stats.totalLeads > 0 
    ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">Insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
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
              <Activity className="h-8 w-8 text-blue-600" />
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
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Conversion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-slate-900">{conversionRate}%</div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <CardDescription>Current distribution of leads</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
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
            <CardDescription>Lead acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sourceData}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Leads by Team Member</CardTitle>
          <CardDescription>Lead ownership distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {userLeadsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={userLeadsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-slate-500 py-8">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Status Summary</CardTitle>
          <CardDescription>Detailed breakdown by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Count</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {statusData.map((item, index) => {
                  const percentage = stats.totalLeads > 0 
                    ? ((item.value / stats.totalLeads) * 100).toFixed(1)
                    : '0';
                  return (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {item.value}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-semibold">
                  <td className="py-3 px-4 text-slate-900">Total</td>
                  <td className="py-3 px-4 text-right text-slate-900">
                    {stats.totalLeads}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
