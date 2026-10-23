import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoUsuario, RolUsuario } from '../enums/usuario.enums';
import { FiltroUsuarios, Usuario } from '../models/usuario.models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/usuarios';

  getUsuarios(filtro: FiltroUsuarios = {}): Observable<Usuario[]> {
    const params = new HttpParams({ fromObject: { ...filtro } });
    return this.http.get<Usuario[]>(this.apiUrl, { params });
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  getPacientes(): Observable<Usuario[]> {
    return this.getUsuarios({ rol: RolUsuario.PACIENTE, estado: EstadoUsuario.ACTIVO });
  }
}
