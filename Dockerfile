# Etapa 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar archivos de configuración de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Copiar todo el código fuente
COPY . .

# Compilar la aplicación para producción
RUN pnpm build

# Etapa 2: Servidor Web
FROM nginx:alpine

# Copiar el build compilado al directorio de Nginx en el contenedor
COPY --from=build /app/dist/peluqueria-frontend/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
