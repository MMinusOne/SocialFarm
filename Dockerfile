FROM node:23.6.0-bookworm
# Install Chrome dependencies
RUN apt-get update
RUN apt install -y \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libgbm-dev \
    libasound2 \
    libxrandr2 \
    libxkbcommon-dev \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libatk-bridge2.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libcups2

RUN npm install -g npm typescript

COPY package.json tsconfig.json package*.json yarn.lock* pnpm-lock.yaml* bun.lockb* bun.lock* tsconfig.json* remotion.config.* ./

# Install dependencies
RUN npm install --frozen-lockfile
RUN npx remotion browser ensure

COPY . .

# Run the compiled JavaScript file
CMD ["node", "index.ts"]