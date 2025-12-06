# NestJS Authentication System

A robust authentication system supporting both user login via JWT and service-to-service access via API keys.

## Features

- ✅ User signup and login with JWT tokens
- ✅ API key generation for service-to-service authentication
- ✅ Flexible authentication (supports both JWT and API keys)
- ✅ API key expiration and revocation
- ✅ Secure password and API key hashing
- ✅ TypeORM database integration
- ✅ Full TypeScript type safety

## Tech Stack

- **NestJS** - Backend framework
- **TypeORM** - Database ORM
- **MySQL** - Database
- **Passport** - Authentication middleware
- **JWT** - Token-based authentication
- **bcrypt** - Password and API key hashing

## Installation

```bash
# Install dependencies
npm install

# Configure environment variables (see .env.example)
cp .env.example .env

# Run the application
npm run start:dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=auth_db
```

## Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE auth_db;
```

The application will automatically create tables on first run (synchronize: true in development).

## API Endpoints

### Authentication

#### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "userId": "uuid",
  "email": "user@example.com"
}
```

### API Key Management

#### Create API Key
```http
POST /keys/create
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Production Service Key",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Production Service Key",
  "key": "sk_live_abc123def456...",
  "prefix": "sk_live_abc123d",
  "expiresAt": "2025-12-31T23:59:59Z",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

⚠️ **Important:** The `key` field is only returned once. Store it securely.

#### List API Keys
```http
GET /keys
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Production Service Key",
    "prefix": "sk_live_abc123d",
    "isRevoked": false,
    "expiresAt": "2025-12-31T23:59:59Z",
    "lastUsedAt": "2024-01-15T12:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Revoke API Key
```http
DELETE /keys/:keyId
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "API key revoked successfully"
}
```

### Protected Routes Examples

#### JWT Only Route
```http
GET /user-only
Authorization: Bearer <your-jwt-token>
```

#### API Key Only Route
```http
GET /service-only
X-API-Key: sk_live_abc123def456...
```

#### Flexible Route (JWT or API Key)
```http
# With JWT
GET /flexible
Authorization: Bearer <your-jwt-token>

# OR with API Key
GET /flexible
X-API-Key: sk_live_abc123def456...
```

## Authentication Methods

### 1. JWT Authentication
Used for regular user access. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### 2. API Key Authentication
Used for service-to-service communication. Include the API key in a custom header:

```
X-API-Key: sk_live_abc123def456...
```

### 3. Flexible Authentication
Endpoints can accept either JWT or API Key, providing maximum flexibility for different clients.

## Guard Usage in Controllers

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from './api-keys/guards/api-key.guard';
import { FlexibleAuthGuard } from './api-keys/guards/flexible-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller('example')
export class ExampleController {
  
  // JWT only
  @UseGuards(JwtAuthGuard)
  @Get('user-endpoint')
  getUserData(@CurrentUser() user) {
    return { userId: user.userId };
  }

  // API Key only
  @UseGuards(ApiKeyGuard)
  @Get('service-endpoint')
  getServiceData(@CurrentUser() user) {
    return { keyId: user.keyId };
  }

  // Either JWT or API Key
  @UseGuards(FlexibleAuthGuard)
  @Get('flexible-endpoint')
  getFlexibleData(@CurrentUser() user) {
    return { userId: user.userId };
  }
}
```

## Security Features

### Password Security
- Passwords hashed using bcrypt with salt rounds of 10
- Never stored or transmitted in plain text

### API Key Security
- Keys generated using cryptographically secure random bytes
- Keys hashed before storage (not reversible)
- Plain text key returned only once during creation
- Keys prefixed with `sk_live_` for easy identification

### API Key Management
- **Expiration**: Keys can have expiration dates
- **Revocation**: Keys can be revoked (soft delete)
- **Tracking**: Last usage timestamp recorded
- **Scoping**: Keys tied to specific users

### Input Validation
- All DTOs use class-validator decorators
- Email format validation
- Password minimum length enforcement
- Request body whitelist filtering

## Project Structure

```
src/
├── auth/
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── signup.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── types/
│   │   ├── auth-user.type.ts
│   │   └── request-with-user.interface.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.module.ts
│   └── users.service.ts
├── api-keys/
│   ├── dto/
│   │   └── create-api-key.dto.ts
│   ├── entities/
│   │   └── api-key.entity.ts
│   ├── guards/
│   │   ├── api-key.guard.ts
│   │   └── flexible-auth.guard.ts
│   ├── strategies/
│   │   └── api-key.strategy.ts
│   ├── api-keys.controller.ts
│   ├── api-keys.module.ts
│   └── api-keys.service.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
```

## Testing

### Manual Testing with cURL

```bash
# Signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create API Key
curl -X POST http://localhost:3000/keys/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key"}'

# Access with JWT
curl http://localhost:3000/user-only \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Access with API Key
curl http://localhost:3000/service-only \
  -H "X-API-Key: YOUR_API_KEY"
```

### Testing with Postman/Insomnia

1. **Import the collection** (if provided)
2. **Set up environment variables:**
   - `base_url`: http://localhost:3000
   - `jwt_token`: (will be set after login)
   - `api_key`: (will be set after key creation)

## Common Use Cases

### Mobile App + Backend Service
- **Mobile App**: Uses JWT for user authentication
- **Backend Service**: Uses API key for automated tasks
- Both can access the same resources via flexible endpoints

### Multi-Tenant System
- Each tenant gets their own API keys
- Track usage per tenant via `lastUsedAt`
- Revoke keys when tenant subscription expires

### External Integrations
- Third-party services use API keys
- Internal tools use JWT
- Same endpoints serve both with different permissions

## Error Handling

| Status Code | Error Message | Cause |
|-------------|--------------|-------|
| 401 | Invalid credentials | Wrong email/password during login |
| 401 | Invalid API key | API key doesn't exist or is revoked |
| 401 | API key missing | No X-API-Key header provided |
| 401 | No authentication provided | Neither JWT nor API key provided |
| 409 | Email already exists | Signup with existing email |

## Production Considerations

### Before Deploying

1. **Disable TypeORM Synchronize**
   ```typescript
   TypeOrmModule.forRoot({
     synchronize: false, // CRITICAL: Set to false
   })
   ```

2. **Use Strong JWT Secret**
   - Generate: `openssl rand -base64 32`
   - Store in environment variable
   - Never commit to version control

3. **Add Rate Limiting**
   ```bash
   npm install @nestjs/throttler
   ```

4. **Enable CORS**
   ```typescript
   app.enableCors({
     origin: process.env.ALLOWED_ORIGINS?.split(','),
   });
   ```

5. **Add Logging**
   - Log authentication attempts
   - Log API key usage
   - Monitor for suspicious activity

6. **Database Migrations**
   - Use TypeORM migrations instead of synchronize
   - Version control your schema changes

## Troubleshooting

### "Invalid credentials" on Login
- Verify email exists in database
- Check password is correct
- Ensure bcrypt comparison is working

### "API key missing"
- Check header name is exactly `X-API-Key`
- Ensure API key is not expired
- Verify key is not revoked

### TypeORM Connection Errors
- Verify database credentials in .env
- Ensure database exists
- Check MySQL is running

### JWT Validation Fails
- Verify JWT_SECRET matches between sign and verify
- Check token hasn't expired (default 24h)
- Ensure Bearer prefix is included

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue in the repository.