FROM node:18-slim

WORKDIR /app

# Asılılıqları köçür və quraşdır
COPY package*.json ./
RUN npm install --production

# Bütün server kodlarını köçür
COPY . .

# Hugging Face Spaces üçün mütləq port 7860 olmalıdır
ENV PORT=7860
EXPOSE 7860

# Serveri işə sal
CMD ["node", "index.js"]
