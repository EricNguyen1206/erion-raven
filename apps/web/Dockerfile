# ================================================
# DEPENDENCIES STAGE (install dependencies)
# ================================================
FROM node:24.4.1-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files for workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy package.json files for all packages needed by web
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/
COPY packages/config/eslint/package.json ./packages/config/eslint/
COPY packages/config/prettier/package.json ./packages/config/prettier/
COPY packages/config/tsconfig/package.json ./packages/config/tsconfig/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ================================================
# BUILD STAGE (build the application)
# ================================================
FROM node:24.4.1-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY apps/web ./apps/web
COPY packages ./packages

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Accept build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

# Set environment variables from build arguments
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Build shared packages first
WORKDIR /app/packages/validators
RUN pnpm build || true

# Build the Next.js application
WORKDIR /app/apps/web
RUN pnpm build

# ================================================
# RUNTIME STAGE (run the application)
# ================================================
FROM node:24.4.1-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy the standalone output (which includes server.js and internal Next.js files)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# The standalone output creates symlinks to node_modules, we need to copy the actual pnpm store
# Copy the full node_modules from deps stage to resolve symlinks
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy static files and public folder to the correct locations
# Copy to apps/web path (for monorepo structure)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
# Also copy to root .next/static (server.js at root may look here)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["node", "server.js"]
