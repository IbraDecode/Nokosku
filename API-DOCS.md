# NOKOSKU API Documentation

## Authentication
All endpoints require JWT token in Authorization header: `Bearer <token>`

### POST /api/v1/auth/register
Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registrasi sukses, silakan login.",
  "email": "user@example.com"
}
```

### POST /api/v1/auth/login
Login user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "name": "User Name",
  "email": "user@example.com"
}
```

## User

### GET /api/v1/user/profile
Get user profile.

**Response:**
```json
{
  "success": true,
  "profile": {
    "email": "user@example.com",
    "name": "User Name",
    "balance": 10000,
    "is_admin": false,
    "is_banned": false
  }
}
```

### GET /api/v1/user/balance
Get user balance.

**Response:**
```json
{
  "success": true,
  "balance": 10000
}
```

### GET /api/v1/user/transactions
Get user transactions.

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": 1,
      "type": "deposit",
      "amount": 10000,
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Deposit

### GET /api/v1/deposit/methods
List metode deposit yang aktif.

**Response:**
```json
{
  "success": true,
  "methods": [
    {
      "code": "atlantic",
      "name": "Atlantic QRIS",
      "description": "QRIS otomatis via Atlantic H2H",
      "min": 5000,
      "status": "active"
    }
  ]
}
```

### POST /api/v1/deposit/create
Create deposit.

**Request:**
```json
{
  "nominal": 10000,
  "metode": "atlantic"
}
```

**Response:**
```json
{
  "success": true,
  "deposit": {
    "id": 1,
    "nominal": 10000,
    "status": "pending",
    "provider_response": {
      "qr_image": "https://..."
    }
  }
}
```

### GET /api/v1/deposit/:id
Get deposit status.

**Response:**
```json
{
  "success": true,
  "deposit": { ... },
  "status": "pending"
}
```

### POST /api/v1/deposit/:id/cancel
Cancel deposit.

**Response:**
```json
{
  "success": true,
  "message": "Deposit canceled."
}
```

### GET /api/v1/deposit/history
Get deposit history.

**Response:**
```json
{
  "success": true,
  "deposits": [ ... ]
}
```

## Order

### GET /api/v1/orders/services
Get available services.

**Response:**
```json
{
  "success": true,
  "services": [ "whatsapp", "telegram" ]
}
```

### GET /api/v1/orders/countries/:serviceId
Get countries for service.

**Response:**
```json
{
  "success": true,
  "countries": [ { "code": "ID", "name": "Indonesia" } ]
}
```

### GET /api/v1/orders/operators/:countryCode
Get operators for country.

**Response:**
```json
{
  "success": true,
  "operators": [ { "id": 1, "name": "Operator 1" } ]
}
```

### POST /api/v1/orders/quote
Hitung harga jual berdasarkan markup.

**Request:**
```json
{
  "service_code": "whatsapp",
  "country_name": "Indonesia",
  "operator_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "quote": {
    "base_price": 5000,
    "markup": 1000,
    "selling_price": 6000,
    "operator_id": 1,
    "provider_id": 1
  }
}
```

### POST /api/v1/orders/create
Create order.

**Request:**
```json
{
  "service_code": "whatsapp",
  "country_name": "Indonesia"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "number": "+628123456789",
    "status": "pending"
  }
}
```

### GET /api/v1/orders/:id
Get order status.

**Response:**
```json
{
  "success": true,
  "order": { ... },
  "provider": { ... }
}
```

### POST /api/v1/orders/:id/resend
Resend OTP (max 3x).

**Response:**
```json
{
  "success": true,
  "message": "OTP dikirim ulang."
}
```

### POST /api/v1/orders/:id/cancel
Cancel order.

**Response:**
```json
{
  "success": true,
  "message": "Order canceled."
}
```

### GET /api/v1/orders/history
Get order history.

**Response:**
```json
{
  "success": true,
  "orders": [ ... ]
}
```

## Admin (Admin only)

### GET /api/v1/admin/stats
Get admin stats.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 100,
    "totalDeposits": 1000000,
    "totalOrders": 500,
    "totalProfit": 100000
  }
}
```

### GET /api/v1/admin/users
Get all users.

**Response:**
```json
{
  "success": true,
  "users": [ ... ]
}
```

### PUT /api/v1/admin/users/:id
Update user (ban).

**Request:**
```json
{
  "is_banned": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated."
}
```

### POST /api/v1/admin/refund
Refund order.

**Request:**
```json
{
  "order_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund berhasil."
}
```

### GET /api/v1/admin/markup
Get markup rules.

**Response:**
```json
{
  "success": true,
  "rules": [ ... ]
}
```

### POST /api/v1/admin/markup
Set markup.

**Request:**
```json
{
  "service": "whatsapp",
  "country": "Indonesia",
  "markup": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Markup updated."
}
```

### GET /api/v1/admin/audit
Get audit logs.

**Response:**
```json
{
  "success": true,
  "logs": [ ... ]
}
```

### GET /api/v1/admin/profit-analytics
Get profit analytics.

**Response:**
```json
{
  "success": true,
  "profits": [ ... ]
}
```

## WebSocket Events
- deposit:created
- deposit:paid
- deposit:expired
- order:created
- order:otp_received
- order:expired
- order:resend
- order:cancel

## Error Handling
All errors return:
```json
{
  "error": "Human readable message"
}
```
