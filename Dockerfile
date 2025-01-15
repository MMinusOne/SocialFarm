FROM node:23.6.0-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Just run the script once and exit
CMD ["pnpm", "run", "start"]