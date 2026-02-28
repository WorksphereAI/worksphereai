# 🚀 WorkSphere AI - Test Users Creation Guide

This guide explains how to create comprehensive test users for the WorkSphere AI platform to thoroughly test all features and user types.

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Test User Types](#test-user-types)
4. [Setup Instructions](#setup-instructions)
5. [Execution Steps](#execution-steps)
6. [Test Credentials](#test-credentials)
7. [Testing Scenarios](#testing-scenarios)
8. [Troubleshooting](#troubleshooting)

## 🎯 **Overview**

The WorkSphere AI test users system provides:

- **10 Organizations** across 4 East African countries
- **16 Test Users** covering all roles and user types
- **Multiple Subscription Plans** (Starter, Professional, Enterprise)
- **Various Subscription Statuses** (Active, Trial, Past Due, Canceled)
- **Sample Data** for testing all platform features

## 🔧 **Prerequisites**

### **Environment Setup**

1. **Install required dependencies**:
   ```bash
   npm install @supabase/supabase-js dotenv uuid
   ```

2. **Set environment variables** in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Database schema must be installed**:
   ```bash
   # Run the main schema first
   psql -d your_database -f database/schema.sql
   psql -d your_database -f database/schema-signup-system.sql
   ```

## 👥 **Test User Types**

### **Enterprise Organizations**

| Organization | Country | Industry | Size | Plan | Status |
|--------------|---------|----------|------|------|--------|
| Rwanda Development Board | Rwanda | Government | 500 | Enterprise | Active |
| Bank of Kigali | Rwanda | Finance | 1,200 | Enterprise | Active |
| Safaricom Kenya | Kenya | Telecom | 2,500 | Enterprise | Active |
| Vodacom Tanzania | Tanzania | Telecom | 1,100 | Enterprise | Past Due |
| Kigali Heights Mall | Rwanda | Real Estate | 150 | Professional | Canceled |

### **SMB Organizations**

| Organization | Country | Industry | Size | Plan | Status |
|--------------|---------|----------|------|------|--------|
| MTN Rwanda | Rwanda | Telecom | 800 | Professional | Active |
| Equity Bank Kenya | Kenya | Finance | 1,800 | Professional | Active |
| MTN Uganda | Uganda | Telecom | 950 | Professional | Active |

### **Small Organizations**

| Organization | Country | Industry | Size | Plan | Status |
|--------------|---------|----------|------|------|--------|
| Kigali Tech Solutions | Rwanda | Technology | 12 | Starter | Trial |
| Kigali Digital Agency | Rwanda | Marketing | 8 | Starter | Trial |

## 🚀 **Setup Instructions**

### **Step 1: Install Dependencies**

```bash
cd d:/Apps/Workspehere
npm install @supabase/supabase-js dotenv uuid
```

### **Step 2: Configure Environment**

Create or update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Step 3: Run Database Setup**

```bash
# First, create organizations and sample data
psql -d your_database -f database/test-users-creation.sql
```

## 📝 **Execution Steps**

### **Option 1: Run the Node.js Script**

```bash
# From the project root
node scripts/create-test-users.js
```

### **Option 2: Run as npm Script**

Add to your `package.json`:
```json
{
  "scripts": {
    "create-test-users": "node scripts/create-test-users.js"
  }
}
```

Then run:
```bash
npm run create-test-users
```

### **Expected Output**

```
🚀 Starting test user creation...

✅ Database connection successful
✅ Found 10 organizations

Creating user: ceo@rdb.rw...
✅ Created user: ceo@rdb.rw (ceo)
Creating user: admin@rdb.rw...
✅ Created user: admin@rdb.rw (admin)
...

📊 Summary: 16 users created, 0 failures

🔑 All passwords: Test@123456 (except admin@worksphere.ai: Admin@123456)

📋 Created User Credentials:

CEO:
  - ceo@rdb.rw | John Mugabo | rdb-rwanda
  - ceo@bk.rw | Marie Uwase | bk-rwanda
  - ceo@safaricom.co.ke | Peter Njoroge | safaricom-ke

ADMIN:
  - admin@rdb.rw | Jean Paul | rdb-rwanda
  - admin@bk.rw | Diane Uwamahoro | bk-rwanda
  - admin@safaricom.co.ke | James Mwangi | safaricom-ke
  - admin@worksphere.ai | System Administrator | Individual

MANAGER:
  - manager@rdb.rw | Alice Mukamana | rdb-rwanda
  - manager@bk.rw | Eric Habimana | bk-rwanda
  - manager@mtn.co.rw | Grace Uwase | mtn-rwanda

EMPLOYEE:
  - employee1@rdb.rw | Patrick Ndayishimiye | rdb-rwanda
  - employee2@rdb.rw | Claudine Uwase | rdb-rwanda
  - employee1@bk.rw | Emmanuel Ndayisaba | bk-rwanda
  - employee1@safaricom.co.ke | Lucy Wanjiku | safaricom-ke
  - freelancer@example.com | Sarah Johnson | Individual
  - consultant@example.com | David Murenzi | Individual

CUSTOMER:
  - customer1@company.com | John Customer | Individual
  - customer2@company.com | Jane Client | Individual

📄 Credentials saved to: test-user-credentials.md
```

## 🔐 **Test Credentials**

### **Universal Password**
- **All users**: `Test@123456`
- **Platform admin**: `Admin@123456`

### **Enterprise CEOs**
| Email | Name | Organization | Password |
|-------|------|--------------|----------|
| ceo@rdb.rw | John Mugabo | Rwanda Development Board | Test@123456 |
| ceo@bk.rw | Marie Uwase | Bank of Kigali | Test@123456 |
| ceo@safaricom.co.ke | Peter Njoroge | Safaricom Kenya | Test@123456 |

### **Admins**
| Email | Name | Organization | Password |
|-------|------|--------------|----------|
| admin@rdb.rw | Jean Paul | Rwanda Development Board | Test@123456 |
| admin@bk.rw | Diane Uwamahoro | Bank of Kigali | Test@123456 |
| admin@safaricom.co.ke | James Mwangi | Safaricom Kenya | Test@123456 |
| admin@worksphere.ai | System Administrator | Platform | Admin@123456 |

### **Managers**
| Email | Name | Organization | Password |
|-------|------|--------------|----------|
| manager@rdb.rw | Alice Mukamana | Rwanda Development Board | Test@123456 |
| manager@bk.rw | Eric Habimana | Bank of Kigali | Test@123456 |
| manager@mtn.co.rw | Grace Uwase | MTN Rwanda | Test@123456 |

### **Employees**
| Email | Name | Organization | Password |
|-------|------|--------------|----------|
| employee1@rdb.rw | Patrick Ndayishimiye | Rwanda Development Board | Test@123456 |
| employee2@rdb.rw | Claudine Uwase | Rwanda Development Board | Test@123456 |
| employee1@bk.rw | Emmanuel Ndayisaba | Bank of Kigali | Test@123456 |
| employee1@safaricom.co.ke | Lucy Wanjiku | Safaricom Kenya | Test@123456 |

### **Individual Users**
| Email | Name | Type | Password |
|-------|------|------|----------|
| freelancer@example.com | Sarah Johnson | Freelancer | Test@123456 |
| consultant@example.com | David Murenzi | Consultant | Test@123456 |

### **Customer Portal Users**
| Email | Name | Type | Password |
|-------|------|------|----------|
| customer1@company.com | John Customer | Client | Test@123456 |
| customer2@company.com | Jane Client | Partner | Test@123456 |

## 🧪 **Testing Scenarios**

### **1. Authentication Testing**

```bash
# Test different user types
http://localhost:5173/login
# Login with: ceo@rdb.rw / Test@123456

http://localhost:5173/signup
# Test new signup flows
```

### **2. Role-Based Access Testing**

| Role | Test Scenarios |
|------|----------------|
| **CEO** | Full organization access, billing, admin settings |
| **Admin** | User management, organization settings, reports |
| **Manager** | Team management, task assignment, approvals |
| **Employee** | Basic tasks, messaging, limited access |
| **Customer** | Customer portal, invoices, support tickets |
| **Platform Admin** | Cross-organization access, system settings |

### **3. Subscription Testing**

| Organization | Plan | Status | Test Scenarios |
|--------------|------|--------|----------------|
| RDB | Enterprise | Active | Full features, no limits |
| Kigali Tech | Starter | Trial | Limited features, trial warnings |
| Vodacom TZ | Enterprise | Past Due | Restricted access, payment reminders |
| Kigali Heights | Professional | Canceled | Read-only access, cancellation notice |

### **4. Feature Testing**

| Feature | Test Users | Expected Behavior |
|---------|------------|------------------|
| **Dashboard** | All users | Role-appropriate widgets |
| **Messaging** | Employees, Managers | Send/receive messages |
| **Tasks** | Managers, Employees | Create/assign/complete tasks |
| **Approvals** | Managers, Admins | Request/approve workflows |
| **Analytics** | Admins, CEOs | Organization reports |
| **Billing** | CEOs, Admins | Subscription management |
| **Customer Portal** | Customer users | Invoices, support tickets |

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Database Connection Failed**
```
❌ Database connection failed: JWT expired
```
**Solution**: Check your `SUPABASE_SERVICE_ROLE_KEY` is valid and not expired.

#### **2. User Already Exists**
```
⚠️  user@example.com already exists, skipping...
```
**Solution**: This is normal - the script skips existing users.

#### **3. Permission Denied**
```
❌ Failed to create auth user: permission_denied
```
**Solution**: Ensure your service role key has admin privileges.

#### **4. Organization Not Found**
```
❌ Failed to insert user: null value in organization_id
```
**Solution**: Run the SQL script first to create organizations.

### **Debug Mode**

Add debug logging to the script:
```javascript
// In create-test-users.js, add this line
console.log('Debug:', { supabaseUrl, orgMap });
```

### **Reset Test Data**

To delete all test users and start fresh:
```sql
-- Delete test users
DELETE FROM users WHERE email LIKE '%@rdb.rw' 
   OR email LIKE '%@bk.rw' 
   OR email LIKE '%@safaricom.co.ke'
   OR email LIKE '%@example.com'
   OR email LIKE '%@company.com'
   OR email = 'admin@worksphere.ai';

-- Delete test organizations (careful!)
DELETE FROM organizations WHERE slug IN (
  'rdb-rwanda', 'bk-rwanda', 'mtn-rwanda', 'kigali-heights',
  'safaricom-ke', 'equity-ke', 'mtn-ug', 'vodacom-tz',
  'kigali-tech', 'kigali-digital'
);
```

## 📊 **Test Coverage Checklist**

### **Authentication**
- [ ] Login with each user type
- [ ] Password reset functionality
- [ ] Email verification process
- [ ] Session management

### **Authorization**
- [ ] Role-based access control
- [ ] Organization boundaries
- [ ] Feature permissions
- [ ] Admin overrides

### **Business Logic**
- [ ] Subscription limits enforcement
- [ ] Trial expiration handling
- [ ] Billing cycle processing
- [ ] User invitation flows

### **UI/UX**
- [ ] Responsive design on all devices
- [ ] Accessibility compliance
- [ ] Loading states
- [ ] Error handling

### **Data Integrity**
- [ ] User profile updates
- [ ] Organization settings
- [ ] Analytics tracking
- [ ] Audit logs

## 🎯 **Quick Start Commands**

```bash
# 1. Install dependencies
npm install @supabase/supabase-js dotenv uuid

# 2. Setup database
psql -d your_database -f database/test-users-creation.sql

# 3. Create test users
npm run create-test-users

# 4. Test login (example)
# Go to: http://localhost:5173/login
# Use: ceo@rdb.rw / Test@123456

# 5. Verify all features work as expected
```

## 📞 **Support**

If you encounter issues:

1. **Check the logs** for detailed error messages
2. **Verify environment variables** are correctly set
3. **Ensure database schema** is properly installed
4. **Test database connection** with a simple query

## 🎉 **Success!**

Once the test users are created, you'll have:

- ✅ **16 test users** across all roles
- ✅ **10 organizations** with different plans
- ✅ **Sample data** for testing all features
- ✅ **Credentials file** for easy reference
- ✅ **Comprehensive test coverage** for the entire platform

**Your WorkSphere AI platform is now ready for thorough testing!** 🚀
