# How to Connect MongoDB Compass to the Correct Database

## 🎯 The Problem

Your MongoDB Compass is connected to a **different MongoDB instance** than your backend server.

- **Backend connects to:** MongoDB Atlas (`leadflow.ps1rzw1.mongodb.net`)
- **Compass is viewing:** Different instance (doesn't have `leadsflow` database)
- **Result:** You can't see Manohar Poojari in Compass

---

## ✅ The Solution

Connect MongoDB Compass to the **same MongoDB Atlas cluster** that your backend uses.

---

## 📋 Step-by-Step Instructions

### **Step 1: Get Your MongoDB Atlas Password**

You need the password for user: `manoharpoojari76_db_user`

**If you don't remember it:**

1. Go to: **https://cloud.mongodb.com/**
2. **Login** to your MongoDB Atlas account
3. Click **"Database Access"** in the left sidebar
4. Find user: **`manoharpoojari76_db_user`**
5. Click **"Edit"** button
6. Click **"Edit Password"**
7. Set a **new password** (e.g., `MyNewPassword123!`)
8. Click **"Update User"**
9. **Write down this password** - you'll need it!

---

### **Step 2: Open MongoDB Compass**

1. Open **MongoDB Compass** application
2. You should see your current connections
3. Click the **"New Connection"** button
   - Usually at the top left
   - Or in the connections sidebar

---

### **Step 3: Enter Connection String**

In the connection string field, paste:

```
mongodb+srv://manoharpoojari76_db_user:YOUR_PASSWORD_HERE@leadflow.ps1rzw1.mongodb.net/leadsflow
```

**IMPORTANT:** Replace `YOUR_PASSWORD_HERE` with the actual password from Step 1!

**Example:**
If your password is `MyNewPassword123!`, the connection string would be:
```
mongodb+srv://manoharpoojari76_db_user:MyNewPassword123!@leadflow.ps1rzw1.mongodb.net/leadsflow
```

---

### **Step 4: Connect**

1. Click the **"Connect"** button
2. Compass will connect to MongoDB Atlas
3. Wait a few seconds for the connection to establish

---

### **Step 5: Navigate to the Database**

1. In the **left sidebar**, you should now see databases
2. Look for: **`leadsflow`** (all lowercase)
3. Click on **`leadsflow`** to expand it
4. You should see collections like:
   - `users`
   - `leads`
   - `followups`
   - `activities`
   - etc.

---

### **Step 6: Open Users Collection**

1. Click on the **`users`** collection
2. You should see **3 documents**:

   **Document 1:**
   - _id: `6958fac7762c7195f0c9517e`
   - name: `Sujeet Karn`
   - role: `admin`

   **Document 2:** ← **This is Manohar!**
   - _id: `695b79b667c4a1775e5dd9f8`
   - name: `Manohar Poojari`
   - email: `manohar.poojari@erpca.com`
   - role: `manager`

   **Document 3:**
   - _id: `695b7fcd67c4a1775e5dda05`
   - name: `Test User`
   - role: `sales`

---

## 🎉 Success!

You should now see all 3 users including **Manohar Poojari** in MongoDB Compass!

---

## 🔍 Troubleshooting

### **Issue: "Authentication failed"**

**Solution:** Your password is incorrect
- Go back to MongoDB Atlas
- Reset the password for `manoharpoojari76_db_user`
- Try connecting again with the new password

---

### **Issue: "Connection timeout"**

**Solution:** Check your internet connection
- Make sure you're connected to the internet
- MongoDB Atlas is a cloud service and requires internet access
- Check if your firewall is blocking the connection

---

### **Issue: "Still don't see leadsflow database"**

**Solution:** Double-check the connection string
- Make sure you copied the entire connection string
- Verify the cluster name is: `leadflow.ps1rzw1.mongodb.net`
- Make sure there are no extra spaces or characters

---

### **Issue: "See leadsflow but users collection is empty"**

**Solution:** Click the Refresh button
- Click the circular arrow (refresh) icon
- Or press F5 on your keyboard
- The data should appear

---

## 📸 What You Should See

After successful connection:

```
MongoDB Compass
├── leadflow.ps1rzw1.mongodb.net (Connected)
    └── leadsflow
        ├── activities (0 documents)
        ├── followups (0 documents)
        ├── leads (0 documents)
        ├── leadstatuses (7 documents)
        ├── leadsources (7 documents)
        ├── notes (0 documents)
        ├── pipelinestages (7 documents)
        ├── systemsettings (1 document)
        └── users (3 documents) ← Click here!
```

---

## 🔐 Security Note

**Keep your MongoDB Atlas password secure!**
- Don't share it publicly
- Don't commit it to Git
- Store it in a password manager
- The backend uses an encrypted config file to store it securely

---

## ✅ Verification

After connecting, verify:
- ✅ Connection name shows: `leadflow.ps1rzw1.mongodb.net`
- ✅ Database `leadsflow` appears in left sidebar
- ✅ Collection `users` shows 3 documents
- ✅ You can see Manohar Poojari's document

---

**Need Help?** If you're still having issues, let me know:
1. What error message you see (if any)
2. What databases appear in the left sidebar
3. Screenshot of the connection screen

---

**Status:** Ready to connect! Follow the steps above. 🚀

