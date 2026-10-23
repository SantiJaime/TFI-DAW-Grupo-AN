import { HttpErrorResponse } from '@angular/common/http';

/** Arma el mensaje para el usuario a partir de un error del backend */
export function mensajeError(err: HttpErrorResponse, porDefecto: string): string {
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Intente nuevamente más tarde.';
  }
  const mensaje = err.error?.message;
  if (Array.isArray(mensaje)) {
    return mensaje.join('. ');
  }
  return mensaje ?? porDefecto;
}
