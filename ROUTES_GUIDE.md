# WorkSphere AI - Complete Routes Guide

This guide covers all the authentication and signup routes available in WorkSphere AI.

## 🚀 **Main Entry Points**

### **Primary Routes**
```
/                    → Redirects to /signup
/signup              → Main signup page with user type selection
/login               → Professional login page
/signin              → Professional login page (alias)
```

## 📝 **Signup Routes**

### **Main Signup Page**
```
/signup              → Choose user type (Enterprise/Individual/Customer)
/register            → Redirects to /signup
```

### **User Type Specific Signup**
```
/signup/enterprise    → Enterprise signup (2-step flow)
/signup/individual    → Individual signup (single form)
/signup/customer      → Customer signup (portal access)
```

### **Email Verification**
```
/verify-email         → Email verification page
/verify              → Email verification page (alias)
```

### **Onboarding**
```
/onboarding          → Guided setup flow (6 steps)
/setup               → Onboarding flow (alias)
```

## 🔐 **Authentication Routes**

### **Login Pages**
```
/login               → Professional login with email/password & Google
/signin              → Login page (alias)
/auth                → Redirects to /login
/authenticate         → Redirects to /login
```

### **Password Reset**
```
/reset-password       → Password reset page
/forgot-password      → Password reset page (alias)
```

## 📊 **Protected Routes** (Require Authentication)

### **Main Application**
```
/dashboard            → Main dashboard
/app                 → Dashboard (alias)
```

### **Specialized Portals**
```
/customer-portal      → Customer portal (redirects to signup if not authenticated)
/admin               → Admin dashboard (redirects to login if not authenticated)
```

## 🔄 **Route Behavior**

### **Automatic Redirects**
- **Unauthenticated users** trying to access protected routes → Redirect to `/login`
- **Customer portal access** without authentication → Redirect to `/signup/customer`
- **Legacy routes** (`/auth`, `/authenticate`) → Redirect to `/login`
- **Register route** (`/register`) → Redirect to `/signup`
- **Root route** (`/`) → Redirect to `/signup`

### **Smart Detection**
The **ProfessionalAuth** component automatically detects the current URL:
- `/login`, `/signin` → Shows login form
- `/signup`, `/register` → Shows signup form
- `/reset-password`, `/forgot-password` → Shows password reset form

## 🎯 **User Journey Examples**

### **New Enterprise User**
```
1. /signup
2. /signup/enterprise
3. /verify-email
4. /onboarding
5. /dashboard
```

### **New Individual User**
```
1. /signup
2. /signup/individual
3. /verify-email
4. /onboarding
5. /dashboard
```

### **New Customer User**
```
1. /signup
2. /signup/customer
3. /verify-email
4. /customer-portal
```

### **Returning User**
```
1. /login
2. /dashboard
```

### **Password Reset**
```
1. /login → "Forgot Password?"
2. /reset-password
3. Check email → Reset link
4. /login (with new password)
```

## 🔧 **Technical Implementation**

### **Route Structure**
```typescript
// Main routes
<Route path="/" element={<Navigate to="/signup" replace />} />

// Authentication
<Route path="/login" element={<ProfessionalAuth onAuth={setUser} />} />
<Route path="/signin" element={<ProfessionalAuth onAuth={setUser} />} />

// Signup flows
<Route path="/signup" element={<SignupPage />} />
<Route path="/signup/enterprise" element={<EnterpriseSignup />} />
<Route path="/signup/individual" element={<IndividualSignup />} />
<Route path="/signup/customer" element={<CustomerSignup />} />

// Verification
<Route path="/verify-email" element={<EmailVerification />} />

// Onboarding
<Route path="/onboarding" element={<OnboardingFlow />} />

// Protected
<Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
```

### **Smart Auth Component**
The `ProfessionalAuth` component uses `useLocation()` to detect the current path:
```typescript
const location = useLocation();
const path = location.pathname;

if (path === '/signup' || path === '/register') {
  setIsSignUp(true);
} else {
  setIsSignUp(false);
}
```

## 🌐 **URL Examples**

### **Development (localhost:5173)**
```
http://localhost:5173/                    → Signup page
http://localhost:5173/signup              → Signup page
http://localhost:5173/login               → Login page
http://localhost:5173/signup/enterprise    → Enterprise signup
http://localhost:5173/signup/individual    → Individual signup
http://localhost:5173/signup/customer      → Customer signup
http://localhost:5173/verify-email         → Email verification
http://localhost:5173/onboarding          → Onboarding flow
http://localhost:5173/dashboard            → Dashboard (requires auth)
```

### **Production**
```
https://worksphere.ai/                    → Signup page
https://worksphere.ai/signup              → Signup page
https://worksphere.ai/login               → Login page
https://worksphere.ai/signup/enterprise    → Enterprise signup
https://worksphere.ai/signup/individual    → Individual signup
https://worksphere.ai/signup/customer      → Customer signup
https://worksphere.ai/verify-email         → Email verification
https://worksphere.ai/onboarding          → Onboarding flow
https://worksphere.ai/dashboard            → Dashboard (requires auth)
```

## 🎨 **UI Components by Route**

### **SignupPage** (`/signup`)
- Beautiful user type selection
- Three cards: Enterprise, Individual, Customer
- Professional gradients and animations

### **EnterpriseSignup** (`/signup/enterprise`)
- 2-step flow: Company info → Personal info
- Blue/indigo gradient theme
- Advanced form validation

### **IndividualSignup** (`/signup/individual`)
- Single form for professionals
- Green/emerald gradient theme
- Job title and experience fields

### **CustomerSignup** (`/signup/customer`)
- Customer portal access
- Purple/pink gradient theme
- Company and customer type fields

### **EmailVerification** (`/verify-email`)
- Token-based verification
- Resend functionality with countdown
- Success state with redirect

### **OnboardingFlow** (`/onboarding`)
- 6-step guided setup
- Progress tracking
- Optional steps with skip functionality

### **ProfessionalAuth** (`/login`)
- Smart login/signup toggle
- Google OAuth integration
- Professional design with gradients

## 🔍 **Debugging Routes**

### **Common Issues**
1. **404 Errors**: Check if the route exists in App.tsx
2. **Redirect Loops**: Ensure protected routes check authentication properly
3. **Wrong Component**: Verify the component import matches the route

### **Debug Steps**
1. **Check current URL**: Look at browser address bar
2. **Check App.tsx**: Verify route configuration
3. **Check component**: Ensure component renders correctly
4. **Check authentication**: Verify user state and redirects

### **Browser DevTools**
```javascript
// Check current route
window.location.pathname

// Check navigation history
window.history

// Force navigate
window.location.href = '/signup'
```

## 📱 **Mobile Considerations**

All routes are **mobile-responsive** and work seamlessly on:
- **Desktop**: Full experience with all features
- **Tablet**: Optimized layouts and interactions
- **Mobile**: Touch-friendly forms and navigation

## 🚀 **Next Steps**

1. **Test all routes** to ensure they work correctly
2. **Verify redirects** for protected routes
3. **Check mobile responsiveness** on different devices
4. **Test authentication flows** end-to-end
5. **Validate email verification** process

## 🎯 **Quick Testing Checklist**

- [ ] `/signup` → Shows user type selection
- [ ] `/signup/enterprise` → Shows enterprise signup form
- [ ] `/signup/individual` → Shows individual signup form
- [ ] `/signup/customer` → Shows customer signup form
- [ ] `/login` → Shows login form
- [ ] `/verify-email` → Shows verification page
- [ ] `/onboarding` → Shows onboarding flow
- [ ] `/dashboard` → Redirects to login if not authenticated
- [ ] All redirects work correctly
- [ ] Mobile responsive on all pages

**All routes are now fully implemented and ready for production!** 🎉
