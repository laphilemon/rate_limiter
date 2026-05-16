# Stage 1: Build 
FROM node:22-alpine3.18 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
# Compile TypeScript to JavaScript here
RUN npm run build 

# Stage 2: Production 
FROM node:22-alpine3.18 AS production
WORKDIR /usr/src/app

# 1. Only copy files needed to run the app
COPY package*.json ./

# 2. Install ONLY production dependencies (no TypeScript, no linters)
# This keeps the image size small and secure
RUN npm install --omit=dev

# 3. Copy ONLY the compiled JS from the build stage
# Replace 'dist' with your actual output folder if it's different
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 9090

# 4. Use the production command
CMD ["node", "dist/server.js"]