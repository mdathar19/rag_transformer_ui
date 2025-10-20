# Modular Architecture - Admin & User Separation

## Overview
The application now has a complete modular architecture with separate user and admin modules, role-based routing, and proper data isolation.

## Frontend Structure

### Module Organization
```
src/pages/
├── user/                    # User module
│   ├── UserDashboard.jsx   # User dashboard layout & routes
│   └── UserWebsites.jsx    # User's own websites management
├── admin/                   # Admin module
│   ├── AdminDashboard.jsx  # Admin dashboard layout & routes
│   └── AdminWebsites.jsx   # All websites management (admin view)
├── Login.jsx               # Shared authentication
├── Signup.jsx              # Shared authentication
└── Chat.jsx                # Shared chat component
```

### Routing Structure

#### Public Routes
- `/login` - Login page
- `/signup` - Signup page

#### User Routes (USER role)
- `/user/dashboard` - User overview
- `/user/dashboard/websites` - My websites
- `/user/dashboard/chat` - Chat interface
- `/user/dashboard/settings` - User settings

#### Admin Routes (ADMIN role)
- `/admin/dashboard` - Admin overview
- `/admin/dashboard/websites` - All websites
- `/admin/dashboard/users` - User management
- `/admin/dashboard/query` - Admin chat/query
- `/admin/dashboard/settings` - Admin settings

### Role-Based Routing

**ProtectedRoute Component:**
- Checks if user is authenticated
- For admin-only routes, verifies user has ADMIN role
- Redirects non-admin users trying to access admin routes to user dashboard

**PublicRoute Component:**
- Redirects authenticated admins to `/admin/dashboard`
- Redirects authenticated users to `/user/dashboard`

**RoleBasedRedirect Component:**
- Automatically redirects to appropriate dashboard based on user role

## Backend Changes

### 1. Owner Field on Clients

**New Fields Added:**
```javascript
{
  owner: "USER_BROKER_ID",      // BrokerId of user who created the website
  ownerEmail: "user@email.com"  // Email of user who created the website
}
```

### 2. API Endpoint Updates

#### POST /api/v1/clients
- **Authentication:** Required (JWT)
- **Behavior:** Automatically adds `owner` and `ownerEmail` from authenticated user
- **Access:** All authenticated users can create websites

#### GET /api/v1/clients
- **Authentication:** Required (JWT)
- **Behavior:**
  - **ADMIN users:** See ALL websites (no filtering)
  - **Regular users:** Only see their own websites (filtered by `owner` field)

**Example:**
```javascript
// User request
GET /api/v1/clients
Authorization: Bearer <user_token>
// Returns: Only websites where owner === user.brokerId

// Admin request
GET /api/v1/clients
Authorization: Bearer <admin_token>
// Returns: ALL websites (no owner filter)
```

### 3. Database Schema

**clients Collection:**
```javascript
{
  _id: ObjectId,
  brokerId: String,           // Unique identifier for this website
  name: String,               // Website name
  domain: String,             // Website URL
  owner: String,              // BrokerId of owner (NEW)
  ownerEmail: String,         // Email of owner (NEW)
  status: String,
  crawlSettings: Object,
  metadata: Object,
  contentCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

### 1. Login/Signup
- User enters email → receives OTP
- After OTP verification, receives JWT token
- Token contains: `{ brokerId, email, userType, companyName }`

### 2. Dashboard Redirect
```
User logs in
    ↓
Check userType
    ↓
┌─────────────┬─────────────┐
│ ADMIN       │ USER        │
│ ↓           │ ↓           │
│ Admin       │ User        │
│ Dashboard   │ Dashboard   │
└─────────────┴─────────────┘
```

### 3. Route Protection
```
User tries to access route
    ↓
Is authenticated?
    ├─ No → Redirect to /login
    └─ Yes → Check role for admin routes
              ├─ Admin route + Not admin → Redirect to /user/dashboard
              └─ Authorized → Allow access
```

## Key Features

### Data Isolation
- ✅ Users only see and manage their own websites
- ✅ Admins can see and manage all websites
- ✅ Websites are tagged with owner information

### Modular Architecture
- ✅ Separate user and admin page modules
- ✅ Shared authentication system
- ✅ Reusable components (Loading, ThemeToggle, Chat)
- ✅ Independent routing for each module

### Role-Based Access Control
- ✅ JWT-based authentication with role info
- ✅ Frontend route protection
- ✅ Backend API filtering by role
- ✅ Automatic redirects based on user role

## Usage Examples

### Creating a Website (User)
```javascript
// User creates website
POST /api/v1/clients
Authorization: Bearer <user_token>
{
  "name": "My Company",
  "domain": "https://mycompany.com"
}

// Backend automatically adds:
{
  "owner": "USER_BROKER_ID",
  "ownerEmail": "user@email.com"
}
```

### Listing Websites

**As User:**
```javascript
GET /api/v1/clients
Authorization: Bearer <user_token>

// Response: Only user's websites
{
  "success": true,
  "data": {
    "clients": [
      {
        "brokerId": "WEB123",
        "name": "My Company",
        "owner": "USER_BROKER_ID",  // Matches user
        "ownerEmail": "user@email.com"
      }
    ]
  }
}
```

**As Admin:**
```javascript
GET /api/v1/clients
Authorization: Bearer <admin_token>

// Response: ALL websites
{
  "success": true,
  "data": {
    "clients": [
      {
        "brokerId": "WEB123",
        "name": "Company A",
        "owner": "USER1_BROKER_ID",
        "ownerEmail": "user1@email.com"
      },
      {
        "brokerId": "WEB456",
        "name": "Company B",
        "owner": "USER2_BROKER_ID",
        "ownerEmail": "user2@email.com"
      }
      // ... all websites
    ]
  }
}
```

## Migration Notes

### Existing Data
- Existing websites in database will have `owner: null`
- These websites will only be visible to admin users
- To assign ownership, manually update the database or recreate websites

### Legacy Routes
- Old `/dashboard/*` routes now redirect based on user role
- Ensures backward compatibility

## Security Considerations

1. **JWT Tokens:** All API requests require valid JWT token
2. **Role Validation:** Admin routes validate userType on both frontend and backend
3. **Data Filtering:** Backend enforces owner-based filtering at database level
4. **No Client-Side Trust:** Role checks happen on server, not just client

## Testing

### Test as User
1. Sign up with a regular account
2. Add some websites
3. Verify you only see your own websites
4. Try accessing `/admin/dashboard` → Should redirect to `/user/dashboard`

### Test as Admin
1. Login with admin account (userType: 'ADMIN')
2. Verify you see all websites from all users
3. Can access both `/admin/dashboard` and manage all data
4. See owner information for each website

## Future Enhancements

- [ ] User management page for admins
- [ ] Transfer website ownership
- [ ] Team/organization support (shared websites)
- [ ] Audit logs for admin actions
- [ ] Usage statistics per user
- [ ] Billing integration based on usage
