import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReservasService } from '../../services/reservas.service';
import { MedicosService } from '../../services/medicos.service';
import { Reserva } from '../../models/reserva.model';
import { Medico } from '../../models/medico.model';

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-container">
        <header class="page-header">
          <div>
            <h1>Agenda Médica</h1>
            <p class="subtitle">
              Dr. {{ doctorName() }} - Matrícula: <strong>{{ doctorMatricula() }}</strong>
            </p>
          </div>
          <div class="header-badge">
            <span class="badge-role">Médico Clínico</span>
          </div>
        </header>

        @if (feedbackMessage()) {
          <div class="alert" [class.alert-success]="feedbackType() === 'success'" [class.alert-error]="feedbackType() === 'error'">
            <span>{{ feedbackMessage() }}</span>
            <button class="alert-close" (click)="feedbackMessage.set(null)">×</button>
          </div>
        }

        <div class="filters-card">
          <div class="filter-controls">
            <div class="date-selector">
              <label for="fechaFiltro">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Filtrar por Fecha de Consulta:</span>
              </label>
              <input
                id="fechaFiltro"
                type="date"
                [(ngModel)]="selectedDate"
                (change)="applyDateFilter()"
                class="date-input"
              />
            </div>

            <div class="quick-buttons">
              <button
                type="button"
                class="btn-filter"
                [class.active]="isTodaySelected()"
                (click)="selectToday()"
              >
                Hoy
              </button>
              <button
                type="button"
                class="btn-filter"
                [class.active]="isTomorrowSelected()"
                (click)="selectTomorrow()"
              >
                Mañana
              </button>
              <button
                type="button"
                class="btn-filter"
                [class.active]="showAllDates()"
                (click)="selectAllDates()"
              >
                Ver Todas las Fechas
              </button>
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-value">{{ filteredTurnos().length }}</span>
              <span class="metric-label">Turnos Totales</span>
            </div>
            <div class="metric-item item-green">
              <span class="metric-value">{{ countByEstado('ASISTIO') }}</span>
              <span class="metric-label">Atendidos</span>
            </div>
            <div class="metric-item item-blue">
              <span class="metric-value">{{ countByEstado('PENDIENTE') + countByEstado('CONFIRMADA') }}</span>
              <span class="metric-label">Pendientes</span>
            </div>
            <div class="metric-item item-red">
              <span class="metric-value">{{ countByEstado('CANCELADA') }}</span>
              <span class="metric-label">Ausentes / Canc.</span>
            </div>
          </div>
        </div>

        <div class="turnos-card">
          <div class="card-header">
            <h3>
              @if (showAllDates()) {
                Todos los Turnos Asignados
              } @else {
                Turnos Reservados para el: {{ formatDateDisplay(selectedDate) }}
              }
            </h3>
            <span class="turnos-count">{{ filteredTurnos().length }} turnos encontrados</span>
          </div>

          @if (isLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Cargando turnos de la agenda...</p>
            </div>
          } @else if (filteredTurnos().length === 0) {
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="10" y1="14" x2="14" y2="18"/>
                <line x1="14" y1="14" x2="10" y2="18"/>
              </svg>
              <h4>No hay turnos reservados</h4>
              <p>No se encontraron reservas para la fecha seleccionada.</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="turnos-table">
                <thead>
                  <tr>
                    <th>Horario</th>
                    <th>Paciente</th>
                    <th>Documento</th>
                    <th>Contacto</th>
                    <th>Valor Cita</th>
                    <th>Estado</th>
                    <th class="text-right">Acciones (Médico)</th>
                  </tr>
                </thead>
                <tbody>
                  @for (turno of filteredTurnos(); track turno.id) {
                    <tr>
                      <td class="cell-time">
                        <div class="time-slot">
                          <span class="time-hours">{{ formatSlotHour(turno.fecha_hora) }}</span>
                          <span class="time-date">{{ formatCitaDate(turno.fecha_hora) }}</span>
                        </div>
                      </td>
                      <td class="cell-paciente">
                        <strong>{{ turno.paciente.nombres }} {{ turno.paciente.apellidos }}</strong>
                      </td>
                      <td>{{ turno.paciente.documento }}</td>
                      <td class="cell-email">{{ turno.paciente.email }}</td>
                      <td class="cell-valor">
                        \${{ turno.valor_consulta | number }}
                      </td>
                      <td>
                        <span class="status-badge" [ngClass]="getStatusBadgeClass(turno.estado)">
                          {{ getStatusLabel(turno.estado) }}
                        </span>
                      </td>
                      <td class="cell-actions text-right">
                        @if (turno.estado === 'PENDIENTE' || turno.estado === 'CONFIRMADA') {
                          <div class="action-buttons">
                            <button
                              class="btn-action btn-atendido"
                              (click)="marcarAtendido(turno)"
                              title="Marcar como atendido"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              <span>Atendido</span>
                            </button>
                            <button
                              class="btn-action btn-ausente"
                              (click)="marcarAusente(turno)"
                              title="Marcar como ausente"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              <span>Ausente</span>
                            </button>
                          </div>
                        } @else if (turno.estado === 'ASISTIO') {
                          <span class="status-final final-atendido">✓ Consulta realizada</span>
                        } @else if (turno.estado === 'CANCELADA') {
                          <span class="status-final final-ausente">✕ Ausente / Cancelado</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 2rem 1rem;
      background: #f8fafc;
      min-height: calc(100vh - 70px);
    }
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 1.5rem 2rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .page-header h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #0f172a;
    }
    .subtitle {
      margin: 0.35rem 0 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .badge-role {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.4rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .alert {
      padding: 0.85rem 1.25rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .alert-success {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .alert-error {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .alert-close {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: inherit;
    }
    .filters-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .filter-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .date-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .date-selector label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #334155;
    }
    .date-input {
      padding: 0.5rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      color: #0f172a;
      background: #f8fafc;
    }
    .date-input:focus {
      border-color: #0284c7;
      background: white;
    }
    .quick-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .btn-filter {
      padding: 0.45rem 0.85rem;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      color: #475569;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-filter:hover {
      background: #e2e8f0;
    }
    .btn-filter.active {
      background: #0284c7;
      color: white;
      border-color: #0284c7;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }
    .metric-item {
      background: #f8fafc;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      border-left: 4px solid #94a3b8;
    }
    .metric-item.item-green { border-color: #10b981; }
    .metric-item.item-blue { border-color: #0284c7; }
    .metric-item.item-red { border-color: #ef4444; }
    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
    }
    .metric-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .turnos-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #0f172a;
    }
    .turnos-count {
      font-size: 0.85rem;
      color: #64748b;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .turnos-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .turnos-table th {
      background: #f8fafc;
      padding: 0.85rem 1.25rem;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }
    .turnos-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .cell-time {
      white-space: nowrap;
    }
    .time-slot {
      display: flex;
      flex-direction: column;
    }
    .time-hours {
      font-weight: 700;
      color: #0284c7;
      font-size: 0.95rem;
    }
    .time-date {
      font-size: 0.75rem;
      color: #64748b;
    }
    .cell-valor {
      font-weight: 600;
      color: #0f172a;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .badge-activo { background: #e0f2fe; color: #0369a1; }
    .badge-atendido { background: #dcfce7; color: #15803d; }
    .badge-ausente { background: #fee2e2; color: #b91c1c; }
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-atendido {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #059669;
    }
    .btn-atendido:hover {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }
    .btn-ausente {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }
    .btn-ausente:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }
    .status-final {
      font-size: 0.8rem;
      font-weight: 500;
    }
    .final-atendido { color: #16a34a; }
    .final-ausente { color: #dc2626; }
    .text-right { text-align: right; }
    .loading-state, .empty-state {
      padding: 3rem 1rem;
      text-align: center;
      color: #64748b;
    }
    .empty-state svg {
      margin-bottom: 1rem;
      color: #94a3b8;
    }
    .empty-state h4 {
      margin: 0 0 0.5rem;
      color: #1e293b;
      font-size: 1.1rem;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid #e2e8f0;
      border-top-color: #0284c7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MedicoDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly reservasService = inject(ReservasService);
  private readonly medicosService = inject(MedicosService);

  readonly allTurnos = signal<Reserva[]>([]);
  readonly filteredTurnos = signal<Reserva[]>([]);
  readonly isLoading = signal(true);
  readonly doctorName = signal('');
  readonly doctorMatricula = signal<number | string>('---');
  readonly feedbackMessage = signal<string | null>(null);
  readonly feedbackType = signal<'success' | 'error'>('success');

  selectedDate: string = this.getTodayString();
  showAllDates = signal(false);

  private currentMedicoId: number | null = null;

  ngOnInit(): void {
    this.loadDoctorProfileAndTurnos();
  }

  getTodayString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  getTomorrowString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  }

  isTodaySelected(): boolean {
    return !this.showAllDates() && this.selectedDate === this.getTodayString();
  }

  isTomorrowSelected(): boolean {
    return !this.showAllDates() && this.selectedDate === this.getTomorrowString();
  }

  selectToday(): void {
    this.showAllDates.set(false);
    this.selectedDate = this.getTodayString();
    this.filterTurnos();
  }

  selectTomorrow(): void {
    this.showAllDates.set(false);
    this.selectedDate = this.getTomorrowString();
    this.filterTurnos();
  }

  selectAllDates(): void {
    this.showAllDates.set(true);
    this.filterTurnos();
  }

  applyDateFilter(): void {
    this.showAllDates.set(false);
    this.filterTurnos();
  }

  private loadDoctorProfileAndTurnos(): void {
    this.isLoading.set(true);
    const session = this.authService.session;

    if (!session) {
      this.isLoading.set(false);
      return;
    }

    if (session.usuario) {
      this.doctorName.set(`${session.usuario.nombres} ${session.usuario.apellidos}`);
    }

    this.medicosService.getMedicos().subscribe({
      next: (medicos) => {
        const medico = medicos.find(
          (m) => m.id_usuario === session.id || m.usuario?.id === session.id
        );
        if (medico) {
          this.currentMedicoId = medico.id;
          this.doctorMatricula.set(medico.matricula);
          if (medico.usuario) {
            this.doctorName.set(`${medico.usuario.nombres} ${medico.usuario.apellidos}`);
          }
        }
        this.fetchTurnos();
      },
      error: () => {
        this.fetchTurnos();
      }
    });
  }

  fetchTurnos(): void {
    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        const sessionUserId = this.authService.currentUserId;

        const misTurnos = reservas.filter((r) => {
          if (this.currentMedicoId && r.medico?.id === this.currentMedicoId) {
            return true;
          }
          if (sessionUserId && (r.medico?.id_usuario === sessionUserId || r.medico?.usuario?.id === sessionUserId)) {
            return true;
          }
          return false;
        });

        misTurnos.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());

        this.allTurnos.set(misTurnos);
        this.filterTurnos();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback('Error al cargar la lista de turnos médicos.', 'error');
      }
    });
  }

  filterTurnos(): void {
    if (this.showAllDates()) {
      this.filteredTurnos.set(this.allTurnos());
      return;
    }

    const filtered = this.allTurnos().filter((t) => {
      const fechaCita = new Date(t.fecha_hora);
      const ymd = `${fechaCita.getFullYear()}-${String(fechaCita.getMonth() + 1).padStart(2, '0')}-${String(fechaCita.getDate()).padStart(2, '0')}`;
      return ymd === this.selectedDate;
    });

    this.filteredTurnos.set(filtered);
  }

  marcarAtendido(turno: Reserva): void {
    if (!confirm(`¿Confirma que el paciente ${turno.paciente.nombres} ${turno.paciente.apellidos} fue atendido?`)) {
      return;
    }

    this.reservasService.marcarAtendido(turno.id).subscribe({
      next: () => {
        this.showFeedback(`Turno de las ${this.formatSlotHour(turno.fecha_hora)} marcado como ATENDIDO.`, 'success');
        this.updateLocalTurno(turno.id, 'ASISTIO');
      },
      error: () => {
        this.showFeedback('Error al registrar atención del turno.', 'error');
      }
    });
  }

  marcarAusente(turno: Reserva): void {
    if (!confirm(`¿Confirma que el paciente ${turno.paciente.nombres} ${turno.paciente.apellidos} estuvo ausente?`)) {
      return;
    }

    this.reservasService.marcarAusente(turno.id).subscribe({
      next: () => {
        this.showFeedback(`Turno de las ${this.formatSlotHour(turno.fecha_hora)} marcado como AUSENTE.`, 'success');
        this.updateLocalTurno(turno.id, 'CANCELADA');
      },
      error: () => {
        this.showFeedback('Error al registrar ausencia del paciente.', 'error');
      }
    });
  }

  private updateLocalTurno(id: number, nuevoEstado: Reserva['estado']): void {
    const list = this.allTurnos().map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t));
    this.allTurnos.set(list);
    this.filterTurnos();
  }

  countByEstado(estado: string): number {
    return this.filteredTurnos().filter((t) => t.estado === estado).length;
  }

  formatSlotHour(isoDate: string): string {
    const d = new Date(isoDate);
    const start = String(d.getHours()).padStart(2, '0') + ':00';
    const end = String(d.getHours() + 1).padStart(2, '0') + ':00';
    return `${start} - ${end} hs`;
  }

  formatCitaDate(isoDate: string): string {
    const d = new Date(isoDate);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  formatDateDisplay(ymd: string): string {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case 'ASISTIO':
        return 'badge-atendido';
      case 'CANCELADA':
        return 'badge-ausente';
      default:
        return 'badge-activo';
    }
  }

  getStatusLabel(estado: string): string {
    switch (estado) {
      case 'ASISTIO':
        return 'Atendido';
      case 'CANCELADA':
        return 'Ausente / Cancelado';
      case 'CONFIRMADA':
        return 'Confirmada';
      default:
        return 'Activo / Pendiente';
    }
  }

  private showFeedback(msg: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set(msg);
    this.feedbackType.set(type);
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 5000);
  }
}
