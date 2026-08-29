# Architecture

This repository contains the NestJS backend for the Cyber Phishing Simulator. It is a
module-organised REST API using Prisma for data access, JWT bearer tokens for
authentication, and a two-layer authorisation model built on role guards and
organisation scoping.

## High-level design

```text
HTTP request (Bearer token)
  |
  v
main.ts -> AppModule
             |
             +-- Global ValidationPipe (DTO validation)
             |
             v
        Feature module
             |
             +-- Controller   (routing, guards, request shape)
             |     |
             |     +-- JwtAuthGuard   -> populates req.user
             |     +-- RolesGuard     -> checks req.user.role
             |
             +-- Service      (business logic, organisation scoping)
             |     |
             |     +-- assertOrganisationAccess()
             |
             +-- PrismaService -> MariaDB adapter -> MySQL
```

## Application bootstrap

- `src/main.ts` creates the Nest application, registers the global validation
  pipe, enables CORS, mounts Swagger, and listens on port 3000.
- The global `ValidationPipe` runs with three options that the whole API relies on:

  | Option | Effect |
  | --- | --- |
  | `whitelist: true` | Strips any property not declared on the DTO |
  | `forbidNonWhitelisted: true` | Rejects the request outright if an undeclared property is present |
  | `transform: true` | Converts incoming JSON into the DTO class instance |

  `forbidNonWhitelisted` is load-bearing for security, not just tidiness. Fields
  omitted from a DTO become impossible to send, which is how `UpdateUserDto`
  prevents a learner from promoting themselves by adding `role` to a PATCH body.

- Swagger UI is served at `/api`, built from `@ApiTags`, `@ApiOperation` and the
  DTO decorators. `addBearerAuth()` enables the Authorize button.

## Application structure

`src/app.module.ts` is the composition root. It lists feature modules only —
never controllers or services from feature folders, which belong to their own
module.

| Module | Responsibility |
| --- | --- |
| `AuthModule` | Login, self-registration, JWT issuing, Passport strategies |
| `UsersModule` | User CRUD, role and organisation rules |
| `OrganisationsModule` | Organisation CRUD with derived member counts |
| `TrainingModulesModule` | Training module CRUD and learner assignment |
| `ScenariosModule` | Phishing scenario CRUD |
| `AttemptsModule` | Learner attempts at scenarios |
| `ResultsModule` | Per-module results and progress |
| `DashboardModule` | Trainer dashboard aggregates and activity feed |
| `PrismaModule` | Shared database client |

Every feature folder follows the same shape:

```text
src/<feature>/
  <feature>.module.ts       wiring
  <feature>.controller.ts   routes, guards, HTTP concerns
  <feature>.service.ts      business logic, database access
  dto/                      request shapes with validation decorators
```

## Dependency injection

Nest resolves constructor parameters from the providers available to the
enclosing module. Three rules follow from that:

- A service is registered in its own module's `providers` array and injected
  through the constructor: `constructor(private prisma: PrismaService) {}`.
- A controller can only be injected with providers from **its own** module, plus
  anything that module imports. Registering a controller in `AppModule` while its
  service lives elsewhere produces `UnknownDependenciesException` at boot.
- `PrismaService` is shared by listing it in `PrismaModule`'s `exports`. Any
  module that needs the database adds `imports: [PrismaModule]`.

`PrismaService` extends `PrismaClient` and implements `OnModuleInit` and
`OnModuleDestroy`, so Nest opens the connection at startup and closes it on
shutdown. Prisma 7 requires an explicit driver adapter, so the constructor builds
a `PrismaMariaDb` adapter from the `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD` and `DB_NAME` environment variables.

## Middleware and request pipeline

The API uses guards and pipes rather than classic Express middleware. A request
passes through these stages in order:

1. **CORS** — restricted to `http://localhost:4200` and `http://localhost:3000`.
2. **`JwtAuthGuard`** — a Passport guard. `JwtStrategy` reads the bearer token,
   verifies it against `JWT_SECRET`, and returns the payload, which Nest attaches
   as `req.user`:

   ```ts
   { userId, email, username, role, organisationId }
   ```

3. **`RolesGuard`** — reads the roles set by the `@Roles()` decorator using
   `Reflector.getAllAndOverride(ROLES_KEY, [handler, class])`. Reading both the
   handler and the class is what allows `@Roles()` to be applied once above a
   whole controller. A route with no `@Roles()` passes through; otherwise
   `req.user.role` must appear in the required list or a `ForbiddenException` is
   thrown.
4. **`ValidationPipe`** — validates and transforms the body against the DTO.
5. **Controller method** — delegates to the service.

Guards run before pipes, so an unauthorised request never reaches validation.

## Authorisation model

Authorisation is enforced in two independent layers, and both are required.

**Layer 1 — role, at the route.** `@Roles(Role.TRAINER, Role.GLOBAL_ADMIN)`
answers "is this kind of user allowed to call this endpoint at all?"

**Layer 2 — organisation, in the service.** `assertOrganisationAccess()` in
`src/common/organisation-access.ts` answers "is this user allowed to touch *this
particular* record?" A global admin passes unconditionally; anyone else must
match the target organisation.

The layers catch different attacks. A learner calling `POST /scenarios` is
stopped by layer 1. A trainer from Organisation A calling
`GET /organisations/2` passes layer 1 — they really are a trainer — and is
stopped by layer 2.

Scenarios have no `organisationId` of their own; they inherit it through their
parent module, so scoping checks load the module alongside the scenario and
compare `module.organisationId`.

### Roles

| Role | Scope |
| --- | --- |
| `GLOBAL_ADMIN` | All organisations. `organisationId` is null. |
| `TRAINER` | One organisation. Manages modules, scenarios and learners within it. |
| `LEARNER` | One organisation. Sees only modules assigned to them. |

Role values are the Prisma enum members and are compared as uppercase strings
throughout. Passing a lowercase literal to `@Roles()` silently matches nothing.

## Business logic conventions

Controllers stay thin: they extract parameters, apply guards, and call a service.
All decision-making lives in services.

- **Response shaping is the service's job.** `UsersService.toSafeUser()` is the
  single exit point for user data and never includes `passwordHash`. Scenario
  reads return the full record to trainers and a five-field subset to learners.
- **Deletes are blocked, not cascaded.** Every foreign key in the schema is
  `ON DELETE RESTRICT`, so the database refuses to remove a row with children.
  Services count dependants first and throw a `ConflictException` naming what is
  in the way, rather than letting Prisma raise an unhandled error. This preserves
  training history, which is compliance evidence.
- **Assignment is idempotent.** Assigning an already-assigned learner returns the
  current list rather than erroring, so a double-clicked button is harmless.
- **Passwords are hashed with bcrypt** at cost factor 10, on create and on
  update. Plaintext passwords never reach the database, and only the account
  owner may change their own password.

## Data model

```text
Organisation 1---* User
     |                \
     |                 *---* ModuleResults
     |                          |
     *---* Module ------------- +
              |
              *---* Scenario
                        |
                        *---* ScenarioAttempt
```

Learner assignment is stored as a JSON array of user ids on
`Module.assignedUsers`. Because the column is `Json?`, services never read it
directly — a helper coerces it to `number[]` and returns an empty array for any
unexpected shape.

## Configuration

| Variable | Used by |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | `PrismaService` adapter |
| `DATABASE_URL` | `prisma.config.ts`, for migrations only |
| `JWT_SECRET` | `JwtStrategy` and `JwtModule` |

`ConfigModule.forRoot({ isGlobal: true })` makes `ConfigService` available
everywhere without repeated imports. Tokens expire after 12 hours.

`prisma/seed.ts` creates one organisation and one account per role for local
development, since only a global admin can create organisations and no
self-service path to that role exists.

## Adding a feature

1. `nest g module <name>`, `nest g controller <name>`, `nest g service <name>`.
2. Add `imports: [PrismaModule]` to the new module so the service can inject
   `PrismaService`.
3. Add the module — and only the module — to `AppModule`'s `imports` array.
4. Create request DTOs under `dto/` with `class-validator` decorators. Omit any
   field that must never be client-supplied.
5. Guard write routes with `@UseGuards(JwtAuthGuard, RolesGuard)` and
   `@Roles(...)`.
6. Call `assertOrganisationAccess()` in the service for anything scoped to an
   organisation.
7. Add `@ApiTags` and `@ApiOperation` so the endpoint appears in Swagger.
