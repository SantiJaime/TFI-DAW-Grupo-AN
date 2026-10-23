import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReservasService } from '../../services/reservas.service';
import { MedicosService } from '../../services/medicos.service';
import { Reserva, CreateReservaDto } from '../../models/reserva.model';
import { Medico } from '../../models/medico.model';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-container">
        <header class="page-header">
          <div>
            <h1>Portal del Paciente</h1>
            <p class="subtitle">
              Bienvenido/a, <strong>{{ patientName() }}</strong> (DNI: {{ patientDocumento() }})
            </p>
          </div>
          <div class="header-badge">
            <span class="badge-role">Atención Médica Clínica</span>
          </div>
        </header>

        @if (feedbackMessage()) {
          <div class="alert" [class.alert-success]="feedbackType() === 'success'" [class.alert-error]="feedbackType() === 'error'">
            <span>{{ feedbackMessage() }}</span>
            <button class="alert-close" (click)="feedbackMessage.set(null)">×</button>
          </div>
        }

        <div class="tabs-nav">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'turnos'"
            (click)="activeTab.set('turnos')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Mis Turnos Reservados ({{ misTurnos().length }})</span>
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'reservar'"
            (click)="activeTab.set('reservar')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Reservar Nuevo Turno</span>
          </button>
        </div>

        @if (activeTab() === 'turnos') {
          <div class="turnos-card">
            <div class="card-header">
              <h3>Historial de Turnos y Próximas Citas</h3>
              <button class="btn-primary-sm" (click)="activeTab.set('reservar')">
                + Solicitar Turno
              </button>
            </div>

            @if (isLoading()) {
              <div class="loading-state">
                <div class="spinner"></div>
                <p>Cargando sus turnos...</p>
              </div>
            } @else if (misTurnos().length === 0) {
              <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h4>No posee turnos reservados</h4>
                <p>Reserve un turno médico clínico con hasta 30 días de anticipación.</p>
                <button class="btn-primary" (click)="activeTab.set('reservar')">
                  Reservar mi primer turno
                </button>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="turnos-table">
                  <thead>
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>Médico Asignado</th>
                      <th>Matrícula</th>
                      <th>Valor Congelado</th>
                      <th>Estado</th>
                      <th class="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (turno of misTurnos(); track turno.id) {
                      <tr>
                        <td class="cell-time">
                          <div class="time-slot">
                            <span class="time-hours">{{ formatSlotHour(turno.fecha_hora) }}</span>
                            <span class="time-date">{{ formatFechaDisplay(turno.fecha_hora) }}</span>
                          </div>
                        </td>
                        <td>
                          <strong>Dr/a. {{ turno.medico.usuario ? (turno.medico.usuario.nombres + ' ' + turno.medico.usuario.apellidos) : 'Médico Clínico' }}</strong>
                        </td>
                        <td>{{ turno.medico.matricula }}</td>
                        <td class="cell-valor">
                          \${{ turno.valor_consulta | number }}
                          <span class="tag-frozen" title="Valor congelado al momento de la reserva">Congelado</span>
                        </td>
                        <td>
                          <span class="status-badge" [ngClass]="getStatusBadgeClass(turno.estado)">
                            {{ getStatusLabel(turno.estado) }}
                          </span>
                        </td>
                        <td class="text-right">
                          @if (turno.estado === 'PENDIENTE' || turno.estado === 'CONFIRMADA') {
                            @if (canCancelTurno(turno.fecha_hora)) {
                              <button
                                class="btn-cancel"
                                (click)="cancelarTurno(turno)"
                                title="Cancelar reserva (permitido hasta el día anterior)"
                              >
                                Cancelar Turno
                              </button>
                            } @else {
                              <span
                                class="cancel-notice"
                                title="Regla de negocio: la cancelación solo está permitida hasta el día anterior a la consulta"
                              >
                                Cancelación no permitida
                                <small>(solo hasta el día anterior)</small>
                              </span>
                            }
                          } @else if (turno.estado === 'CANCELADA') {
                            <span class="text-muted">Turno cancelado</span>
                          } @else if (turno.estado === 'ASISTIO') {
                            <span class="text-success">Atendido ✓</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'reservar') {
          <div class="reserva-card">
            <div class="card-header">
              <h3>Solicitud de Turno Médico Clínico</h3>
              <p class="header-note">
                Horario de atención: <strong>8:00 a 16:00 hs</strong>. Turnos de 1 hora exacta. Máximo 30 días de anticipación.
              </p>
            </div>

            <div class="reserva-body">
              <form [formGroup]="reservaForm" (ngSubmit)="onReservarSubmit()" class="reserva-form">
                
                <div class="form-section">
                  <label class="section-label">
                    <span class="step-num">1</span>
                    Seleccione un Médico Clínico
                  </label>
                  <div class="medicos-grid">
                    @for (medico of medicos(); track medico.id) {
                      <div
                        class="medico-option"
                        [class.selected]="reservaForm.value.id_medico === medico.id"
                        (click)="selectMedico(medico)"
                      >
                        <div class="medico-avatar">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <div class="medico-info">
                          <strong>Dr/a. {{ medico.usuario ? (medico.usuario.nombres + ' ' + medico.usuario.apellidos) : 'Médico General' }}</strong>
                          <span class="medico-mat">Matrícula: {{ medico.matricula }}</span>
                          <span class="medico-fee">Valor Consulta: \${{ medico.valor_consulta | number }}</span>
                        </div>
                        <div class="check-icon">✓</div>
                      </div>
                    }
                  </div>
                </div>

                <div class="form-section">
                  <label class="section-label" for="reservaFecha">
                    <span class="step-num">2</span>
                    Seleccione la Fecha de la Consulta
                  </label>
                  <div class="date-picker-wrap">
                    <input
                      id="reservaFecha"
                      type="date"
                      formControlName="fecha"
                      [min]="minDate"
                      [max]="maxDate"
                      (change)="onFechaChange()"
                      class="date-input-lg"
                    />
                    <small class="hint-text">
                      Permitido desde hoy hasta el {{ formatDateDisplay(maxDate) }} (máximo 30 días).
                    </small>
                  </div>
                </div>

                @if (reservaForm.value.id_medico && reservaForm.value.fecha) {
                  <div class="form-section">
                    <label class="section-label">
                      <span class="step-num">3</span>
                      Seleccione el Horario (Turnos de 1 hora)
                    </label>
                    <p class="sub-hint">
                      Los horarios marcados en gris ya se encuentran ocupados y no admiten reservas.
                    </p>

                    <div class="slots-grid">
                      @for (slot of timeSlots(); track slot.hour) {
                        <button
                          type="button"
                          class="slot-btn"
                          [class.occupied]="slot.occupied"
                          [class.selected]="reservaForm.value.hora === slot.hour"
                          [disabled]="slot.occupied"
                          (click)="selectSlot(slot.hour)"
                        >
                          <span class="slot-time">{{ slot.label }}</span>
                          <span class="slot-status">
                            {{ slot.occupied ? 'Ocupado' : 'Disponible' }}
                          </span>
                        </button>
                      }
                    </div>
                  </div>
                }

                @if (selectedMedico() && reservaForm.value.fecha && reservaForm.value.hora !== null) {
                  <div class="summary-box">
                    <div class="summary-header">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      <h4>Resumen del Turno y Tarifa</h4>
                    </div>
                    <div class="summary-details">
                      <div class="summary-row">
                        <span>Médico Clínico:</span>
                        <strong>Dr/a. {{ selectedMedico()?.usuario?.nombres }} {{ selectedMedico()?.usuario?.apellidos }}</strong>
                      </div>
                      <div class="summary-row">
                        <span>Fecha y Horario:</span>
                        <strong>{{ formatDateDisplay(reservaForm.value.fecha!) }} a las {{ formatHourString(reservaForm.value.hora!) }}</strong>
                      </div>
                      <div class="summary-row highlight">
                        <span>Valor de la Consulta:</span>
                        <div class="price-freeze">
                          <span class="price-value">\${{ selectedMedico()?.valor_consulta | number }}</span>
                          <span class="price-badge">Valor Congelado</span>
                        </div>
                      </div>
                      <p class="freeze-policy">
                        * De acuerdo a las políticas de la clínica, el valor de la consulta se congela en este instante al confirmar su reserva.
                      </p>
                    </div>

                    <button
                      type="submit"
                      class="btn-confirm-reserva"
                      [disabled]="isSubmitting()"
                    >
                      @if (isSubmitting()) {
                        <span class="spinner-sm"></span>
                        <span>Confirmando Reserva...</span>
                      } @else {
                        <span>Confirmar Reserva de Turno</span>
                      }
                    </button>
                  </div>
                }

              </form>
            </div>
          </div>
        }

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
      background: #dcfce7;
      color: #15803d;
      padding: 0.4rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tabs-nav {
      display: flex;
      gap: 0.75rem;
    }
    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      color: #475569;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn:hover {
      background: #f1f5f9;
      color: #0284c7;
    }
    .tab-btn.active {
      background: #0284c7;
      color: white;
      border-color: #0284c7;
      box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);
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
    .turnos-card, .reserva-card {
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
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .card-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #0f172a;
    }
    .header-note {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: #64748b;
      width: 100%;
    }
    .btn-primary-sm {
      padding: 0.45rem 0.9rem;
      background: #0284c7;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary-sm:hover { background: #0369a1; }
    .table-responsive { overflow-x: auto; }
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
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .tag-frozen {
      font-size: 0.65rem;
      background: #e0f2fe;
      color: #0369a1;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-activo { background: #e0f2fe; color: #0369a1; }
    .badge-atendido { background: #dcfce7; color: #15803d; }
    .badge-ausente { background: #fee2e2; color: #b91c1c; }
    .btn-cancel {
      padding: 0.4rem 0.85rem;
      background: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 6px;
      color: #e11d48;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-cancel:hover {
      background: #e11d48;
      color: white;
    }
    .cancel-notice {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .cancel-notice small {
      font-size: 0.7rem;
      color: #dc2626;
    }
    .text-right { text-align: right; }
    .text-muted { color: #94a3b8; font-size: 0.85rem; }
    .text-success { color: #16a34a; font-weight: 600; font-size: 0.85rem; }

    .reserva-body {
      padding: 2rem;
    }
    .reserva-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .section-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e293b;
    }
    .step-num {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #0284c7;
      color: white;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .medicos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .medico-option {
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.2s ease;
      position: relative;
    }
    .medico-option:hover {
      border-color: #93c5fd;
      background: white;
    }
    .medico-option.selected {
      border-color: #0284c7;
      background: #f0f9ff;
    }
    .medico-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .medico-info {
      display: flex;
      flex-direction: column;
    }
    .medico-info strong {
      color: #0f172a;
      font-size: 0.95rem;
    }
    .medico-mat {
      font-size: 0.75rem;
      color: #64748b;
    }
    .medico-fee {
      font-size: 0.85rem;
      font-weight: 700;
      color: #0284c7;
      margin-top: 0.2rem;
    }
    .check-icon {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #0284c7;
      color: white;
      font-size: 0.75rem;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .medico-option.selected .check-icon {
      display: flex;
    }
    .date-picker-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      max-width: 320px;
    }
    .date-input-lg {
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 1rem;
      background: #f8fafc;
      color: #0f172a;
      outline: none;
    }
    .date-input-lg:focus {
      border-color: #0284c7;
      background: white;
    }
    .hint-text {
      color: #64748b;
      font-size: 0.8rem;
    }
    .sub-hint {
      color: #64748b;
      font-size: 0.85rem;
      margin: 0;
    }
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 0.75rem;
    }
    .slot-btn {
      padding: 0.85rem 0.5rem;
      border: 2px solid #cbd5e1;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.15s ease;
    }
    .slot-btn:hover:not(:disabled) {
      border-color: #0284c7;
      background: #f0f9ff;
    }
    .slot-btn.selected {
      border-color: #0284c7;
      background: #0284c7;
      color: white;
    }
    .slot-btn.selected .slot-time,
    .slot-btn.selected .slot-status {
      color: white;
    }
    .slot-btn.occupied {
      background: #f1f5f9;
      border-color: #e2e8f0;
      color: #94a3b8;
      cursor: not-allowed;
      opacity: 0.7;
    }
    .slot-time {
      font-weight: 700;
      font-size: 0.95rem;
      color: #0f172a;
    }
    .slot-status {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 600;
      color: #10b981;
    }
    .slot-btn.occupied .slot-status {
      color: #ef4444;
    }
    .summary-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .summary-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #166534;
    }
    .summary-header h4 {
      margin: 0;
      font-size: 1.1rem;
    }
    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      color: #334155;
    }
    .summary-row.highlight {
      padding-top: 0.6rem;
      border-top: 1px dashed #86efac;
      font-size: 1.05rem;
    }
    .price-freeze {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .price-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: #15803d;
    }
    .price-badge {
      background: #15803d;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .freeze-policy {
      margin: 0.5rem 0 0;
      font-size: 0.8rem;
      color: #166534;
      font-style: italic;
    }
    .btn-confirm-reserva {
      padding: 0.9rem;
      background: #15803d;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(21, 128, 61, 0.3);
    }
    .btn-confirm-reserva:hover:not(:disabled) {
      background: #166534;
      transform: translateY(-1px);
    }
    .btn-confirm-reserva:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner-sm {
      width: 18px;
      height: 18px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .empty-state, .loading-state {
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
      color: #0f172a;
      font-size: 1.15rem;
    }
    .btn-primary {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #0284c7;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
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
export class PacienteDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly reservasService = inject(ReservasService);
  private readonly medicosService = inject(MedicosService);

  readonly activeTab = signal<'turnos' | 'reservar'>('turnos');
  readonly misTurnos = signal<Reserva[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly allReservas = signal<Reserva[]>([]);

  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly feedbackType = signal<'success' | 'error'>('success');

  readonly patientName = signal('');
  readonly patientDocumento = signal('');

  readonly selectedMedico = signal<Medico | null>(null);
  readonly timeSlots = signal<{ hour: number; label: string; occupied: boolean }[]>([]);

  readonly minDate = this.reservasService.getMinDate();
  readonly maxDate = this.reservasService.getMaxDate();

  readonly reservaForm = this.fb.group({
    id_medico: [null as number | null, [Validators.required]],
    fecha: ['', [Validators.required]],
    hora: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadPatientInfo();
    this.loadData();
  }

  private loadPatientInfo(): void {
    const session = this.authService.session;
    if (session?.usuario) {
      this.patientName.set(`${session.usuario.nombres} ${session.usuario.apellidos}`);
      this.patientDocumento.set(session.usuario.documento);
    }
  }

  loadData(): void {
    this.isLoading.set(true);
    this.medicosService.getMedicos().subscribe({
      next: (meds) => {
        this.medicos.set(meds);
      }
    });

    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        this.allReservas.set(reservas);
        const currentUserId = this.authService.currentUserId;

        const mine = reservas.filter(
          (r) => r.paciente?.id === currentUserId || r.paciente?.documento === this.patientDocumento()
        );

        mine.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());

        this.misTurnos.set(mine);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback('Error al cargar información de turnos.', 'error');
      }
    });
  }

  selectMedico(medico: Medico): void {
    this.selectedMedico.set(medico);
    this.reservaForm.patchValue({ id_medico: medico.id });
    this.recalculateSlots();
  }

  onFechaChange(): void {
    this.recalculateSlots();
  }

  selectSlot(hour: number): void {
    this.reservaForm.patchValue({ hora: hour });
  }

  recalculateSlots(): void {
    const medicoId = this.reservaForm.value.id_medico;
    const fecha = this.reservaForm.value.fecha;

    if (!medicoId || !fecha) {
      this.timeSlots.set([]);
      return;
    }

    const slots = this.reservasService.HORARIOS_DISPONIBLES.map((hour) => {
      const occupied = this.reservasService.isHorarioOcupado(
        medicoId,
        fecha,
        hour,
        this.allReservas()
      );

      const hoy = new Date();
      const [y, m, d] = fecha.split('-').map(Number);
      const slotDate = new Date(y, m - 1, d, hour, 0, 0);
      const isPast = slotDate.getTime() <= hoy.getTime();

      return {
        hour,
        label: `${String(hour).padStart(2, '0')}:00 hs`,
        occupied: occupied || isPast
      };
    });

    this.timeSlots.set(slots);

    const currentHora = this.reservaForm.value.hora;
    if (currentHora !== null) {
      const currentSlot = slots.find((s) => s.hour === currentHora);
      if (!currentSlot || currentSlot.occupied) {
        this.reservaForm.patchValue({ hora: null });
      }
    }
  }

  onReservarSubmit(): void {
    if (this.reservaForm.invalid || !this.authService.currentUserId) {
      return;
    }

    const { id_medico, fecha, hora } = this.reservaForm.value;
    if (!id_medico || !fecha || hora === null || hora === undefined) {
      return;
    }

    const isOccupied = this.reservasService.isHorarioOcupado(
      id_medico,
      fecha,
      hora,
      this.allReservas()
    );

    if (isOccupied) {
      this.showFeedback('El horario seleccionado acaba de ser reservado. Por favor elija otro turno.', 'error');
      this.recalculateSlots();
      return;
    }

    this.isSubmitting.set(true);

    const [year, month, day] = fecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day, hora, 0, 0);
    const fechaIso = fechaObj.toISOString();

    const dto: CreateReservaDto = {
      id_medico: id_medico,
      id_paciente: this.authService.currentUserId,
      fecha_hora: fechaIso
    };

    this.reservasService.createReserva(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showFeedback(
          `¡Turno reservado con éxito para el ${this.formatDateDisplay(fecha)} a las ${this.formatHourString(hora)}! Valor congelado: \$${this.selectedMedico()?.valor_consulta}`,
          'success'
        );
        this.reservaForm.reset();
        this.selectedMedico.set(null);
        this.timeSlots.set([]);
        this.loadData();
        this.activeTab.set('turnos');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errMsg = err.error?.message || 'Error al procesar la reserva. Verifique que el horario no esté ocupado.';
        this.showFeedback(errMsg, 'error');
      }
    });
  }

  canCancelTurno(fechaHora: string): boolean {
    return this.reservasService.canPatientCancel(fechaHora);
  }

  cancelarTurno(turno: Reserva): void {
    if (!this.canCancelTurno(turno.fecha_hora)) {
      this.showFeedback('Solo se permite cancelar turnos hasta el día anterior a la consulta médica.', 'error');
      return;
    }

    if (!confirm('¿Confirma que desea cancelar su turno reservado?')) {
      return;
    }

    this.reservasService.cancelarReserva(turno.id).subscribe({
      next: () => {
        this.showFeedback('Turno cancelado correctamente.', 'success');
        this.loadData();
      },
      error: () => {
        this.showFeedback('Error al cancelar el turno. Intente nuevamente.', 'error');
      }
    });
  }

  formatSlotHour(isoDate: string): string {
    const d = new Date(isoDate);
    const start = String(d.getHours()).padStart(2, '0') + ':00';
    const end = String(d.getHours() + 1).padStart(2, '0') + ':00';
    return `${start} - ${end} hs`;
  }

  formatFechaDisplay(isoDate: string): string {
    const d = new Date(isoDate);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  formatDateDisplay(ymd: string): string {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
  }

  formatHourString(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00 hs`;
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case 'ASISTIO': return 'badge-atendido';
      case 'CANCELADA': return 'badge-ausente';
      default: return 'badge-activo';
    }
  }

  getStatusLabel(estado: string): string {
    switch (estado) {
      case 'ASISTIO': return 'Atendido';
      case 'CANCELADA': return 'Cancelado';
      case 'CONFIRMADA': return 'Confirmado';
      default: return 'Activo / Pendiente';
    }
  }

  private showFeedback(msg: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set(msg);
    this.feedbackType.set(type);
    setTimeout(() => {
      this.feedbackMessage.set(null);
    }, 6000);
  }
}
