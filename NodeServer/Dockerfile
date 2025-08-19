# NodeServer/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Avoid copying huge node_modules from repo
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy app source
COPY . .

# Recommended: set NODE_ENV
ENV NODE_ENV=production
# Render injects PORT dynamically; default fallback
ENV PORT=10000

EXPOSE 10000

# Start the server
CMD ["node", "index.js"]
