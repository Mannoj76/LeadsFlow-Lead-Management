# Create New Lead - Quick Reference Guide

## 🚀 Quick Start

**Time to Complete:** Under 2 minutes  
**Access:** Click "Add Lead" button on Leads page  
**Form Type:** Right-side slide-in panel

---

## ✅ Required Fields (Must Fill)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| **Lead Type** | Dropdown | Individual / Business | Determines if Company Name field appears |
| **Contact Name** | Text | John Doe | Full name of contact person |
| **Company Name** | Text | Acme Corp | Only if Lead Type = Business |
| **Phone Number** | Tel | +1 (555) 123-4567 | **Must be unique** - primary identifier |
| **Lead Source** | Dropdown | Website, Referral, etc. | How lead came to us |
| **Lead Status** | Dropdown | New, Hot, Warm, etc. | Current pipeline stage |
| **Assign To** | Dropdown | Select user | Active users only |

---

## 📋 Optional Fields (Nice to Have)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| **Email** | Email | john@example.com | Not used for login |
| **Product Interest** | Text | Premium Package | What they want to buy |
| **Priority** | Dropdown | High / Medium / Low | Urgency level (default: Medium) |
| **Initial Notes** | Textarea | "Called about pricing..." | Any context or comments |

---

## ⚠️ Validation Rules

### **Will Show Error If:**
- ❌ Any required field is empty
- ❌ Phone number already exists in system
- ❌ Email format is invalid (if provided)

### **Error Messages:**
```
"Please fill in all required fields"
"A lead with this phone number already exists"
"Please enter a valid email address"
```

---

## 🎯 Form Sections

### **Section 1: Required Information** (Orange header)
```
┌─────────────────────────────────────────┐
│ REQUIRED INFORMATION                    │
├─────────────────────────────────────────┤
│ Lead Type *          [Individual ▼]     │
│ Contact Name *       [John Doe      ]   │
│ Phone Number *       [+1 555-1234   ]   │
│ Lead Source *        [Website ▼]        │
│ Lead Status *        [New ▼]            │
│ Assign To *          [Jane Smith ▼]     │
└─────────────────────────────────────────┘
```

### **Section 2: Additional Information** (Purple header)
```
┌─────────────────────────────────────────┐
│ ADDITIONAL INFORMATION (OPTIONAL)       │
├─────────────────────────────────────────┤
│ Email Address        [john@example.com] │
│ Product Interest     [Premium Package ] │
│ Priority Level       [Medium ▼]         │
│ Initial Notes        [                ] │
│                      [                ] │
└─────────────────────────────────────────┘
```

---

## 🔄 Workflow

```
1. Click "Add Lead" button
   ↓
2. Form slides in from right
   ↓
3. Fill required fields (marked with *)
   ↓
4. Optionally fill additional fields
   ↓
5. Click "Create Lead"
   ↓
6. System validates input
   ↓
7. Lead saved + Activity log created
   ↓
8. Success toast appears
   ↓
9. Form closes + List refreshes
```

---

## 💡 Pro Tips

### **Speed Tips:**
- ✅ Use Tab key to move between fields quickly
- ✅ Required fields are at the top - fill these first
- ✅ Optional fields can be added later via Edit
- ✅ Default values are pre-selected (Status, Priority, Assigned User)

### **Data Quality Tips:**
- ✅ Always include phone number (it's the primary identifier)
- ✅ Use consistent phone format: +1 (555) 123-4567
- ✅ Select accurate Lead Source for better analytics
- ✅ Add initial notes to capture context while fresh

### **Lead Type Selection:**
- 👤 **Individual:** Personal contacts, consumers, freelancers
- 🏢 **Business:** Companies, organizations, B2B leads
  - When selected, Company Name field appears

### **Priority Levels:**
- 🔴 **High:** Urgent, hot leads, immediate follow-up needed
- 🟡 **Medium:** Standard leads, follow-up within 24-48 hours
- 🟢 **Low:** Long-term prospects, follow-up when convenient

---

## 🎨 Visual Indicators

### **Required Fields:**
- Marked with red asterisk (*)
- Must be filled before submission

### **Optional Fields:**
- No asterisk
- Can be left empty
- Can be added later via Edit

### **Conditional Fields:**
- **Company Name:** Only appears when Lead Type = Business
- Automatically hidden for Individual leads

### **Priority Colors:**
- 🔴 Red dot = High Priority
- 🟡 Yellow dot = Medium Priority
- 🟢 Green dot = Low Priority

---

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Tab** | Move to next field |
| **Shift + Tab** | Move to previous field |
| **Enter** | Submit form (when in text input) |
| **Esc** | Close form (cancel) |

---

## ✨ What Happens After Submit?

### **Automatically:**
1. ✅ Lead saved to database
2. ✅ Activity log entry created: "Lead created"
3. ✅ Lead appears in leads list
4. ✅ Assigned user can see the lead
5. ✅ Lead is ready for follow-up

### **You'll See:**
- ✅ Green success toast: "Lead created successfully"
- ✅ Form closes automatically
- ✅ Leads list refreshes
- ✅ New lead visible at top of list

---

## 🔍 Common Scenarios

### **Scenario 1: Individual Lead (Consumer)**
```
Lead Type: Individual
Contact Name: Sarah Johnson
Phone: +1 (555) 234-5678
Source: Website
Status: New
Assign To: John (Sales)
Email: sarah.j@gmail.com
Priority: Medium
```

### **Scenario 2: Business Lead (B2B)**
```
Lead Type: Business
Contact Name: Michael Chen
Company Name: Tech Solutions Inc.
Phone: +1 (555) 345-6789
Source: Referral
Status: Hot
Assign To: Jane (Manager)
Product Interest: Enterprise Package
Priority: High
Initial Notes: "Referred by existing client ABC Corp. Interested in 50-user license."
```

### **Scenario 3: Minimal Lead (Quick Capture)**
```
Lead Type: Individual
Contact Name: Alex Martinez
Phone: +1 (555) 456-7890
Source: Cold Call
Status: New
Assign To: Bob (Sales)
(All optional fields left empty - can be filled later)
```

---

## ❓ FAQ

**Q: Can I create a lead without an email?**  
A: Yes! Email is optional. Phone number is the primary identifier.

**Q: What if the phone number already exists?**  
A: You'll see an error. Each phone number must be unique. Check if the lead already exists.

**Q: Can I change the assigned user later?**  
A: Yes! Use the Edit button on the lead to reassign.

**Q: What happens to the initial notes?**  
A: They're saved with the lead and visible in the lead details page.

**Q: Can I add more information later?**  
A: Yes! Click Edit on the lead to add or update any field.

**Q: Is the activity log visible?**  
A: Yes! View the lead details page to see all activities including "Lead created".

---

## 🎯 Success Checklist

Before clicking "Create Lead", verify:
- [ ] Lead Type selected
- [ ] Contact Name filled
- [ ] Company Name filled (if Business)
- [ ] Phone Number filled (unique)
- [ ] Lead Source selected
- [ ] Lead Status selected
- [ ] User assigned
- [ ] Email format valid (if provided)

---

## 📞 Support

**Need Help?**
- Check the full documentation: `CREATE_LEAD_FORM_DOCUMENTATION.md`
- Contact your system administrator
- Review the visual diagrams for workflow understanding

---

**Last Updated:** 2026-01-03  
**Version:** 1.0

