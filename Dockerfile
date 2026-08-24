# Imagen de desarrollo para FinWise
FROM node:20-alpine

WORKDIR /app

# Dependencias primero para aprovechar la caché de capas
COPY package.json package-lock.json ./
RUN npm install

# Resto del proyecto
COPY . .

# Genera el cliente de Prisma (no depende de la base de datos)
RUN npx prisma generate

EXPOSE 6060

# En runtime: sincroniza el esquema y arranca el servidor dev con hot reload
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run dev"]
