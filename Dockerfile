# Campus Infra — Global Calendar (Multi-stage)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/global-calendar/package.json ./apps/global-calendar/

# Ensure shared-ui package.json exists for workspace resolution
RUN mkdir -p packages/shared-ui && \
    echo '{"name":"@campus-infra/shared-ui","version":"0.0.1","private":true}' > packages/shared-ui/package.json

# CRITICAL: Copy Prisma schema BEFORE npm ci so postinstall (prisma generate) succeeds
COPY apps/global-calendar/prisma ./apps/global-calendar/prisma/

RUN npm ci || npm install

FROM deps AS prisma
WORKDIR /app

FROM prisma AS builder
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN cd apps/global-calendar && npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/global-calendar/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/global-calendar/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/global-calendar/.next/static ./.next/static

COPY --from=builder /app/apps/global-calendar/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/global-calendar/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/apps/global-calendar/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# `/api/health` is behind session middleware (401 -> unhealthy); `/health` is
# public and also verifies DB connectivity. Probe that instead.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
