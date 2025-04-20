# Stage 1: Build the app
FROM node:18-alpine AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Stage 2: Serve using nginx
FROM nginx:alpine

# Copy build output to nginx public dir
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
