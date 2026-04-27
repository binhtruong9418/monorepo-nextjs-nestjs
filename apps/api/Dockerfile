FROM node:20-alpine AS base

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@2
COPY . .
RUN turbo prune api --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages ./packages
COPY --from=pruner /app/out/full/ .
RUN yarn turbo run build --filter=api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 api
COPY --from=builder --chown=api:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/packages ./packages
USER api
EXPOSE 5000
CMD ["node", "apps/api/dist/main"]
