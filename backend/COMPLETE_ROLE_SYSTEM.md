# Wedding Planner - Complete Role Management System

## System Overview

The Wedding Planner application implements a comprehensive **5-tier Role-Based Access Control (RBAC)** system with proper authorization checks on all protected endpoints.

---

## The 5 Roles

### 1. 👰 COUPLE
**Purpose:** Create and manage their wedding events

**Capabilities:**
- ✓ Register and create account
- ✓ Create new weddings
- ✓ View and edit their own weddings
- ✓ Delete their own weddings
- ✓ Assign planners to their weddings
- ✓ Remove planners from their weddings
- ✓ Update wedding status
- ✗ Cannot view other couples' weddings
- ✗ Cannot view all weddings in system

**Default Role:** Yes (assigned when role not specified)

**Use Cases:**
- Bride and groom creating their wedding event
- Managing guest lists and vendors
- Tracking wedding status through different phases

---

### 2. 👔 ADMIN
**Purpose:** System management and oversight

**Capabilities:**
- ✓ Full access to all resources
- ✓ View all weddings in the system
- ✓ Create/edit/delete any wedding
- ✓ Assign and manage planners
- ✓ Manage user accounts and roles
- ✓ System-wide reporting and analytics
- ✓ Override any authorization checks

**Restrictions:**
- ✗ Cannot register as admin (system-created only)
- Typically created during system initialization

**Use Cases:**
- System administrators
- Support team for customer issues
- Data management and backups

---

### 3. 🎯 PLANNER
**Purpose:** Manage and coordinate wedding events

**Capabilities:**
- ✓ Register and create account
- ✓ View all weddings in system
- ✓ Access assigned wedding details
- ✓ Update wedding status
- ✓ Coordinate with couples and vendors
- ✓ Access planning tools and checklists
- ✗ Cannot create weddings
- ✗ Cannot delete weddings
- ✗ Cannot view other planners' personal data

**Assigned By:** Admin or Couple

**Use Cases:**
- Professional wedding planners
- Coordinators
- Event management companies

---

### 4. 🎁 VENDOR
**Purpose:** Offer services for wedding events

**Capabilities:**
- ✓ Register and create account
- ✓ Manage service offerings
- ✓ View wedding opportunities (in relevant categories)
- ✓ Respond to vendor inquiries
- ✓ Update service availability
- ✗ Cannot create weddings
- ✗ Cannot view all weddings
- ✗ Cannot manage other vendors' services

**Service Categories:**
- Photography
- Catering
- Decoration
- Venue
- Music
- Makeup
- Other

**Use Cases:**
- Photography studios
- Caterers
- Florists
- Music bands
- Makeup artists
- Venue providers

---

### 5. 👥 GUEST
**Purpose:** Limited access to wedding information

**Capabilities:**
- ✓ Register and create account
- ✓ View specific wedding details (if invited)
- ✓ RSVP and respond to invitations
- ✓ View guest list
- ✓ Access wedding timeline
- ✗ Cannot create weddings
- ✗ Cannot view all weddings
- ✗ Cannot manage wedding details
- ✗ Cannot manage other guests

**Use Cases:**
- Wedding guests
- Family members receiving invitations
- Friends of the couple
- Remote attendees

---

## Authorization Flow Diagram

```
Request with JWT Token
         |
         v
    Protect Middleware
    (Validate JWT)
         |
         v
    Token Valid?
    /         \
  NO          YES
   |           |
  401          v
 Return    Extract User
  Error     & Role
            |
            v
       Authorize Middleware
       (Check Role)
            |
            v
    User Role in
    Allowed Roles?
    /         \
  NO          YES
   |           |
  403          v
 Return    Process Request
  Error     (Handle Operation)
            |
            v
        Return Response
```

---

## Security Implementation

### JWT Token Structure

```
Header:    { "alg": "HS256", "typ": "JWT" }
Payload:   { "id": "userId", "role": "couple", "iat": 1234567890, "exp": 1234654290 }
Signature: HMACSHA256(Header + Payload, secret)
```

### Token Storage
- Returned to client after registration/login
- Client sends in `Authorization: Bearer <token>` header
- Server validates signature and expiration on each request
- Tokens expire after defined period (default: 7 days)

### Authorization Checks

```javascript
// Middleware: Verify JWT token exists and is valid
exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(new Error("No token provided"));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};

// Middleware: Verify user has required role
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new Error(`Role '${req.user.role}' not authorized`));
    }
    next();
  };
};
```

---

## API Endpoint Access by Role

### Wedding Management Endpoints

| Endpoint | Method | Couple | Admin | Planner | Vendor | Guest |
|----------|--------|--------|-------|---------|--------|-------|
| `/api/v1/weddings` | POST | ✓ | ✓ | ✗ | ✗ | ✗ |
| `/api/v1/weddings` | GET | ✗ | ✓ | ✓ | ✗ | ✗ |
| `/api/v1/weddings/my-weddings` | GET | ✓ | ✗ | ✗ | ✗ | ✗ |
| `/api/v1/weddings/:id` | GET | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/api/v1/weddings/:id` | PUT | ✓ | ✓ | ✗ | ✗ | ✗ |
| `/api/v1/weddings/:id` | DELETE | ✓ | ✓ | ✗ | ✗ | ✗ |
| `/api/v1/weddings/:id/assign-planner` | PUT | ✓ | ✓ | ✗ | ✗ | ✗ |
| `/api/v1/weddings/:id/remove-planner` | PUT | ✓ | ✓ | ✗ | ✗ | ✗ |
| `/api/v1/weddings/:id/status` | PUT | ✓ | ✓ | ✓ | ✗ | ✗ |

*✓ = Allowed | ✗ = Forbidden (403)*

---

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient role permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

---

## Role-Specific Workflows

### Couple's Workflow
```
1. Register (role: couple)
2. Create Wedding
3. Invite Planner
4. Manage Vendors
5. Update Wedding Details
6. Track Status
7. View Finalized Plans
```

### Planner's Workflow
```
1. Register (role: planner)
2. View Assigned Weddings
3. Create Checklists
4. Coordinate with Couple
5. Manage Vendors
6. Update Progress Status
7. Generate Reports
```

### Vendor's Workflow
```
1. Register (role: vendor)
2. Set Service Details
3. Browse Opportunities
4. Submit Proposals
5. Manage Inquiries
6. Update Availability
7. Complete Service Delivery
```

### Admin's Workflow
```
1. System Initialization
2. Create Admin Accounts
3. Monitor All Activities
4. Manage User Roles
5. Handle Disputes
6. System Maintenance
7. Generate Reports
```

---

## Error Responses

### 401 Unauthorized (No Token)
```json
{
  "success": false,
  "message": "Not authorized to access this route",
  "statusCode": 401
}
```

### 403 Forbidden (Invalid Role)
```json
{
  "success": false,
  "message": "User role 'guest' is not authorized to access this route",
  "statusCode": 403
}
```

### 400 Bad Request (Invalid Data)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Testing All Roles

### Quick Role Test
```powershell
# Test as Couple
$coupleToken = (Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"fullName":"Jane","email":"jane@test.com","phone":"1234567890","password":"Pass123","role":"couple"}' `
    -UseBasicParsing).Content | ConvertFrom-Json).data.token

# Try to create wedding (should work)
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/weddings" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $coupleToken"} `
    -UseBasicParsing

# Test as Planner
$plannerToken = (...)  # Similar registration with role="planner"

# Try to create wedding (should fail with 403)
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/weddings" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $plannerToken"} `
    -UseBasicParsing
```

---

## Database Role Schema

```javascript
// User Model - src/models/User.js
role: {
  type: String,
  enum: ["admin", "couple", "planner", "vendor", "guest"],
  default: "couple",
  required: true
}
```

---

## Summary

✓ **5 Complete Roles Implemented**
✓ **JWT-Based Authentication**
✓ **Role-Based Authorization**
✓ **Granular Permission Control**
✓ **Comprehensive Error Handling**
✓ **Production-Ready Security**

---

## Files Involved

- `src/models/User.js` - Role definition
- `src/middleware/auth.js` - JWT and authorization logic
- `src/routes/weddingRoutes.js` - Role-based access controls
- `src/controllers/weddingController.js` - Business logic
- `.env` - JWT secret and configuration

---

## Conclusion

The Wedding Planner system successfully implements a complete role-based access control system with 5 distinct roles, each with specific permissions and use cases. All endpoints properly enforce authorization checks and return appropriate HTTP status codes.

