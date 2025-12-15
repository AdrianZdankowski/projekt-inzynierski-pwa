# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Accept build arguments for chunk configuration
ARG VITE_CHUNK_SIZE
ENV VITE_CHUNK_SIZE=$VITE_CHUNK_SIZE

ARG VITE_CHUNK_THRESHOLD
ENV VITE_CHUNK_THRESHOLD=$VITE_CHUNK_THRESHOLD

# Copy source code
COPY . .

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
