import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/usuarios';

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  getPacientes(): Observable<Usuario[]> {
    return this.getUsuarios().pipe(
      map((usuarios) =>
        usuarios.filter((u) => u.rol === 'PACIENTE' && u.estado === 'ACTIVO')
      )
    );
  }
}
