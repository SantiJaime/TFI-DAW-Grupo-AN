import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const carpetaPorDefecto =
  process.platform === 'win32' ? 'C:\\nginx-1.30.6\\html' : '/usr/share/nginx/html';
const destino = resolve(process.env.NGINX_HTML ?? carpetaPorDefecto);
const origen = resolve('dist', 'frontend', 'browser');
const accion = process.argv[2];

if (accion === 'limpiar') {
  if (!existsSync(destino)) {
    console.error(`No existe la carpeta de nginx: ${destino}`);
    process.exit(1);
  }
  for (const nombre of readdirSync(destino)) {
    rmSync(join(destino, nombre), { recursive: true, force: true });
  }
  console.log(`Carpeta limpiada: ${destino}`);
} else if (accion === 'llenar') {
  if (!existsSync(origen)) {
    console.error(`No existe el build del frontend: ${origen}`);
    process.exit(1);
  }
  cpSync(origen, destino, { recursive: true });
  console.log(`Frontend copiado a: ${destino}`);
} else {
  console.error('Uso: node scripts/nginx.mjs <limpiar|llenar>');
  process.exit(1);
}
