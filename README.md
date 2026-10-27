# TFI Clínica — Sistema de turnos médicos

Trabajo final integrador de Desarrollo de Aplicaciones Web.

- `backend/`: API REST en NestJS + TypeORM + PostgreSQL, ejecutada con PM2.
- `frontend/`: SPA en Angular + PrimeNG, servida por nginx.
- `nginx/nginx.conf`: configuración de nginx (HTTPS, frontend y proxy de `/api/` al backend).

## Usuarios de prueba

Todos con clave `test123`.

| Rol | Email |
|---|---|
| Administrador | `admin@clinica.com` |
| Médico | `medico@clinica.com` |
| Paciente | `paciente@clinica.com` |

## Requisitos

- Node.js y npm
- PostgreSQL
- PM2: `npm install -g pm2`
- nginx (en Windows, descomprimido por ejemplo en `C:\nginx-1.XX.X`)
- mkcert (para los certificados HTTPS)

## 1. Base de datos

Crear el usuario `daw` y la base `clinica` (los que usa `backend/ecosystem.config.json`) con el script `backend/database/init.sql`. Se ejecuta con `psql` como superusuario (`postgres`), que pide su clave:

```bash
cd backend
npm run db:init
```

Requiere `psql` en el PATH. Se puede ejecutar más de una vez: si el usuario o la base ya existen, no hace nada. Si se usan otros datos, editar el script y la sección `env` de `backend/ecosystem.config.json`.
Las tablas las crea TypeORM al iniciar el backend (`DB_SYNCHRONIZE=true`).

## 2. Backend

Antes del primer `deploy`, crear `backend/.env` a partir de la plantilla y ajustarlo (`DB_USER=daw`, `DB_PASSWORD=2026`, `DB_NAME=clinica`). Lo usa el seed; el backend en PM2 toma sus variables de `ecosystem.config.json`, por lo que ambos deben coincidir:

```bash
cd backend
cp .env.example .env
```

(En Windows: `copy .env.example .env`.)

```bash
npm run deploy
```

`deploy` instala dependencias, compila, crea los usuarios de prueba si no existen (`npm run seed`) y levanta (o reinicia) el backend con PM2 en el puerto 3000 bajo el nombre `clinica-backend`.

Comandos útiles de PM2: `pm2 status`, `pm2 logs clinica-backend`, `pm2 restart clinica-backend`.

## 3. Certificados HTTPS

nginx redirige el puerto 80 a HTTPS, por lo que necesita un certificado para `localhost`. Se generan con mkcert dentro de la carpeta `conf\ssl` de nginx:

1. Abrir una terminal.
2. Navegar a la carpeta `conf` de nginx: `cd C:\nginx-1.XX.X\conf`
3. Crear la carpeta `ssl` y entrar en ella: `mkdir ssl` y `cd ssl`
4. Generar el certificado: `mkcert localhost`

```bash
cd C:\nginx-1.XX.X\conf
mkdir ssl
cd ssl
mkcert localhost
```

Esto crea `localhost.pem` y `localhost-key.pem`, los nombres que usa `nginx/nginx.conf`. Si el navegador no confía en el certificado, ejecutar una vez `mkcert -install` y reiniciar el navegador.

## 4. Frontend

```bash
cd frontend
npm run deploy
```

`deploy` instala dependencias, compila (`dist/frontend/browser`), vacía la carpeta `html` de nginx y copia el build allí.

Por defecto copia a `C:\nginx-1.30.6\html` en Windows y a `/usr/share/nginx/html` en Linux/Mac. Para usar otra carpeta, definir la variable `NGINX_HTML`:

```bash
# Windows (cmd)
set NGINX_HTML=C:\nginx-1.XX.X\html && npm run deploy

# Linux / Mac
NGINX_HTML=/ruta/a/nginx/html npm run deploy
```

El script borra todo el contenido de esa carpeta antes de copiar.

## 5. nginx

1. Copiar `nginx/nginx.conf` a `C:\nginx-1.XX.X\conf\nginx.conf` (reemplaza el archivo original).
2. Iniciar nginx desde `C:\nginx-1.XX.X`:

```bash
start nginx
```

También se puede abrir con doble click en `nginx.exe`. Si la configuración tiene un error (por ejemplo, faltan los certificados), nginx se cierra sin mostrar ningún mensaje; conviene validarla antes con `nginx -t` en la consola.

3. Si se cambia la configuración: `nginx -s reload`. Para detenerlo: `nginx -s stop`.

### Linux

Los pasos de arriba son para Windows. En Linux (probado en Arch) cambian estas rutas:

- Certificados: `/etc/nginx/ssl/localhost.pem` y `/etc/nginx/ssl/localhost-key.pem`.
- Configuración: copiar `nginx/nginx.conf` a `/etc/nginx/nginx.conf`.
- Carpeta de archivos: nginx resuelve `root html;` desde su prefijo (`/etc/nginx` en Arch Linux), donde esa carpeta no existe. Hay que apuntar `root` a la carpeta donde copia el frontend (`/usr/share/nginx/html`, o la de `NGINX_HTML`) en la copia instalada, sin modificar el archivo del repo:

```bash
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo sed -i 's#root html;#root /usr/share/nginx/html;#' /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

El `sed` hay que repetirlo cada vez que se vuelve a copiar la configuración. Para que `npm run deploy` del frontend pueda escribir en `/usr/share/nginx/html` sin `sudo`: `sudo chown -R $USER /usr/share/nginx/html`.

## 6. Uso

- Aplicación: https://localhost (el puerto 80 redirige aquí). nginx envía `/api/` al backend.
- Swagger: http://localhost:3000/docs (directo al backend; nginx solo proxea `/api/`).
- Estado de la API y de la base: http://localhost:3000/

Si el navegador muestra una advertencia de certificado, ejecutar `mkcert -install` en esa máquina.

## Desarrollo

```bash
# Backend (puerto 3000), con un .env configurado
cd backend && npm run start:dev

# Frontend (puerto 4200, el proxy envía /api a localhost:3000)
cd frontend && npm start
```

## Documentación

- Swagger: http://localhost:3000/docs
- Compodoc del frontend: carpeta `frontend/documentation/` (abrir `index.html`) o `npm run compodoc` en `frontend/` para servirla en http://localhost:8080
