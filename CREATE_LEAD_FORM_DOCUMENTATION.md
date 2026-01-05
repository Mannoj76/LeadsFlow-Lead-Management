# Create New Lead Form - Documentation

## 🎯 Overview

The **Create New Lead** form is designed for internal sales teams to quickly capture and classify leads for follow-up workflow. The form is optimized for speed (under 2 minutes to complete) while ensuring data consistency and quality.

---

## 📋 Form Structure

The form is divided into two sections:

### **1. Required Information** (Must be filled)
- Lead Type
- Contact Name
- Company Name (conditional - only for business leads)
- Phone Number
- Lead Source
- Lead Status
- Assigned User

### **2. Additional Information** (Optional)
- Email Address
- Product/Service Interest
- Priority Level
- Initial Notes

---

## 📝 Field Specifications

### **REQUIRED FIELDS**

#### **1. Lead Type** ⭐
- **Type:** Dropdown
- **Options:** 
  - Individual
  - Business / Company
- **Default:** Individual
- **Purpose:** Determines if this is a personal contact or business contact
- **Behavior:** When "Business" is selected, the Company Name field appears

#### **2. Contact Name** ⭐
- **Type:** Text input
- **Validation:** Required, any text
- **Placeholder:** "John Doe"
- **Help Text:** "Full name of the contact person"
- **Purpose:** Primary contact person's name

#### **3. Company Name** (Conditional)
- **Type:** Text input
- **Visibility:** Only shown when Lead Type = "Business"
- **Validation:** Optional when visible
- **Placeholder:** "Acme Corporation"
- **Help Text:** "Name of the business or organization"
- **Purpose:** Business/organization name for B2B leads

#### **4. Phone Number** ⭐
- **Type:** Tel input
- **Validation:** 
  - Required
  - Must be unique (no duplicates allowed)
- **Placeholder:** "+1 (555) 123-4567"
- **Help Text:** "Primary contact number. Must be unique."
- **Purpose:** Primary identifier for the lead
- **Error Messages:**
  - "Please fill in all required fields" (if empty)
  - "A lead with this phone number already exists" (if duplicate)

#### **5. Lead Source** ⭐
- **Type:** Dropdown
- **Options:** Dynamically loaded from system settings
  - Website
  - Referral
  - Social Media
  - Email Campaign
  - Cold Call
  - Walk-in
  - Other
- **Validation:** Required
- **Help Text:** "How did this lead come to us?"
- **Purpose:** Track lead origin for analytics

#### **6. Lead Status** ⭐
- **Type:** Dropdown
- **Options:** Dynamically loaded from pipeline stages
  - New
  - In Progress
  - Hot
  - Warm
  - Cold
  - Converted
  - Lost
- **Default:** "New"
- **Validation:** Required
- **Help Text:** "Current stage in the sales pipeline"
- **Purpose:** Track lead progress through sales funnel

#### **7. Assign To** ⭐
- **Type:** Dropdown
- **Options:** Active users only (filtered by isActive = true)
- **Display Format:** "User Name (role)"
- **Validation:** Required
- **Help Text:** "Which team member will handle this lead?"
- **Purpose:** Assign responsibility for follow-up

---

### **OPTIONAL FIELDS**

#### **8. Email Address**
- **Type:** Email input
- **Validation:** 
  - Optional
  - Must be valid email format if provided
- **Placeholder:** "john.doe@example.com"
- **Help Text:** "Optional. Not used for authentication."
- **Purpose:** Secondary contact method
- **Error Message:** "Please enter a valid email address" (if invalid format)

#### **9. Product/Service Interest**
- **Type:** Text input
- **Validation:** Optional
- **Placeholder:** "e.g., Premium Package, Consulting Services"
- **Help Text:** "What product or service are they interested in?"
- **Purpose:** Track what the lead is interested in purchasing

#### **10. Priority Level**
- **Type:** Dropdown with visual indicators
- **Options:**
  - 🔴 High Priority
  - 🟡 Medium Priority
  - 🟢 Low Priority
- **Default:** Medium
- **Validation:** Optional
- **Help Text:** "How urgent is this lead?"
- **Purpose:** Help prioritize follow-up actions

#### **11. Initial Notes**
- **Type:** Textarea (4 rows)
- **Validation:** Optional
- **Placeholder:** "Add any initial comments or context about this lead..."
- **Help Text:** "Any additional context or notes about this lead"
- **Purpose:** Capture important context during initial contact

---

## ✅ Validation Rules

### **On Submit:**

1. **Required Field Check:**
   ```
   ✓ Lead Type must be selected
   ✓ Contact Name must be filled
   ✓ Phone Number must be filled
   ✓ Lead Source must be selected
   ✓ Lead Status must be selected
   ✓ Assigned User must be selected
   ```

2. **Phone Uniqueness Check:**
   ```
   ✓ Phone number must not exist in the system
   ✓ Exception: When editing, allow same phone for current lead
   ```

3. **Email Format Check:**
   ```
   ✓ If email is provided, must be valid format (user@domain.com)
   ✓ If email is empty, skip validation
   ```

### **Error Messages:**

| Validation | Error Message |
|------------|---------------|
| Missing required fields | "Please fill in all required fields" |
| Duplicate phone | "A lead with this phone number already exists" |
| Invalid email format | "Please enter a valid email address" |

---

## 🎨 UI/UX Features

### **Form Layout:**
- ✅ Right-side slide-in panel (InlineForm component)
- ✅ Two-section layout with clear visual separation
- ✅ Section headers: "Required Information" and "Additional Information (Optional)"
- ✅ Border separator between sections
- ✅ Consistent spacing (space-y-4)

### **Field Design:**
- ✅ Clear labels with asterisk (*) for required fields
- ✅ Help text below each field (text-xs text-slate-500)
- ✅ Placeholder text for guidance
- ✅ Auto-focus on first input field when form opens
- ✅ Responsive design (mobile + desktop)

### **Visual Indicators:**
- ✅ Priority levels with colored dots (red, yellow, green)
- ✅ User role displayed in assignment dropdown
- ✅ Conditional field visibility (Company Name)

### **User Experience:**
- ✅ Fast to fill (under 2 minutes)
- ✅ Logical field ordering (most important first)
- ✅ Clear section separation
- ✅ Helpful placeholder text
- ✅ Inline validation feedback

---

## 🔄 Form Behavior

### **On Open (Create Mode):**
1. Form slides in from right
2. Title: "Create New Lead"
3. Description: "Add a new lead to your sales pipeline"
4. All fields reset to defaults:
   - Lead Type: "individual"
   - Priority: "medium"
   - Status: "New" (or first pipeline stage)
   - Source: First available source
   - Assigned To: First active user
5. Auto-focus on Lead Type dropdown

### **On Open (Edit Mode):**
1. Form slides in from right
2. Title: "Edit Lead"
3. Description: "Update lead information"
4. All fields populated with existing lead data
5. Optional fields show empty if not previously set

### **On Submit (Success):**
1. Validate all fields
2. Create/update lead in database
3. **Automatically create activity log entry:** "Lead created" (for new leads)
4. Show success toast: "Lead created successfully" or "Lead updated successfully"
5. Close form panel
6. Refresh leads list to show new/updated lead
7. Focus returns to leads table

### **On Cancel:**
1. Close form panel
2. Reset all fields
3. No data saved
4. Focus returns to leads table

---

## 📊 Data Flow

```
User fills form
    ↓
Click "Create Lead"
    ↓
Validate required fields
    ↓
Check phone uniqueness
    ↓
Validate email format (if provided)
    ↓
Prepare lead data object
    ↓
Call leadService.create()
    ↓
leadService automatically creates activity log entry
    ↓
Show success toast
    ↓
Close form & refresh list
```

---

## 🔐 Data Storage

### **Lead Object Structure:**
```typescript
{
  id: string;                    // Auto-generated
  name: string;                  // Required
  phone: string;                 // Required, unique
  email?: string;                // Optional
  source: string;                // Required
  status: string;                // Required
  assignedTo: string;            // Required (user ID)
  assignedToName?: string;       // Auto-populated
  leadType?: 'individual' | 'business';
  companyName?: string;
  productInterest?: string;
  priority?: 'high' | 'medium' | 'low';
  initialNotes?: string;
  createdAt: string;             // Auto-generated
  updatedAt: string;             // Auto-generated
}
```

### **Activity Log Entry (Auto-created):**
```typescript
{
  id: string;                    // Auto-generated
  leadId: string;                // New lead ID
  userId: '1';                   // System user
  userName: 'System';
  action: 'created';
  details: 'Lead created';
  createdAt: string;             // Auto-generated
}
```

---

## 🎯 Success Criteria

A successful lead creation includes:
- ✅ All required fields filled correctly
- ✅ Phone number is unique
- ✅ Email format is valid (if provided)
- ✅ Lead saved to database
- ✅ Activity log entry created automatically
- ✅ Success toast displayed
- ✅ Form closed
- ✅ Leads list refreshed
- ✅ New lead visible in list

---

## 📱 Responsive Design

### **Desktop (≥768px):**
- Form panel: 500px width
- Slides in from right
- Backdrop overlay

### **Mobile (<768px):**
- Form panel: Full width
- Slides in from right
- Backdrop overlay
- Touch-friendly input sizes

---

## ⚡ Performance

- **Target Time:** Under 2 minutes to complete
- **Auto-focus:** First field focused on open
- **Validation:** Real-time feedback
- **Submit:** Instant response with toast notification

---

## 🚀 Future Enhancements (Not Included)

The following features are **NOT** included as per requirements:
- ❌ Marketing automation
- ❌ Campaign tracking
- ❌ Email/WhatsApp/SMS communication
- ❌ Consent checkboxes or GDPR compliance
- ❌ External integrations
- ❌ Social media handles
- ❌ Lead scoring algorithms
- ❌ Email verification or OTP

---

**Last Updated:** 2026-01-03

