import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medico, UpdateValorConsultaRequest } from '../models/medico.models';

@Injectable({ providedIn: 'root' })
export class MedicosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/medicos';

  getMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  getMedico(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/${id}`);
  }

  updateValorConsulta(id: number, body: UpdateValorConsultaRequest): Observable<Medico> {
    return this.http.patch<Medico>(`${this.apiUrl}/${id}/valor-consulta`, body);
  }
}
