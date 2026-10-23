import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico, UpdateMedicoDto } from '../models/medico.model';

@Injectable({
  providedIn: 'root'
})
export class MedicosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/medicos';

  getMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.baseUrl);
  }

  getMedico(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.baseUrl}/${id}`);
  }

  updateMedico(id: number, dto: UpdateMedicoDto): Observable<Medico> {
    return this.http.patch<Medico>(`${this.baseUrl}/${id}`, dto);
  }
}
