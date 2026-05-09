# Stage 1: Build the React application
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Ensure build tools in .bin are executable in Docker build context
RUN chmod +x node_modules/.bin/*
# We need to build the app, VITE_API_URL can be omitted or passed during build if needed
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
