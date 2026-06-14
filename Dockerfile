# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build backend and frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/node_modules ./frontend/node_modules

# Copy required files
COPY package*.json ./
COPY token.info ./token.info

# Expose ports
EXPOSE 3001 5173

# Set environment
ENV PORT=3001
ENV NODE_ENV=production

# Run server
CMD ["node", "dist/server.js"]
