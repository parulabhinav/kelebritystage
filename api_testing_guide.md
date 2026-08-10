# Postman API Testing Guide - Celebrity Booking Platform

This guide describes how to run and test all core user, celebrity, and admin API lifecycles using Postman.

---

## 1. Startup & Setup

### Step 1: Start Backend Server
Ensure your PostgreSQL database is running and configuration in [.env](file:///c:/Users/kalyan5256/OneDrive/Desktop/BOOK%20MY%20CELEB/.env) is updated.
```bash
npm run dev
```
The server runs on `http://localhost:5000`.

### Step 1.1: Reset & Seed Database (To clear all existing data)
To clear all data currently in the database and seed a fresh set of default test users (Admin, Client, Celebrity) along with categories, run:
```bash
npm test
```
This command runs the smoke test suite which does a force-sync on the database, dropping all existing tables and recreate them clean.

### Step 2: Configure Postman Headers
For all protected routes, add the following header in Postman:
- **Key**: `Authorization`
- **Value**: `Bearer {{accessToken}}`

---

## 2. API Test Scenarios & Payloads

### Step 1: Health Check
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/v1/public/health`
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Celebrity Booking Platform Backend API is healthy",
    "timestamp": "2026-08-07T08:30:00.000Z"
  }
  ```

---

### Step 1.2: Get Public Categories
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/v1/public/categories`
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c9e0d1ab-4399-4c8d-b0a1-432efcc19a77",
        "name": "Musician",
        "slug": "musician",
        "description": "Singers and bands",
        "isActive": true,
        "displayOrder": 5
      }
    ]
  }
  ```

---

### Step 1.3: Search & Filter Celebrities (Public Discovery)
Test searching by name (`search`), filtering by category slug (`category`), and filtering by minimum/maximum price limits.
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/v1/public/celebrities?category=Musician&minPrice=10000&maxPrice=50000&search=Rohan`
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "total": 1,
      "celebrities": [
        {
          "id": "{{celebrityId}}",
          "userId": "{{celebrityUserId}}",
          "bio": "Singer and Composer",
          "categories": ["Musician"],
          "minimumPrice": "10000.00",
          "maximumPrice": "50000.00",
          "rating": "4.80",
          "user": {
            "name": "Rockstar Rohan",
            "email": "celebrity@gmail.com",
            "profileImage": null
          }
        }
      ]
    }
  }
  ```

---

### Step 1.4: Get Public Celebrity Details
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/v1/public/celebrities/{{celebrityId}}`
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "{{celebrityId}}",
      "userId": "{{celebrityUserId}}",
      "bio": "Singer and Composer",
      "categories": ["Musician"],
      "minimumPrice": "10000.00",
      "maximumPrice": "50000.00",
      "rating": "4.80",
      "user": {
        "name": "Rockstar Rohan",
        "email": "celebrity@gmail.com",
        "profileImage": null
      },
      "portfolioItems": [],
      "galleries": []
    }
  }
  ```

---

### Step 2: Register a User
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/auth/register`
- **Body (`raw JSON`)**:
  ```json
  {
    "phoneNumber": "+918888888888",
    "name": "John Client",
    "email": "john.client@example.com",
    "password": "password123",
    "role": "user" 
  }
  ```
  *(Note: Replace `"role": "user"` with `"role": "celebrity"` to register as a celebrity profile).*
- **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Registration successful. Verification OTP sent to your phone number.",
    "data": {
      "userId": "{{userId}}"
    }
  }
  ```
  *(Note: A registration verification OTP code is automatically sent. You MUST verify this phone number before attempting to log in, otherwise the password login endpoint will return a 403 error).*

---

### Step 3: Verify Registration OTP Code
Verify the newly registered user's phone number using the registration verification OTP code.
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/auth/otp/verify`
- **Body (`raw JSON`)**:
  ```json
  {
    "phoneNumber": "+918888888888",
    "code": "123456",
    "type": "verify_phone"
  }
  ```
  *(Note: Find the mock 6-digit OTP code printed in your server CLI logs during Step 2).*
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "data": {
      "accessToken": "{{accessToken}}",
      "refreshToken": "{{refreshToken}}",
      "user": {
        "id": "{{userId}}",
        "name": "John Client",
        "email": "john.client@example.com",
        "phoneNumber": "+918888888888",
        "role": "user",
        "profileImage": null
      }
    }
  }
  ```

---

### Step 4: Login with Password
Now that the account is verified, you can log in using the password credentials.
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/auth/login`
- **Body (`raw JSON`)**:
  ```json
  {
    "emailOrPhone": "john.client@example.com",
    "password": "password123"
  }
  ```
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "{{accessToken}}",
      "refreshToken": "{{refreshToken}}",
      "user": {
        "id": "{{userId}}",
        "name": "John Client",
        "email": "john.client@example.com",
        "phoneNumber": "+918888888888",
        "role": "user",
        "profileImage": null
      }
    }
  }
  ```

---

### Step 5: OTP Authentication Flow (Alternative Login)

#### 5.1 Request OTP Code
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/auth/otp/request`
- **Body (`raw JSON`)**:
  ```json
  {
    "phoneNumber": "+918888888888",
    "type": "login"
  }
  ```
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```
*(Note: Find the mock 6-digit OTP code printed in your server CLI logs)*

#### 5.2 Verify OTP Code
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/auth/otp/verify`
- **Body (`raw JSON`)**:
  ```json
  {
    "phoneNumber": "+918888888888",
    "code": "123456",
    "type": "login"
  }
  ```
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "data": {
      "accessToken": "{{accessToken}}",
      "refreshToken": "{{refreshToken}}",
      "user": {
        "id": "{{userId}}",
        "name": "John Client",
        "role": "user"
      }
    }
  }
  ```

---

### Step 6: User Role vs. Celebrity Role

The system uses Role-Based Access Control. The role is assigned at registration time and cannot be switched dynamically.
1. **User Role**: Registers with `"role": "user"`. Allowed to call `/api/v1/user/...` routes.
2. **Celebrity Role**: Registers with `"role": "celebrity"`. Creates a celebrity profile and unlocks `/api/v1/celebrity/...` routes (after admin approval).
3. **Admin Role**: Created directly in the database. Managed via `/api/v1/admin/...` routes.

---

### Step 6: Add Client Address
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/user/addresses`
- **Headers**: `Authorization: Bearer {{accessToken}}`
- **Body (`raw JSON`)**:
  ```json
  {
    "addressLine1": "Flat 202, Star Heights",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "postalCode": "400001",
    "isPrimary": true
  }
  ```
- **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "{{addressId}}",
      "userId": "{{userId}}",
      "addressLine1": "Flat 202, Star Heights",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "postalCode": "400001",
      "isPrimary": true,
      "isVerified": true,
      "verificationStatus": "verified"
    }
  }
  ```

---

### Step 7: Create Booking Request
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/user/bookings`
- **Headers**: `Authorization: Bearer {{accessToken}}`
- **Body (`raw JSON`)**:
  ```json
  {
    "celebrityId": "{{celebrityId}}",
    "addressId": "{{addressId}}",
    "appearanceType": "live_performance",
    "amount": 20000.00,
    "eventDetails": {
      "eventName": "New Year Bash",
      "description": "Live musical performance",
      "date": "2026-09-01T18:00:00.000Z"
    }
  }
  ```
- **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Booking request created successfully",
    "data": {
      "id": "{{bookingId}}",
      "bookingNumber": "BMC9098336842",
      "status": "pending",
      "amount": "20000.00",
      "commission": "3000.00",
      "platformFee": "2000.00",
      "escrowAmount": "20000.00",
      "paymentStatus": "pending"
    }
  }
  ```

---

### Step 8: Celebrity Accepts Booking
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/v1/celebrity/bookings/{{bookingId}}/approve`
- **Headers**: `Authorization: Bearer {{accessToken}}`
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Booking request approved",
    "data": {
      "id": "{{bookingId}}",
      "status": "accepted",
      "approvalStatus": "approved"
    }
  }
  ```

---

### Step 9: Client Checkout Payment
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/v1/user/payments`
- **Headers**: `Authorization: Bearer {{accessToken}}`
- **Body (`raw JSON`)**:
  ```json
  {
    "bookingId": "{{bookingId}}",
    "paymentMethod": "card",
    "paymentGateway": "stripe",
    "gatewayTransactionId": "ch_mock_stripe_transaction_id"
  }
  ```
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Payment completed successfully and held in escrow",
    "data": {
      "id": "{{paymentId}}",
      "bookingId": "{{bookingId}}",
      "amount": "20000.00",
      "status": "success"
    }
  }
  ```

---

### Step 10: Admin Releases Escrow Payout
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/v1/admin/payments/{{paymentId}}/release`
- **Headers**: `Authorization: Bearer {{accessToken}}`
- **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Escrow payment released to celebrity wallet"
  }
  ```

---

## 3. Postman Collection Import (Recommended)

We have generated a pre-configured Postman Collection file in your workspace: [celebrity_booking.postman_collection.json](file:///c:/Users/kalyan5256/OneDrive/Desktop/BOOK%20MY%20CELEB/celebrity_booking.postman_collection.json).

### How to use:
1. Open Postman.
2. Click **Import** in the top-left corner.
3. Choose the file `celebrity_booking.postman_collection.json` from the root of your project directory.
4. Set up an environment with:
   - `baseUrl` = `http://localhost:5000`
   - `accessToken` = *(your JWT token)*
   - `userId`, `celebrityId`, `addressId`, `bookingId`, `paymentId`, `disputeId` = *(matching resource IDs)*


---

## 3. Exhaustive API Reference Index

This section details every endpoint registered in the Express routing layout, including required headers, request body schemas, and expected success responses.

### 3.1 Public Routes (No Auth Required)

| Method & URL Path | Required Headers | Request Body / Query Params | Expected Success Response (JSON & Status) |
|:---|:---|:---|:---|
| **GET** `/api/v1/public/health` | None | None | **200 OK**<br>`{ "success": true, "message": "Celebrity Booking Platform Backend API is healthy", "timestamp": "2026-08-07T08:30:00.000Z" }` |
| **GET** `/api/v1/public/celebrities` | None | **Query Params (Optional):**<br>- `category` (string)<br>- `minPrice` (number)<br>- `maxPrice` (number)<br>- `search` (string)<br>- `limit` (number)<br>- `offset` (number) | **200 OK**<br>`{ "success": true, "data": { "total": 1, "celebrities": [...] } }` |
| **GET** `/api/v1/public/celebrities/:id` | None | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "bio": "...", "user": { "name": "...", "email": "..." }, "portfolioItems": [], "galleries": [] } }` |
| **GET** `/api/v1/public/categories` | None | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "name": "Musician", "slug": "musician", "isActive": true } ] }` |
| **GET** `/api/v1/public/categories/:slug/celebrities` | None | None | **200 OK**<br>`{ "success": true, "data": { "category": { ... }, "celebrities": [...] } }` |

---

### 3.2 Authentication Routes

| Method & URL Path | Required Headers | Request Body / Query Params | Expected Success Response (JSON & Status) |
|:---|:---|:---|:---|
| **POST** `/api/v1/auth/otp/request` | None | **Body (raw JSON):**<br>`{ "phoneNumber": "+919999999999", "type": "login" }` *(type can be "login" or "verify_phone")* | **200 OK**<br>`{ "success": true, "message": "OTP sent successfully" }` |
| **POST** `/api/v1/auth/otp/verify` | None | **Body (raw JSON):**<br>`{ "phoneNumber": "+919999999999", "code": "123456", "type": "login" }` | **200 OK**<br>`{ "success": true, "message": "OTP verified successfully", "data": { "accessToken": "jwt...", "refreshToken": "jwt...", "user": { "id": "uuid", "name": "..." } } }` |
| **POST** `/api/v1/auth/register` | None | **Body (raw JSON):**<br>`{ "phoneNumber": "+919999999999", "name": "John Doe", "email": "john@example.com", "password": "password123", "role": "user" }` *(role: "user" or "celebrity")* | **201 Created**<br>`{ "success": true, "message": "Registration successful. Verification OTP sent...", "data": { "userId": "uuid" } }` |
| **POST** `/api/v1/auth/login` | None | **Body (raw JSON):**<br>`{ "emailOrPhone": "john@example.com", "password": "password123" }` | **200 OK**<br>`{ "success": true, "message": "Login successful", "data": { "accessToken": "...", "refreshToken": "...", "user": { ... } } }` |
| **POST** `/api/v1/auth/logout` | None | **Body (raw JSON):**<br>`{ "refreshToken": "..." }` | **200 OK**<br>`{ "success": true, "message": "Logged out successfully" }` |
| **POST** `/api/v1/auth/refresh-token` | None | **Body (raw JSON):**<br>`{ "refreshToken": "..." }` | **200 OK**<br>`{ "success": true, "data": { "accessToken": "new_access_token" } }` |
| **POST** `/api/v1/auth/forgot-password` | None | **Body (raw JSON):**<br>`{ "email": "john@example.com" }` | **200 OK**<br>`{ "success": true, "message": "Password reset OTP sent successfully" }` |
| **POST** `/api/v1/auth/reset-password` | None | **Body (raw JSON):**<br>`{ "phoneNumber": "+919999999999", "code": "123456", "newPassword": "newpassword123" }` | **200 OK**<br>`{ "success": true, "message": "Password reset successful" }` |
| **GET** `/api/v1/auth/profile` | `Authorization: Bearer {{accessToken}}` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "phoneNumber": "...", "role": "user" } }` |
| **PUT** `/api/v1/auth/profile` | `Authorization: Bearer {{accessToken}}` | **Body (raw JSON - Optional fields):**<br>`{ "name": "John Updated", "email": "newemail@example.com", "profileImage": "http://image-url.com" }` | **200 OK**<br>`{ "success": true, "message": "Profile updated successfully", "data": { ... } }` |

---

### 3.3 User Client Routes

All user client routes require the header: **`Authorization: Bearer {{accessToken}}`**

| Method & URL Path | Request Body / Query Params | Expected Success Response (JSON & Status) |
|:---|:---|:---|
| **GET** `/api/v1/user/celebrities` | **Query Params (Optional):**<br>- `category` (string)<br>- `minPrice` (number)<br>- `maxPrice` (number) | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "bio": "...", "user": { "name": "..." } } ] }` |
| **GET** `/api/v1/user/celebrities/search` | **Query Params:**<br>- `q` (string) | **200 OK**<br>`{ "success": true, "data": [ { ... } ] }` |
| **GET** `/api/v1/user/celebrities/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "bio": "...", "user": { ... } } }` |
| **POST** `/api/v1/user/bookings` | **Body (raw JSON):**<br>`{ "celebrityId": "uuid", "addressId": "uuid", "appearanceType": "live_performance", "amount": 20000.00, "eventDetails": { "eventName": "Wedding Gig", "description": "...", "date": "2026-09-01T18:00:00Z" } }` | **201 Created**<br>`{ "success": true, "message": "Booking request created successfully", "data": { "id": "uuid", "bookingNumber": "BMC...", "status": "pending", "amount": "20000.00" } }` |
| **GET** `/api/v1/user/bookings` | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "bookingNumber": "...", "status": "pending" } ] }` |
| **GET** `/api/v1/user/bookings/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "bookingNumber": "...", "status": "accepted", "event": { ... } } }` |
| **PUT** `/api/v1/user/bookings/:id/cancel` | None | **200 OK**<br>`{ "success": true, "message": "Booking request cancelled successfully", "data": { "id": "uuid", "status": "cancelled" } }` |
| **GET** `/api/v1/user/bookings/:id/status` | None | **200 OK**<br>`{ "success": true, "data": { "status": "accepted", "paymentStatus": "pending" } }` |
| **POST** `/api/v1/user/addresses` | **Body (raw JSON):**<br>`{ "addressLine1": "Flat 202, Heights", "city": "Mumbai", "state": "MH", "country": "India", "postalCode": "400001", "isPrimary": true }` | **201 Created**<br>`{ "success": true, "data": { "id": "uuid", "addressLine1": "...", "isVerified": true } }` |
| **GET** `/api/v1/user/addresses` | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "addressLine1": "..." } ] }` |
| **PUT** `/api/v1/user/addresses/:id` | **Body (raw JSON):**<br>`{ "addressLine1": "Updated Flat 101" }` | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "addressLine1": "..." } }` |
| **PUT** `/api/v1/user/addresses/:id/verify` | None | **200 OK**<br>`{ "success": true, "message": "Address verified successfully", "data": { "id": "uuid", "isVerified": true, "verificationStatus": "verified" } }` |
| **DELETE** `/api/v1/user/addresses/:id` | None | **200 OK**<br>`{ "success": true, "message": "Address deleted successfully" }` |
| **POST** `/api/v1/user/payments` | **Body (raw JSON):**<br>`{ "bookingId": "uuid", "paymentMethod": "card", "paymentGateway": "stripe", "gatewayTransactionId": "ch_mock..." }` | **200 OK**<br>`{ "success": true, "message": "Payment completed successfully and held in escrow", "data": { "id": "uuid", "bookingId": "...", "amount": "20000.00", "status": "success" } }` |
| **GET** `/api/v1/user/payments` | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "amount": "20000.00", "status": "success" } ] }` |
| **GET** `/api/v1/user/payments/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "bookingId": "...", "amount": "..." } }` |
| **GET** `/api/v1/user/payments/status/:id` | None | **200 OK**<br>`{ "success": true, "data": { "status": "success", "gatewayTransactionId": "..." } }` |
| **GET** `/api/v1/user/notifications` | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "title": "Booking Update", "message": "...", "isRead": false } ] }` |
| **PUT** `/api/v1/user/notifications/:id/read` | None | **200 OK**<br>`{ "success": true, "message": "Notification marked as read" }` |
| **PUT** `/api/v1/user/notifications/read-all` | None | **200 OK**<br>`{ "success": true, "message": "All notifications marked as read" }` |
| **POST** `/api/v1/user/notifications/token` | **Body (raw JSON):**<br>`{ "token": "firebase-push-token-string" }` | **200 OK**<br>`{ "success": true, "message": "Device token registered successfully" }` |
| **POST** `/api/v1/user/reviews` | **Body (raw JSON):**<br>`{ "bookingId": "uuid", "rating": 5, "review": "Amazing performance!" }` | **201 Created**<br>`{ "success": true, "data": { "id": "uuid", "bookingId": "...", "rating": 5, "review": "..." } }` |
| **GET** `/api/v1/user/reviews` | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "rating": 5, "review": "..." } ] }` |

---

### 3.4 Celebrity Routes

All celebrity routes require the header: **`Authorization: Bearer {{accessToken}}`** *(User must have a "celebrity" role)*

| Method & URL Path | Request Body / Query Params | Expected Success Response (JSON & Status) |
|:---|:---|:---|
| **GET** `/api/v1/celebrity/dashboard` | None | **200 OK**<br>`{ "success": true, "data": { "totalEarnings": 0, "rating": "0.00", "pendingRequests": 0 } }` |
| **GET** `/api/v1/celebrity/earnings` | None | **200 OK**<br>`{ "success": true, "data": { "walletBalance": "0.00", "pendingEscrow": "0.00" } }` |
| **GET** `/api/v1/celebrity/earnings/history` | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "amount": "15000.00", "type": "credit" } ] }` |
| **GET** `/api/v1/celebrity/profile` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "bio": "...", "stageName": "..." } }` |
| **PUT** `/api/v1/celebrity/profile` | **Multipart-Form Data (Optional):**<br>- File: `profileImage`<br>- File: `videoIntro`<br>- Fields: `bio`, `stageName`, `categories` *(JSON string array)* | **200 OK**<br>`{ "success": true, "message": "Profile updated successfully", "data": { ... } }` |
| **GET** `/api/v1/celebrity/pricing` | None | **200 OK**<br>`{ "success": true, "data": { "minimumPrice": "1500.00", "videoCallRate": "2500.00", "chatRate": "500.00" } }` |
| **PUT** `/api/v1/celebrity/pricing` | **Body (raw JSON):**<br>`{ "minimumPrice": 1500.00, "videoCallRate": 2500.00, "chatRate": 500.00 }` | **200 OK**<br>`{ "success": true, "message": "Pricing updated successfully", "data": { ... } }` |
| **GET** `/api/v1/celebrity/availability` | None | **200 OK**<br>`{ "success": true, "data": { "isAvailable": true, "blockedDates": [] } }` |
| **PUT** `/api/v1/celebrity/availability` | **Body (raw JSON):**<br>`{ "isAvailable": true }` | **200 OK**<br>`{ "success": true, "message": "Availability updated successfully" }` |
| **PUT** `/api/v1/celebrity/availability/block` | **Body (raw JSON):**<br>`{ "blockedDates": ["2026-09-10", "2026-09-11"] }` | **200 OK**<br>`{ "success": true, "message": "Availability blocked dates updated successfully" }` |
| **GET** `/api/v1/celebrity/bookings` | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "bookingNumber": "..." } ] }` |
| **GET** `/api/v1/celebrity/bookings/pending` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/celebrity/bookings/accepted` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/celebrity/bookings/completed` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/celebrity/bookings/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "status": "pending", "user": { "name": "Client Name" } } }` |
| **PUT** `/api/v1/celebrity/bookings/:id/approve` | None | **200 OK**<br>`{ "success": true, "message": "Booking request approved", "data": { "id": "uuid", "status": "accepted" } }` |
| **PUT** `/api/v1/celebrity/bookings/:id/reject` | **Body (raw JSON):**<br>`{ "reason": "Conflict in scheduling" }` | **200 OK**<br>`{ "success": true, "message": "Booking request rejected", "data": { "id": "uuid", "status": "rejected" } }` |
| **POST** `/api/v1/celebrity/galleries` | **Body (raw JSON):**<br>`{ "eventName": "Concert 2026", "eventType": "concert", "eventDate": "2026-05-01", "eventLocation": "Mumbai", "eventDescription": "Grand concert night" }` | **201 Created**<br>`{ "success": true, "data": { "id": "uuid", "eventName": "Concert 2026" } }` |
| **GET** `/api/v1/celebrity/galleries` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/celebrity/galleries/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "eventName": "...", "media": [] } }` |
| **PUT** `/api/v1/celebrity/galleries/:id` | **Body (raw JSON):**<br>`{ "eventName": "Concert 2026 Updated" }` | **200 OK**<br>`{ "success": true, "message": "Gallery updated successfully" }` |
| **DELETE** `/api/v1/celebrity/galleries/:id` | None | **200 OK**<br>`{ "success": true, "message": "Gallery deleted successfully" }` |
| **POST** `/api/v1/celebrity/galleries/:id/media` | **Multipart-Form Data:**<br>- File: `media` *(photo or video)* | **201 Created**<br>`{ "success": true, "message": "Gallery media added successfully", "data": { "id": "uuid", "mediaUrl": "..." } }` |
| **DELETE** `/api/v1/celebrity/galleries/:id/media/:mediaId` | None | **200 OK**<br>`{ "success": true, "message": "Gallery media removed successfully" }` |
| **POST** `/api/v1/celebrity/portfolio` | **Multipart-Form Data:**<br>- File: `portfolio`<br>- Field: `title` (string)<br>- Field: `category` (string)<br>- Field: `mediaType` (string: "image" or "video") | **201 Created**<br>`{ "success": true, "message": "Portfolio item added successfully", "data": { "id": "uuid", "title": "..." } }` |
| **GET** `/api/v1/celebrity/portfolio` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **PUT** `/api/v1/celebrity/portfolio/:id` | **Body (raw JSON):**<br>`{ "title": "New Title" }` | **200 OK**<br>`{ "success": true, "message": "Portfolio item updated successfully" }` |
| **DELETE** `/api/v1/celebrity/portfolio/:id` | None | **200 OK**<br>`{ "success": true, "message": "Portfolio item removed successfully" }` |
| **GET** `/api/v1/celebrity/stats` | None | **200 OK**<br>`{ "success": true, "data": { "totalBookings": 5, "completedBookings": 4, "earnings": 80000.00 } }` |
| **GET** `/api/v1/celebrity/reviews` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/celebrity/analytics` | None | **200 OK**<br>`{ "success": true, "data": { "profileViews": 120, "earningsTrend": [] } }` |

---

### 3.5 Admin Routes

All admin routes require the header: **`Authorization: Bearer {{accessToken}}`** *(User must have an "admin" or "super_admin" role)*

| Method & URL Path | Request Body / Query Params | Expected Success Response (JSON & Status) |
|:---|:---|:---|
| **GET** `/api/v1/admin/dashboard` | None | **200 OK**<br>`{ "success": true, "data": { "totalUsers": 25, "totalCelebrities": 8, "totalRevenue": 240000.00 } }` |
| **GET** `/api/v1/admin/stats` | None | **200 OK**<br>`{ "success": true, "data": { "serverUptime": "...", "databaseStatus": "connected" } }` |
| **GET** `/api/v1/admin/users` | None | **200 OK**<br>`{ "success": true, "data": [ { "id": "uuid", "name": "...", "email": "..." } ] }` |
| **GET** `/api/v1/admin/users/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "name": "...", "addresses": [], "wallet": {} } }` |
| **PUT** `/api/v1/admin/users/:id/role` | **Body (raw JSON):**<br>`{ "role": "celebrity" }` *(role: "user", "celebrity", or "admin")* | **200 OK**<br>`{ "success": true, "message": "User role updated successfully" }` |
| **PUT** `/api/v1/admin/users/:id/status` | **Body (raw JSON):**<br>`{ "status": "suspended" }` *(status: "active" or "suspended")* | **200 OK**<br>`{ "success": true, "message": "User status updated successfully" }` |
| **DELETE** `/api/v1/admin/users/:id` | None | **200 OK**<br>`{ "success": true, "message": "User deleted successfully" }` |
| **GET** `/api/v1/admin/celebrities` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/admin/celebrities/pending` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/admin/celebrities/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "verificationDocs": [...] } }` |
| **PUT** `/api/v1/admin/celebrities/:id/approve` | None | **200 OK**<br>`{ "success": true, "message": "Celebrity profile approved successfully" }` |
| **PUT** `/api/v1/admin/celebrities/:id/reject` | **Body (raw JSON):**<br>`{ "reason": "Missing profile documentation" }` | **200 OK**<br>`{ "success": true, "message": "Celebrity profile rejected" }` |
| **PUT** `/api/v1/admin/celebrities/:id/suspend` | None | **200 OK**<br>`{ "success": true, "message": "Celebrity profile suspended" }` |
| **PUT** `/api/v1/admin/celebrities/:id/verify` | None | **200 OK**<br>`{ "success": true, "message": "Celebrity profile verified successfully" }` |
| **GET** `/api/v1/admin/bookings` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/admin/bookings/filter` | **Query Params:**<br>- `status` (string: "pending", "accepted", "cancelled", etc.) | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/admin/bookings/statistics` | None | **200 OK**<br>`{ "success": true, "data": { "totalBookingsCount": 10 } }` |
| **GET** `/api/v1/admin/bookings/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "bookingNumber": "..." } }` |
| **PUT** `/api/v1/admin/bookings/:id/status` | **Body (raw JSON):**<br>`{ "status": "completed" }` | **200 OK**<br>`{ "success": true, "message": "Booking status updated successfully" }` |
| **GET** `/api/v1/admin/payments` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/admin/payments/reports` | None | **200 OK**<br>`{ "success": true, "data": { "totalProcessed": 100000.00 } }` |
| **GET** `/api/v1/admin/payments/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "amount": "..." } }` |
| **PUT** `/api/v1/admin/payments/:id/release` | None | **200 OK**<br>`{ "success": true, "message": "Escrow payment released to celebrity wallet" }` |
| **PUT** `/api/v1/admin/payments/:id/refund` | None | **200 OK**<br>`{ "success": true, "message": "Payment refunded to client wallet successfully" }` |
| **GET** `/api/v1/admin/events` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/admin/events/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "name": "..." } }` |
| **PUT** `/api/v1/admin/events/:id/status` | **Body (raw JSON):**<br>`{ "status": "cancelled" }` | **200 OK**<br>`{ "success": true, "message": "Event status updated successfully" }` |
| **POST** `/api/v1/admin/categories` | **Body (raw JSON):**<br>`{ "name": "Comedian", "slug": "comedian", "description": "Standup comedy artists", "displayOrder": 3 }` | **201 Created**<br>`{ "success": true, "data": { "id": "uuid", "name": "Comedian" } }` |
| **GET** `/api/v1/admin/categories` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **PUT** `/api/v1/admin/categories/:id` | **Body (raw JSON):**<br>`{ "displayOrder": 1 }` | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "displayOrder": 1 } }` |
| **DELETE** `/api/v1/admin/categories/:id` | None | **200 OK**<br>`{ "success": true, "message": "Category deleted successfully" }` |
| **GET** `/api/v1/admin/commissions` | None | **200 OK**<br>`{ "success": true, "data": { "platformFeePercentage": 10, "commissionPercentage": 15, "releaseDays": 14 } }` |
| **PUT** `/api/v1/admin/commissions` | **Body (raw JSON):**<br>`{ "platformFeePercentage": 10, "commissionPercentage": 15, "releaseDays": 14 }` | **200 OK**<br>`{ "success": true, "message": "Global commissions updated successfully" }` |
| **POST** `/api/v1/admin/commissions/celebrity` | **Body (raw JSON):**<br>`{ "celebrityId": "uuid", "customCommissionPercentage": 12 }` | **201 Created**<br>`{ "success": true, "message": "Custom celebrity commission set successfully" }` |
| **GET** `/api/v1/admin/commissions/celebrity/:id` | None | **200 OK**<br>`{ "success": true, "data": { "celebrityId": "uuid", "customCommissionPercentage": 12 } }` |
| **POST** `/api/v1/admin/commissions/category` | **Body (raw JSON):**<br>`{ "categoryId": "uuid", "customCommissionPercentage": 8 }` | **201 Created**<br>`{ "success": true, "message": "Custom category commission set successfully" }` |
| **GET** `/api/v1/admin/disputes` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/admin/disputes/:id` | None | **200 OK**<br>`{ "success": true, "data": { "id": "uuid", "bookingId": "...", "reason": "No show" } }` |
| **PUT** `/api/v1/admin/disputes/:id/resolve` | **Body (raw JSON):**<br>`{ "resolution": "refund_client", "action": "payout" }` *(resolution: "refund_client" or "payout_celebrity")* | **200 OK**<br>`{ "success": true, "message": "Dispute resolved successfully" }` |
| **PUT** `/api/v1/admin/disputes/:id/reject` | None | **200 OK**<br>`{ "success": true, "message": "Dispute rejected successfully" }` |
| **GET** `/api/v1/admin/reports/analytics` | None | **200 OK**<br>`{ "success": true, "data": {} }` |
| **GET** `/api/v1/admin/reports/payments` | None | **200 OK**<br>`{ "success": true, "data": {} }` |
| **GET** `/api/v1/admin/reports/users` | None | **200 OK**<br>`{ "success": true, "data": {} }` |
| **GET** `/api/v1/admin/reports/celebrities` | None | **200 OK**<br>`{ "success": true, "data": {} }` |
| **GET** `/api/v1/admin/reports/bookings` | None | **200 OK**<br>`{ "success": true, "data": {} }` |
| **GET** `/api/v1/admin/reports/revenue` | None | **200 OK**<br>`{ "success": true, "data": {} }` |
| **GET** `/api/v1/admin/reports/top-celebrities` | None | **200 OK**<br>`{ "success": true, "data": [] }` |
| **GET** `/api/v1/admin/settings` | None | **200 OK**<br>`{ "success": true, "data": { "maintenanceMode": false } }` |
| **PUT** `/api/v1/admin/settings` | **Body (raw JSON):**<br>`{ "maintenanceMode": false }` | **200 OK**<br>`{ "success": true, "message": "System settings updated successfully" }` |
| **GET** `/api/v1/admin/audit-logs` | None | **200 OK**<br>`{ "success": true, "data": [] }` |

