import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { leadService, userService, sourceService, pipelineService } from '../services/dataService';
import { Upload, Download, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { countryCodes, formatE164, parseE164 } from '../utils/phoneUtils';

export const ImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const parseCSV = (text: string): string[][] => {
    // Handle both \n and \r\n line endings
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        toast.error('CSV file must contain headers and at least one data row');
        setIsProcessing(false);
        return;
      }

      const rawHeaders = rows[0];
      const headers = rawHeaders.map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      // Get system data for validation and lookup
      const [users, sources, stages, existingLeads] = await Promise.all([
        userService.getAll(),
        sourceService.getAll(),
        pipelineService.getAll(),
        leadService.getAll(),
      ]);

      const activeUsers = (users || []).filter(u => u.isActive);
      const defaultUser = activeUsers[0];
      const validSources = new Set((sources || []).map(s => s.name.toLowerCase()));
      const validStatuses = new Set((stages || []).map(s => s.name.toLowerCase()));

      // Column Indices Mapping
      const getIndex = (keywords: string[]) =>
        headers.findIndex(h => keywords.some(k => h.includes(k)));

      const typeIdx = getIndex(['type']);
      const nameIdx = getIndex(['contact', 'name']);
      const countryCodeIdx = getIndex(['country', 'code']);
      const phoneIdx = getIndex(['phone', 'mobile', 'number']);
      const emailIdx = getIndex(['email']);
      const sourceIdx = getIndex(['source']);
      const statusIdx = getIndex(['status', 'stage']);
      const assignedIdx = getIndex(['assigned', 'user', 'owner']);
      const priorityIdx = getIndex(['priority']);
      const productIdx = getIndex(['product', 'interest', 'service']);
      const notesIdx = getIndex(['note', 'comment', 'description']);
      const companyIdx = getIndex(['company']);

      // Check if critical columns are missing
      const missingRequired = [];
      if (nameIdx === -1) missingRequired.push('Contact Name');
      if (phoneIdx === -1) missingRequired.push('Phone Number');

      if (missingRequired.length > 0) {
        toast.error(`Missing required columns: ${missingRequired.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      const existingPhones = new Set(existingLeads.map(l => l.phone.replace(/\s+/g, '')));

      let successCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (row.length < 2) continue; // Skip empty rows

        const name = row[nameIdx]?.trim();
        let phoneRaw = row[phoneIdx]?.trim();
        let countryCode = countryCodeIdx !== -1 ? row[countryCodeIdx]?.trim() : '';

        // Handle case where country code is missing but phone might have it
        if (!countryCode && phoneRaw?.startsWith('+')) {
          const parsed = parseE164(phoneRaw);
          countryCode = parsed.countryCode;
          phoneRaw = parsed.localNumber;
        } else if (!countryCode) {
          countryCode = '+91'; // Default to India if totally missing
        }

        // Ensure country code starts with +
        if (countryCode && !countryCode.startsWith('+')) {
          countryCode = '+' + countryCode;
        }

        const fullPhone = formatE164(countryCode, phoneRaw || '');
        const cleanPhone = fullPhone.replace(/\s+/g, '');

        // Required Fields Basic Check
        if (!name || !phoneRaw) {
          errors.push(`Row ${i + 2}: Missing required fields (Name or Phone)`);
          skippedCount++;
          continue;
        }

        // Phone Uniqueness Check
        if (existingPhones.has(cleanPhone)) {
          errors.push(`Row ${i + 2}: Duplicate phone number (${fullPhone})`);
          skippedCount++;
          continue;
        }

        // Optional/Defaulted Fields
        const email = emailIdx !== -1 ? row[emailIdx]?.trim() : '';
        const rawType = typeIdx !== -1 ? row[typeIdx]?.trim().toLowerCase() : 'individual';
        const leadType = (rawType === 'business' || rawType === 'company') ? 'business' : 'individual';

        const rawSource = sourceIdx !== -1 ? row[sourceIdx]?.trim() : '';
        const source = validSources.has(rawSource.toLowerCase())
          ? sources.find(s => s.name.toLowerCase() === rawSource.toLowerCase())?.name
          : (sources[0]?.name || 'Other');

        const rawStatus = statusIdx !== -1 ? row[statusIdx]?.trim() : '';
        const status = validStatuses.has(rawStatus.toLowerCase())
          ? stages.find(s => s.name.toLowerCase() === rawStatus.toLowerCase())?.name
          : (stages[0]?.name || 'New Lead');

        // Assigned To Lookup
        const assignedVal = assignedIdx !== -1 ? row[assignedIdx]?.trim().toLowerCase() : '';
        let assignedUser = defaultUser;
        if (assignedVal) {
          const found = activeUsers.find(u =>
            u.name.toLowerCase() === assignedVal ||
            u.username.toLowerCase() === assignedVal ||
            u.email?.toLowerCase() === assignedVal
          );
          if (found) assignedUser = found;
        }

        // Priority Mapping
        const rawPriority = priorityIdx !== -1 ? row[priorityIdx]?.trim().toLowerCase() : 'medium';
        const priority = ['high', 'medium', 'low'].includes(rawPriority) ? rawPriority : 'medium';

        // Prepare object
        const leadData: any = {
          name,
          phone: fullPhone,
          email: email || undefined,
          leadType,
          source: source || 'Other',
          status: status || 'New Lead',
          assignedTo: assignedUser.id,
          assignedToName: assignedUser.name,
          priority,
          productInterest: productIdx !== -1 ? row[productIdx]?.trim() : undefined,
          initialNotes: notesIdx !== -1 ? row[notesIdx]?.trim() : undefined,
          companyName: companyIdx !== -1 ? row[companyIdx]?.trim() : undefined,
        };

        // Create lead
        try {
          await leadService.create(leadData);
          successCount++;
          existingPhones.add(cleanPhone);
        } catch (error) {
          errors.push(`Row ${i + 2}: Failed to save to database`);
          skippedCount++;
        }
      }

      setImportResult({
        success: successCount,
        skipped: skippedCount,
        errors,
      });

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} leads`);
      }

    } catch (error) {
      toast.error('Failed to process CSV file');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleCSV = () => {
    const headers = [
      'Lead Type',
      'Contact Name',
      'Country Code',
      'Phone Number',
      'Email Address',
      'Lead Source',
      'Lead Status',
      'Assigned To',
      'Priority Level',
      'Product Interest',
      'Initial Notes',
      'Company Name'
    ];

    const sampleData = [
      headers,
      ['Individual', 'John Doe', '+91', '9876543210', 'john@example.com', 'Website', 'New Lead', 'Admin', 'High', 'Premium Package', 'Interested in pricing', ''],
      ['Business', 'Jane Smith', '+1', '2015550123', 'jane@co.com', 'Referral', 'Contacted', 'Sales Team', 'Medium', 'Consulting', 'Referred by partner', 'Acme Corp'],
    ];

    const csvContent = sampleData.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Import Leads</h1>
        <p className="text-slate-600 mt-1">Bulk import leads from Excel/CSV accurately</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import Section */}
        <Card className="shadow-lg border-indigo-100">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select your prepared CSV file to begin the import process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
              <Upload className="h-10 w-10 text-indigo-400 mb-4" />
              <p className="text-sm font-medium text-slate-900">
                {file ? file.name : "Click to select or drag and drop"}
              </p>
              <p className="text-xs text-slate-500 mt-1">CSV files only (Max 5MB)</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-3"></span>
                  Processing Data...
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Start Bulk Import
                </span>
              )}
            </Button>

            {/* Import Result Summary */}
            {importResult && (
              <div className="mt-4 p-4 border rounded-lg bg-white space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-sm font-semibold text-slate-700">Import Summary</span>
                  <Badge variant="outline" className="font-mono">{file?.name}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{importResult.success}</div>
                    <div className="text-xs text-green-600 flex items-center font-medium">
                      <CheckCircle className="h-3 w-3 mr-1" /> Success
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <div className="text-2xl font-bold text-amber-700">{importResult.skipped}</div>
                    <div className="text-xs text-amber-600 flex items-center font-medium">
                      <AlertCircle className="h-3 w-3 mr-1" /> Skipped/Invalid
                    </div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-lg overflow-hidden">
                    <div className="bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">Validation Logs</div>
                    <ul className="p-3 text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 opacity-50">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Panel */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl">Import Instructions</CardTitle>
            <CardDescription>Ensure your CSV file matches the system structure exactly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 underline flex items-center">
                  Required Fields
                </h3>
                <ul className="text-xs text-slate-600 space-y-1 list-none">
                  <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-indigo-500" /> Lead Type (Individual/Business)</li>
                  <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-indigo-500" /> Contact Name</li>
                  <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-indigo-500" /> Country Code (+91, +1, etc.)</li>
                  <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-indigo-500" /> Phone Number (Local Number)</li>
                  <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-indigo-500" /> Lead Source</li>
                  <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-indigo-500" /> Lead Status</li>
                  <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-2 text-indigo-500" /> Assigned To</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 underline flex items-center">
                  Optional Fields
                </h3>
                <ul className="text-xs text-slate-600 space-y-1 list-none">
                  <li className="flex items-center"><Info className="h-3 w-3 mr-2 text-slate-400" /> Email Address</li>
                  <li className="flex items-center"><Info className="h-3 w-3 mr-2 text-slate-400" /> Priority (High/Medium/Low)</li>
                  <li className="flex items-center"><Info className="h-3 w-3 mr-2 text-slate-400" /> Product Interest</li>
                  <li className="flex items-center"><Info className="h-3 w-3 mr-2 text-slate-400" /> Initial Notes</li>
                  <li className="flex items-center"><Info className="h-3 w-3 mr-2 text-slate-400" /> Company Name</li>
                </ul>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 border border-indigo-100 rounded-lg">
              <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
                Data Mapping Rules
              </h3>
              <ul className="text-[11px] text-indigo-700 space-y-2">
                <li>• <strong>Uniqueness:</strong> Leads with phone numbers that already exist in the system will be automatically skipped to prevent duplicates.</li>
                <li>• <strong>User Assignment:</strong> Provide the Full Name or Username in 'Assigned To'. If not found, it defaults to the system administrator.</li>
                <li>• <strong>Lead Type:</strong> Use 'Individual' or 'Business'. Default is Individual.</li>
                <li>• <strong>Formatting:</strong> Use plain text. No formulas, emojis, or special symbols should be present in the file.</li>
              </ul>
            </div>

            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Official CSV Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Badge = ({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: string, className?: string }) => {
  const styles = variant === "outline"
    ? "border border-slate-200 text-slate-600 px-2 py-0.5"
    : "bg-indigo-100 text-indigo-700 px-2 py-0.5";
  return <span className={`text-[10px] rounded uppercase font-bold ${styles} ${className}`}>{children}</span>;
}

