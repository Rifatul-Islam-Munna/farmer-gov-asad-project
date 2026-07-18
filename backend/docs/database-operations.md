# PostgreSQL Operations

## Development synchronization

`DB_SYNCHRONIZE=true` is permitted only for local development. The database module already prevents synchronization when `NODE_ENV=production`.

## Production migration strategy

1. Set `DB_SYNCHRONIZE=false`.
2. Generate a TypeORM migration after reviewing entity changes.
3. Review the SQL for destructive operations.
4. Back up the database before applying the migration.
5. Apply migrations in staging.
6. Run smoke tests.
7. Apply the same reviewed migration in production.
8. Keep migration files in Git.

Never rename or drop production columns through automatic synchronization.

## Index audit rules

Every production query must be reviewed with `EXPLAIN (ANALYZE, BUFFERS)` against realistic data.

Required index patterns:

- tenant-owned tables: `tenant_id` as the first index field when tenancy is implemented;
- listings: status, product/good code, owner, location/search fields and creation date;
- offers/deals: listing, buyer, farmer, status and confirmation date;
- users: unique phone, optional unique email, role and verification status;
- inventory: seller plus product code, active state and stock;
- alerts: user plus creation date and unread state;
- integration settings: unique setting key.

Do not add indexes blindly. Measure write cost and query benefit.

## Soft delete

Entities inheriting `BaseAppEntity` include `deletedAt`. Use TypeORM `softDelete`, `softRemove`, `restore` and `withDeleted` intentionally.

Rules:

- normal reads must not return soft-deleted rows;
- audit-sensitive business records should be soft-deleted instead of physically removed;
- object-storage cleanup must be coordinated separately;
- legal retention rules override user-facing deletion timing;
- hard delete requires an explicit administrative retention process.

## Seed data

Run:

```bash
npm run seed
```

The command is idempotent and currently initializes:

- configured admin account;
- starter goods categories and goods;
- starter market-price rows;
- starter medicine catalog rows.

Do not place production secrets or real personal data in seed files.

## Backup

Example PostgreSQL custom-format backup:

```powershell
pg_dump --format=custom --file=agrivision.backup --host=$env:DB_HOST --port=$env:DB_PORT --username=$env:DB_USERNAME $env:DB_NAME
```

Record:

- backup timestamp;
- application release/version;
- database migration version;
- file checksum;
- encrypted storage location;
- retention/expiry date.

Backups containing personal or commercial data must be encrypted and access-controlled.

## Restore test

Restore into a separate database, never directly over production:

```powershell
createdb agrivision_restore_test
pg_restore --clean --if-exists --no-owner --dbname=agrivision_restore_test agrivision.backup
```

After restore:

1. start the backend against the restored database;
2. call `/health/ready`;
3. test login, profile, listings and admin dashboard;
4. compare important row counts;
5. record restore duration and failures;
6. delete the restore-test database securely after verification.

A backup is not considered valid until a restore test succeeds.
