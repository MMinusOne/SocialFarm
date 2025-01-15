# Use Node.js 23.6.0 as the base image
FROM node:23.6.0-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Make sure we're in production mode
ENV NODE_ENV=production

# Expose port 3000
EXPOSE 3000

# Use a more explicit start command
CMD ["sh", "-c", "pnpm run start"]