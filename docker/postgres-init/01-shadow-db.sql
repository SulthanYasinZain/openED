-- Shadow database used by `prisma migrate dev`. Runs once on first container start.
SELECT 'CREATE DATABASE opened_shadow' WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'opened_shadow'
)\gexec
