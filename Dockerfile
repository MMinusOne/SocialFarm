FROM node:23.6.0

RUN npm install -g npm typescript

COPY package.json ./

# Remove the problematic install script from package.json
RUN sed -i '/"install": "npm install",/d' package.json

# Install dependencies
RUN npm install --frozen-lockfile

COPY . .

# Run the compiled JavaScript file
CMD ["node", "index.ts"]