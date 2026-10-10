#!/bin/sh
set -e

# Apply pending migrations, then start Next.js.
npx prisma migrate deploy

exec pnpm start
