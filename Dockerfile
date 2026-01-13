# ---------- Base image ----------
FROM node:20-alpine

# ---------- Set working directory ----------
WORKDIR /app

# ---------- Install dependencies ----------
COPY package*.json ./
RUN npm install

# ---------- Copy source code ----------
COPY . .

# ---------- Build the app ----------
RUN npm run build

# ---------- Expose port ----------
EXPOSE 3000

# ---------- Start the app ----------
CMD ["node", "dist/main.js"]
