# Imagen de desarrollo para FinWise
FROM node:20-alpine

WORKDIR /app

# Copia todo el proyecto (incluye prisma/schema.prisma) antes de instalar,
# para que el postinstall (prisma generate) encuentre el esquema.
COPY . .

# Instala dependencias (el postinstall genera el cliente de Prisma)
RUN npm install

# Doble seguridad: regenera el cliente (idempotente)
RUN npx prisma generate

EXPOSE 6060

# En runtime: aplica migraciones y arranca el servidor dev con hot reload
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
