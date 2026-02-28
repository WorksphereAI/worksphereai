# 📱 WorkSphere AI - Mobile-First Developer Guide

## Quick Reference for Building Responsive Pages

---

## 🎯 Core Principle: Mobile First

Always start with mobile CSS. Use media queries to enhance for larger screens.

```css
/* ❌ DON'T: Desktop first */
.card { width: 400px; }
@media (max-width: 640px) { .card { width: 100%; } }

/* ✅ DO: Mobile first */
.card { width: 100%; }
@media (min-width: 768px) { .card { width: 400px; } }
```

---

## 📦 Responsive Components Quick Start

### **ResponsiveGrid** - Layout System

**Usage:**
```tsx
<ResponsiveGrid 
  cols={{ xs: 1, sm: 2, md: 3, lg: 4 }}
  gap="md"
>
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</ResponsiveGrid>
```

**Props:**
- `cols`: Column configuration for each breakpoint
- `gap`: Spacing between items (none, sm, md, lg)
- `className`: Additional Tailwind classes

**Examples:**

```tsx
// Single column (mobile) → 2 columns (desktop)
<ResponsiveGrid cols={{ xs: 1, md: 2 }}>
  <LeftPanel />
  <RightPanel />
</ResponsiveGrid>

// 2 cols → 3 cols → 4 cols
<ResponsiveGrid cols={{ xs: 2, md: 3, lg: 4 }}>
  {products.map(p => <ProductCard key={p.id} {...p} />)}
</ResponsiveGrid>
```

---

### **ResponsiveCard** - Content Container

**Usage:**
```tsx
<ResponsiveCard 
  variant="elevated"
  padding="md"
  onClick={handleClick}
>
  {children}
</ResponsiveCard>
```

**Props:**
- `variant`: 'default' | 'outlined' | 'elevated'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `onClick`: Optional click handler
- `className`: Additional styles

**Examples:**

```tsx
// Elevated card with medium padding (default)
<ResponsiveCard>
  <h3>Card Title</h3>
  <p>Card content</p>
</ResponsiveCard>

// Outlined, minimal padding, clickable
<ResponsiveCard variant="outlined" padding="sm" onClick={() => navigate(id)}>
  Quick info item
</ResponsiveCard>

// Large padding for detailed content
<ResponsiveCard padding="lg" variant="elevated" className="backdrop-blur">
  Detailed information...
</ResponsiveCard>
```

---

### **ResponsiveText** - Typography

**Usage:**
```tsx
<ResponsiveText 
  variant="h1"
  weight="bold"
  color="primary"
  as="h1"
>
  Welcome
</ResponsiveText>
```

**Props:**
- `variant`: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small'
- `weight`: 'normal' | 'medium' | 'semibold' | 'bold'
- `color`: 'default' | 'muted' | 'primary' | 'error' | 'success'
- `as`: HTML element type
- `className`: Additional styles

**Examples:**

```tsx
// Page heading
<ResponsiveText variant="h1" weight="bold">
  Dashboard
</ResponsiveText>

// Secondary heading
<ResponsiveText variant="h3" weight="semibold" color="primary">
  Recent Activity
</ResponsiveText>

// Body text with muted color
<ResponsiveText color="muted">
  Last updated 2 hours ago
</ResponsiveText>

// Error message
<ResponsiveText variant="small" color="error">
  Email is required
</ResponsiveText>
```

---

### **ResponsiveInput** - Form Input

**Usage:**
```tsx
<ResponsiveInput
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  icon={<Mail size={18} />}
/>
```

**Props:**
- All standard HTML input attributes
- `label`: Input label text
- `error`: Error message string
- `success`: Boolean for success state
- `helper`: Helper text below input
- `icon`: Icon component
- `iconPosition`: 'left' | 'right'

**Examples:**

```tsx
// Basic input
<ResponsiveInput placeholder="Search..." />

// With label and error
<ResponsiveInput
  label="Password"
  type="password"
  error={loginError}
/>

// With icon and helper text
<ResponsiveInput
  label="Phone"
  icon={<Phone size={18} />}
  helper="Format: +250 788 123 456"
/>

// Multiple inputs in a grid
<ResponsiveGrid cols={{ xs: 1, md: 2 }} gap="md">
  <ResponsiveInput label="First Name" />
  <ResponsiveInput label="Last Name" />
  <ResponsiveInput label="Email" />
  <ResponsiveInput label="Phone" />
</ResponsiveGrid>
```

---

### **ResponsiveModal** - Dialog/Popup

**Usage:**
```tsx
<ResponsiveModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  size="md"
>
  <form>{/* content */}</form>
</ResponsiveModal>
```

**Props:**
- `isOpen`: Boolean to control modal visibility
- `onClose`: Callback when closing
- `title`: Modal header title
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: Show X button (default true)
- `children`: Modal content

**Behavior:**
- Mobile: Slides up from bottom
- Desktop: Centered with backdrop

**Examples:**

```tsx
// Create form modal
<ResponsiveModal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Task">
  <TaskForm onSubmit={handleAddTask} />
</ResponsiveModal>

// Full-screen modal on mobile
<ResponsiveModal isOpen={preview} onClose={() => setPreview(false)} size="full">
  <DocumentPreview doc={currentDoc} />
</ResponsiveModal>

// Small confirmation modal
<ResponsiveModal isOpen={confirm} onClose={() => setConfirm(false)} size="sm" title="Confirm">
  <p>Are you sure? This action cannot be undone.</p>
  <div className="mt-4 flex gap-2">
    <button>Cancel</button>
    <button className="bg-red-600 text-white">Delete</button>
  </div>
</ResponsiveModal>
```

---

### **ResponsiveTable** - Data Display

**Usage:**
```tsx
<ResponsiveTable
  data={tasks}
  columns={[
    { key: 'title', header: 'Task', render: (value) => <b>{value}</b> },
    { key: 'status', header: 'Status' },
    { key: 'due_date', header: 'Due Date' },
  ]}
  onRowClick={handleRowClick}
/>
```

**Props:**
- `data`: Array of items to display
- `columns`: Column configuration
- `onRowClick`: Callback when row is clicked

**Column Config:**
- `key`: Object property to display
- `header`: Column header text
- `render`: Custom render function
- `hideOnMobile`: Hide on mobile screens
- `hideOnTablet`: Hide on tablet screens

**Behavior:**
- Mobile: Cards with label-value pairs
- Desktop: Traditional HTML table

**Examples:**

```tsx
// Task list
<ResponsiveTable
  data={tasks}
  columns={[
    { key: 'title', header: 'Title' },
    { key: 'assigned_to', header: 'Assignee' },
    { 
      key: 'status', 
      header: 'Status',
      render: (status) => <StatusBadge status={status} />
    },
    { key: 'due_date', header: 'Due Date', hideOnMobile: true },
  ]}
  onRowClick={(task) => navigate(`/tasks/${task.id}`)}
/>

// User list with avatars
<ResponsiveTable
  data={users}
  columns={[
    {
      key: 'full_name',
      header: 'Name',
      render: (name, user) => (
        <div className="flex items-center gap-2">
          <img src={user.avatar_url} className="w-8 h-8 rounded-full" />
          {name}
        </div>
      )
    },
    { key: 'email', header: 'Email', hideOnTablet: true },
    { key: 'role', header: 'Role' },
  ]}
/>
```

---

### **useMediaQuery** - Responsive Hooks

**Available Hooks:**

```tsx
// Generic hook
const matches = useMediaQuery('(min-width: 768px)');

// Predefined hooks
const isMobile = useIsMobile();      // < 640px
const isTablet = useIsTablet();      // 641px - 1024px
const isDesktop = useIsDesktop();    // > 1024px
const isLandscape = useIsLandscape(); // Landscape orientation
const isPortrait = useIsPortrait();   // Portrait orientation
```

**Usage Examples:**

```tsx
// Conditional rendering
const Dashboard = () => {
  const isMobile = useIsMobile();
  
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

// Dynamic component props
export const ProductGrid = () => {
  const isTablet = useIsTablet();
  
  return (
    <ResponsiveGrid cols={{ xs: 2, md: isTablet ? 2 : 4 }}>
      {products.map(p => <ProductCard key={p.id} {...p} />)}
    </ResponsiveGrid>
  );
};

// Show/hide elements
export const Sidebar = () => {
  const isMobile = useIsMobile();
  
  return (
    <div>
      <MainContent />
      {!isMobile && <Sidebar />}
    </div>
  );
};
```

---

## 🎨 Common Layouts

### **Two Column Layout**

```tsx
export const TwoColumnLayout = () => {
  return (
    <ResponsiveGrid cols={{ xs: 1, md: 2 }} gap="lg">
      <div>
        <ResponsiveText variant="h3" weight="semibold" className="mb-4">
          Left Panel
        </ResponsiveText>
        {/* Content */}
      </div>
      <div>
        <ResponsiveText variant="h3" weight="semibold" className="mb-4">
          Right Panel
        </ResponsiveText>
        {/* Content */}
      </div>
    </ResponsiveGrid>
  );
};
```

### **Three Column Layout**

```tsx
export const ThreeColumnLayout = () => {
  return (
    <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap="lg">
      {sections.map(section => (
        <ResponsiveCard key={section.id}>
          {/* Content */}
        </ResponsiveCard>
      ))}
    </ResponsiveGrid>
  );
};
```

### **Header with Content**

```tsx
export const PageWithHeader = () => {
  return (
    <div>
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-6 sm:p-8">
        <div className="container mx-auto">
          <ResponsiveText variant="h1" weight="bold" color="default" className="text-white">
            Page Title
          </ResponsiveText>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">
          {/* Cards */}
        </ResponsiveGrid>
      </div>
    </div>
  );
};
```

### **Split View (Hidden on Mobile)**

```tsx
export const SplitView = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <SingleColumnView />;
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <Sidebar />
      <Main |className="col-span-2" />
    </div>
  );
};
```

---

## 📱 Mobile-First Development Checklist

When building a new page:

- [ ] Start with mobile layout (xs)
- [ ] Add styles for tablets (md)
- [ ] Add styles for desktops (lg)
- [ ] Test on real devices
- [ ] Check touch targets are 48px+
- [ ] Ensure no horizontal scrolling on mobile
- [ ] Use ResponsiveGrid for layouts
- [ ] Use ResponsiveText for typography
- [ ] Test at different orientations
- [ ] Verify performance on slow networks

---

## 🚀 Migration Guide

### Converting Old Components

**Before:**
```tsx
const OldDashboard = () => (
  <div className="grid grid-cols-4 gap-4 p-6">
    <div className="bg-white p-4 rounded-lg">Card 1</div>
    <div className="bg-white p-4 rounded-lg">Card 2</div>
    <div className="bg-white p-4 rounded-lg">Card 3</div>
    <div className="bg-white p-4 rounded-lg">Card 4</div>
  </div>
);
```

**After:**
```tsx
import { ResponsiveGrid, ResponsiveCard, ResponsiveText } from '@/components/ui';

const NewDashboard = () => (
  <ResponsiveGrid cols={{ xs: 2, md: 4 }} gap="md" className="p-4 sm:p-6">
    <ResponsiveCard>
      <ResponsiveText>Card 1</ResponsiveText>
    </ResponsiveCard>
    <ResponsiveCard>
      <ResponsiveText>Card 2</ResponsiveText>
    </ResponsiveCard>
    <ResponsiveCard>
      <ResponsiveText>Card 3</ResponsiveText>
    </ResponsiveCard>
    <ResponsiveCard>
      <ResponsiveText>Card 4</ResponsiveText>
    </ResponsiveCard>
  </ResponsiveGrid>
);
```

---

## 🔍 Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Click device toggle (top-left)
3. Select device or custom dimensions
4. Check responsiveness

### Key Device Sizes
- Mobile: 375px (iPhone)
- Tablet: 768px (iPad)
- Desktop: 1024px+

### Lighthouse Audit
1. Open DevTools
2. Go to Lighthouse tab
3. Run Mobile audit
4. Fix any issues

---

## 💡 Pro Tips

1. **Use the container utility**
   ```tsx
   <div className="container mx-auto px-4">
     {/* Auto-responsive container */}
   </div>
   ```

2. **Combine media queries with responsive components**
   ```tsx
   <ResponsiveGrid 
     cols={{ xs: 1, md: 2 }} 
     className="md:gap-8 lg:gap-12"  // Additional breakpoint spacing
   >
     {/* Content */}
   </ResponsiveGrid>
   ```

3. **Use semantic HTML**
   ```tsx
   <ResponsiveText as="h1" variant="h1">Title</ResponsiveText>
   <ResponsiveText as="p" variant="body">Paragraph</ResponsiveText>
   ```

4. **Test accessibility**
   ```tsx
   <ResponsiveInput
     label="Email"  // Always include labels
     aria-label="Email address"
     aria-describedby="email-hint"
   />
   <p id="email-hint" className="text-sm text-gray-500">
     We'll never share your email
   </p>
   ```

---

## 📚 Additional Resources

- **Tailwind CSS Responsive Design**: https://tailwindcss.com/docs/responsive-design
- **Mobile-First Design**: https://www.uxpin.com/studio/blog/mobile-first-design/
- **WCAG Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Happy responsive development! 🚀**
