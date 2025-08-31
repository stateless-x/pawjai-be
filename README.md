# Pawjai Backend API

A Fastify-based REST API for the Pawjai pet management application, built with TypeScript, Drizzle ORM, and PostgreSQL.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Language**: TypeScript
- **Validation**: Zod
- **Authentication**: Supabase Auth (external)

## Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- PostgreSQL database
- Supabase project (for authentication)

## Setup

### Local Development Setup

1. **Clone and install dependencies**:
   ```bash
   cd pawjai-be
   bun install
   ```

2. **Start your PostgreSQL database** (using your existing Docker command):
   ```bash
   docker run -d \
     --name pawjai-db \
     -e POSTGRES_USER=pawjai_user \
     -e POSTGRES_PASSWORD=pawjai_pass \
     -e POSTGRES_DB=pawjai_db \
     -p 5432:5432 \
     -v pawjai_data:/var/lib/postgresql/data \
     postgres:16-alpine
   ```

3. **Set up the database schema**:
   ```bash
   bun run db:push:local
   bun run db:seed:local
   ```

4. **Start the development server**:
   ```bash
   bun run dev:local
   ```

### Custom Database Setup

1. **Clone and install dependencies**:
   ```bash
   cd pawjai-be
   bun install
   ```

2. **Environment configuration**:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your actual values:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/pawjai_db"
   PORT=4000
   NODE_ENV=development
   
   # CORS Origins (comma-separated)
   ALLOWED_ORIGINS="https://pawjai.co,https://www.pawjai.co,http://localhost:3000,http://localhost:3001"
   
   # Rate Limiting
   RATE_LIMIT_GLOBAL_MAX=100
   RATE_LIMIT_GLOBAL_WINDOW="1 minute"
   RATE_LIMIT_API_MAX=30
   RATE_LIMIT_API_WINDOW="1 minute"
   RATE_LIMIT_AUTH_MAX=5
   RATE_LIMIT_AUTH_WINDOW="15 minutes"
   
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

3. **Database setup**:
   ```bash
   # Generate migration files
   bun run db:generate
   
   # Push schema to database
   bun run db:push
   
   # Or run migrations
   bun run db:migrate
   ```

4. **Start development server**:
   ```bash
   bun run dev
   ```

## Database Schema

The application uses the following main tables:

### 1. user_profiles
- 1:1 relationship with Supabase auth.users
- Stores user identity information (name, phone, birth date, etc.)

### 2. user_personalization
- 1:1 relationship with Supabase auth.users
- Stores lifestyle and AI parameters for recommendations

### 3. breeds
- Breed library for dogs and cats
- Contains comprehensive breed information and characteristics

### 4. pets
- User's pet profiles
- Links to breeds and users

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Auth
- `GET /api/auth/test` - Test authentication
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/profile` - Get current user's profile
- `POST /api/users/profile` - Create/update current user's profile
- `GET /api/users/personalization` - Get current user's personalization
- `POST /api/users/personalization` - Create/update current user's personalization

### Pets
- `GET /api/pets/my-pets` - Get current user's pets
- `GET /api/pets/user/:userId` - Get all pets for a user (admin only)
- `GET /api/pets/:petId` - Get specific pet
- `POST /api/pets` - Create new pet for current user
- `PUT /api/pets/:petId` - Update pet
- `DELETE /api/pets/:petId` - Delete pet

### Breeds
- `GET /api/breeds` - Get all breeds (with optional filtering)
- `GET /api/breeds/:breedId` - Get specific breed
- `POST /api/breeds` - Create new breed
- `PUT /api/breeds/:breedId` - Update breed
- `DELETE /api/breeds/:breedId` - Delete breed
- `GET /api/breeds/species/:species` - Get breeds by species (dog/cat)

## Development

### Available Scripts

#### Development
- `bun run dev` - Start development server with hot reload
- `bun run dev:local` - Start development server with local environment
- `bun run start` - Start production server
- `bun run start:local` - Start production server with local environment
- `bun run build` - Build TypeScript

#### Database Management
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run database migrations locally
- `bun run db:migrate:prod` - Run database migrations in production
- `bun run db:push` - Push schema changes to database (with local env)
- `bun run db:push:local` - Push schema changes to database (with local env)
- `bun run db:studio` - Open Drizzle Studio (with local env)
- `bun run db:seed` - Seed database with sample data (with local env)
- `bun run db:seed:local` - Seed database with sample data (with local env)
- `bun run db:status` - Check migration status
- `bun run db:verify` - Verify deployment health



### Project Structure

```
src/
├── db/
│   ├── index.ts      # Database connection
│   └── schema.ts     # Database schema definitions
├── routes/
│   ├── users.ts      # User-related endpoints
│   ├── pets.ts       # Pet-related endpoints
│   └── breeds.ts     # Breed-related endpoints
└── index.ts          # Main server file
```

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Export a default async function that takes a FastifyInstance
3. Register the route in `src/index.ts`

Example:
```typescript
// src/routes/example.ts
import { FastifyInstance } from 'fastify';

export default async function exampleRoutes(fastify: FastifyInstance) {
  fastify.get('/example', async (request, reply) => {
    return { message: 'Hello from example route!' };
  });
}
```

### Database Operations

Use Drizzle ORM for all database operations:

```typescript
import { db } from '../db';
import { pets } from '../db/schema';
import { eq } from 'drizzle-orm';

// Select
const userPets = await db.select().from(pets).where(eq(pets.userId, userId));

// Insert
const newPet = await db.insert(pets).values(petData).returning();

// Update
const updatedPet = await db.update(pets).set(data).where(eq(pets.id, id)).returning();

// Delete
await db.delete(pets).where(eq(pets.id, id));
```

## Authentication

This API is integrated with Supabase Auth for authentication. All protected endpoints require a valid Supabase JWT token in the Authorization header.

### Authentication Flow

1. **Frontend Authentication**: Users authenticate through Supabase Auth (Google OAuth, email/password, etc.)
2. **Token Verification**: The backend verifies Supabase JWT tokens using the Supabase anon key
3. **User Context**: User information is extracted from the JWT and attached to requests

### Protected Endpoints

All API endpoints (except health check and public breeds) require authentication:

- `GET /api/auth/test` - Test authentication
- `GET /api/auth/me` - Get current user info
- `GET /api/users/profile` - Get current user's profile
- `POST /api/users/profile` - Create/update current user's profile
- `GET /api/pets/my-pets` - Get current user's pets
- `POST /api/pets` - Create a new pet for current user

### Request Headers

Include the Supabase JWT token in the Authorization header:

```
Authorization: Bearer <supabase-jwt-token>
```

### Environment Variables

Make sure to configure these Supabase environment variables:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Testing Authentication

1. Get a JWT token from your Supabase frontend
2. Test the authentication endpoint:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3001/api/auth/test
   ```

## Error Handling

The API includes comprehensive error handling:
- Input validation using Zod schemas
- Database error handling
- HTTP status codes for different error types
- Structured error responses

## CORS

CORS is configured to allow requests from pawjai.co and localhost for development. The allowed origins can be configured via the `ALLOWED_ORIGINS` environment variable (comma-separated list).

Default allowed origins:
- `https://pawjai.co`
- `https://www.pawjai.co`
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)

## Rate Limiting

The API includes comprehensive rate limiting to prevent abuse:

- **Global Rate Limit**: 100 requests per minute
- **API Rate Limit**: 30 requests per minute for `/api/*` endpoints
- **Auth Rate Limit**: 5 requests per 15 minutes for authentication endpoints

Rate limiting configuration can be adjusted via environment variables:
- `RATE_LIMIT_GLOBAL_MAX`
- `RATE_LIMIT_GLOBAL_WINDOW`
- `RATE_LIMIT_API_MAX`
- `RATE_LIMIT_API_WINDOW`
- `RATE_LIMIT_AUTH_MAX`
- `RATE_LIMIT_AUTH_WINDOW`

## Security

- Helmet.js for security headers
- Input validation with Zod
- SQL injection protection via Drizzle ORM
- Environment variable configuration
- Rate limiting to prevent abuse
- CORS configuration for pawjai.co domain

## Deployment

### Railway Deployment (Recommended)

The application is configured for automatic deployment on Railway with automatic database migrations.

#### Railway Configuration (`railway.toml`)

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "bun dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
healthcheckInterval = 30

[deploy.preDeploy]
command = "bun run db:migrate:prod"
```

#### Automatic Deployment Process

1. **Pre-deployment**: Railway automatically runs `bun run db:migrate:prod` to update database schema
2. **Build**: Railway builds your application using Nixpacks
3. **Start**: Railway starts your server with `bun dist/index.js`
4. **Health Check**: Railway monitors `/health` endpoint every 30 seconds
5. **Auto-restart**: Server automatically restarts on failures

#### Railway Environment Variables

Set these in your Railway project:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV="production"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
ALLOWED_ORIGINS="https://pawjai.co,https://www.pawjai.co"
```

### Manual Deployment

1. Set up a PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Build and start the application

```bash
bun run build
bun run db:migrate:prod
bun run start
```

### Migration System

The application includes a comprehensive migration system that ensures your database schema is always up-to-date:

#### Automatic Migrations

- **Pre-deployment**: Railway runs migrations before deploying new code
- **Startup**: Server automatically runs any pending migrations on startup
- **Health monitoring**: Real-time migration status via `/health` and `/api/migrations/status` endpoints
- **Error handling**: Graceful fallbacks and retry mechanisms

#### Migration Commands

```bash
# Generate new migrations
bun run db:generate

# Run migrations locally
bun run db:migrate

# Run migrations in production
bun run db:migrate:prod

# Check migration status
bun run db:status

# Verify deployment
bun run db:verify
```

#### Migration Health Endpoints

- `GET /health` - Enhanced health check with migration status
- `GET /api/migrations/status` - Detailed migration information

#### Production Safety Features

- **Non-destructive operations**: Existing data is always preserved
- **Automatic retries**: Failed migrations retry up to 3 times
- **Graceful degradation**: Server continues running even with migration issues
- **Health monitoring**: Continuous status checking and alerts

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write clear commit messages
5. Test your changes thoroughly 