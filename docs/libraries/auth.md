
# Auth Library (@app/auth)

## 1. Overview
`@app/auth` is a reusable authentication library for NestJS-based microservices and monolithic apps.  
It provides:

- Email & password registration (Password optional)  
- Email-based OTP verification  
- JWT access & refresh tokens  
- Configurable OTP expiry & retry limits  
- Optional JWT Guard for token validation  

The library handles both onboarding and authentication workflows with minimal setup.  
It depends on `@app/email` for sending emails; if not installed, install manually.

---

## 2. Core Features

### 2.1 Email Registration & Verification
- Registration stored temporarily in `lib_auth_users_temperory`.  
- After OTP verification, migrated to `lib_auth_users`.  
- Verification emails sent via configured SMTP.

**SMTP keys from `.env`:**
```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_SECURE=false
SMTP_FROM_EMAIL=
```

### 2.2 JWT & Refresh Tokens
- Provides access & refresh tokens.  
- Short-lived access tokens for API requests.  
- Long-lived refresh tokens with rotation policy.

**JWT keys in `.env`:**
```env
JWT_KEY=your_jwt_secret
JWT_EXPIRY=3600s
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRY=30d
```

> Generate key:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```
Verify on [jwt.io](https://www.jwt.io/).

### 2.3 OTP Authentication
- Email-only OTP.  
- Configurable expiry & attempt limits.  
- Tracks failed/expired attempts to prevent abuse.

### 2.4 JWT Guard (Optional)
- Validate access tokens and attach decoded info to request.  
- Can be applied at route/controller level.

### 2.5 Configurable Limits & Expiry
- OTP expiry & resend limits fetched dynamically from `lib_system_configuration`.  
- Extensible to other parameters like max login attempts.

---

## 3. Installation & Integration

### 3.1 Library Registration
Import into your app module:
```ts
// Optional EmailModule import
let EmailModule: any;
try { ({ EmailModule } = require('libs/email/src')); } catch(e){ EmailModule=null; }

// Optional AuthModule import
let AuthModule: any;
try { ({ AuthModule } = require('libs/auth/src')); } catch(e){ AuthModule=null; }

@Module({
  imports: [
    ...(AuthModule ? [AuthModule] : []),
    ...(EmailModule ? [EmailModule] : []),
  ],
})
export class AppModule {}
```

### 3.2 Environment Variables
- `JWT_KEY`, `JWT_EXPIRY`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRY`  
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`  
- Required DB tables:  
  - `lib_auth_users_temperory`  
  - `lib_auth_users`  
  - `lib_auth_users_otp`  
  - `lib_system_configuration`  

---

## 4. Database Structure

### 4.1 Temporary User Table
`lib_auth_users_temperory` stores users pending verification.

```sql
CREATE TABLE lib_auth_users_temperory (
  id serial PRIMARY KEY,
  uuid uuid DEFAULT uuid_generate_v4() NOT NULL,
  first_name varchar,
  last_name varchar,
  email varchar NOT NULL UNIQUE,
  phone varchar UNIQUE,
  password varchar,
  is_verified bool DEFAULT false,
  verified_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### 4.2 Active User Table
`lib_auth_users` stores verified users.

### 4.3 OTP Table
`lib_auth_users_otp` tracks OTP requests.

### 4.4 System Config Table
`lib_system_configuration` stores OTP rules:
- `LOGIN_OTP_EXPIRY_TIME`  
- `LOGIN_OTP_TIME`  
- `LOGIN_OTP_LIMIT`  

---

## 5. Authentication Flow

### 5.1 Registration
1. User submits email/password.  
2. Stored in `lib_auth_users_temperory`.  
3. OTP sent via SMTP.  
4. OTP verified → moved to `lib_auth_users`.  

### 5.2 Login
1. User logs in via email/password.  
2. Optional OTP verification.  
3. Tokens issued (access & refresh).  

### 5.3 Token Refresh
- Issue new access & refresh tokens.  
- Rotation enabled.  
- Logout clears refresh token.

---

## 6. JWT Guard
- Authenticates incoming requests via JWT.  
- Optional import in other modules:  
```ts
@UseGuards(OptionalJwtAuthGuard)
```

---

## 7. Error Handling & Responses
- Standardized error messages for invalid credentials, expired OTP, token issues, inactive users.

---

## 8. Security Practices
- Passwords hashed with bcrypt.  
- Short-lived OTPs.  
- Refresh tokens rotated regularly.  
- JWTs include minimal claims.

---

## 9. Extensibility
- OTP Providers: Email now, SMS/WhatsApp later.  
- Custom configs & guard injection possible.  

---

## 10. Summary
`@app/auth` and `@app/email` simplify authentication in NestJS apps:

- Ready-to-use registration, OTP, login flow  
- Configurable security & token rotation  
- Pluggable for JWT guards & providers  

> Only requires configuring SMTP & JWT, importing AuthModule, and optionally using JWT Guard.

---

## 11. API Endpoints

```ts
@Controller('auth')
export class AuthController {
  @Post('register') register(@Body() dto: RegisterDto) {}
  @Get('verify') verify(@Query('token') token: string) {}
  @Post('login') login(@Body() dto: LoginDto) {}
  @Post('sent-otp') sentOtp(@Body() dto: SentOtpDto) {}
  @Post('verify-otp') verifyOtp(@Body() dto: OtpDto) {}
  @Post('refresh') refreshToken(@Body('refreshToken') token: string) {}
  @Post('logout') @UseGuards(AuthGuard('jwt')) logout(@Req() req) {}
}
``` 
