# RepairCore container image for Google Cloud Run.
#   docker build -t repaircore .                    -> web server (default target)
#   docker build --target migrate -t repaircore-migrate .  -> `prisma migrate deploy` job

FROM node:24-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

FROM deps AS build
# Build-time values: NEXT_PUBLIC_* are inlined; GCS_BUCKET feeds next.config image hosts.
ARG NEXT_PUBLIC_SITE_URL
ARG GCS_BUCKET
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    GCS_BUCKET=$GCS_BUCKET \
    NEXT_TELEMETRY_DISABLED=1
COPY . .
# Server Actions must be encrypted with the same key on every Cloud Run instance.
RUN --mount=type=secret,id=actions_key,required=false \
    if [ -f /run/secrets/actions_key ]; then export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/actions_key)"; fi; \
    npm run build

FROM deps AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 8080
CMD ["node", "server.js"]
