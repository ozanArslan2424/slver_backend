# ============================
# Stage 1: Node builder (for Prisma)
# ============================
FROM node:20-slim AS builder

WORKDIR /app

# Prisma needs DATABASE_URL even for generate, so give it a harmless dummy value
ENV DATABASE_URL="file:./dev.db"

# Install openssl for Prisma engine downloads
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Copy package files
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies with npm so Prisma can install
RUN npm install

# Copy the full project
COPY . .

# Generate Prisma client (safe now because DATABASE_URL exists)
RUN npx prisma generate

# Optional build step
RUN npm run build || true



# ============================
# Stage 2: Bun runtime
# ============================
FROM oven/bun:1 AS runtime

WORKDIR /app

# Install openssl (Prisma needs it at runtime)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Copy built files + prisma artifacts + node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app ./

# Fly runtime will inject the real DATABASE_URL here
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "start"]
