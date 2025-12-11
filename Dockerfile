# # Dependencies
# FROM oven/bun:1 AS deps
# WORKDIR /app
# COPY . .
# RUN bun install --frozen-lockfile
#
# # Prisma
# FROM node:20-slim AS prisma
# WORKDIR /app
# # openssl for prisma generate
# RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
# COPY --from=deps /app/node_modules ./node_modules
# COPY ./prisma ./prisma
# COPY ./prisma.config.ts ./prisma.config.ts
# # Prisma needs DATABASE_URL even for generate, so give it a harmless dummy value
# ENV DATABASE_URL="file:./dev.db"
# RUN npx prisma generate
#
# # Build
# FROM oven/bun:1 AS build 
# WORKDIR /app
# COPY --from=deps /app/. . 
# COPY --from=prisma /app/prisma ./prisma
# RUN bun run build
#
# # Start
# FROM oven/bun:1 AS start 
# WORKDIR /app
# # openssl for prisma runtime 
# RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
# COPY --from=build /app/package.json ./package.json
# COPY --from=build /app/dist ./dist
#
# ENV PORT=3000
# EXPOSE 3000
#
# CMD ["bun", "run", "start"]
#
FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
# Prisma needs DATABASE_URL even for generate, so give it a harmless dummy value
ENV DATABASE_URL="file:./dev.db"
RUN bun run db:gen
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]

