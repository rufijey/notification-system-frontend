# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build the application (using the copied .env files)
RUN npm run build


# --- Stage 2: Production Runner Stage ---
FROM nginx:1.25-alpine AS runner

# Copy custom nginx config for SPA routing and compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
