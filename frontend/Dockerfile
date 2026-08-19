# ---------- Build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build app (API base URL can be overridden: --build-arg VITE_API_BASE_URL=...)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY . .
RUN npm run build

# ---------- Serve stage ----------
FROM nginx:alpine

# Runtime config: upstream backend host (Express gateway)
ENV BACKEND_URL=http://express-gateway:5000

# nginx config with SPA fallback + /api proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '$$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]