FROM node:23.6.0

WORKDIR /app

# Install pnpm and typescript globally
RUN npm install -g pnpm typescript

COPY package.json pnpm-lock.yaml ./

# Remove the problematic install script from package.json
RUN sed -i '/"install": "pnpm install",/d' package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

COPY . .

# Run the compiled JavaScript file
CMD ["node", "index.js"]