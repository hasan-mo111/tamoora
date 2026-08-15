# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native packages (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies for Nest CLI)
RUN npm install

# Copy backend source code
COPY . .

# Build NestJS application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies for native packages
RUN apk add --no-cache libc6-compat

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

# Default port (Render sets process.env.PORT automatically)
EXPOSE 3001

CMD ["node", "dist/main"]
