import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ReservasService } from '../../core/services/reservas.service';
import { MedicosService } from '../../core/services/medicos.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { CreateReservaRequest, Reserva } from '../../core/models/reserva.models';
import { Medico } from '../../core/models/medico.models';
import { Usuario } from '../../core/models/usuario.models';
import { EstadoReserva } from '../../core/enums/reserva.enums';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-container">
        <header class="page-header">
          <div>
            <h1>Panel de Administración</h1>
            <p class="subtitle">Gestión Integral de Turnos, Reservas y Aranceles Médicos</p>
          </div>
          <div class="header-badge">
            <span class="badge-role">Administrador del Sistema</span>
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
            <span>Listado General de Turnos ({{ allReservas().length }})</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="activeTab() === 'nueva-reserva'"
            (click)="activeTab.set('nueva-reserva')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Nueva Reserva</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="activeTab() === 'medicos'"
            (click)="activeTab.set('medicos')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>Médicos y Aranceles de Consulta</span>
          </button>
        </div>

        @if (activeTab() === 'turnos') {
          <div class="admin-card">
            <div class="filters-bar">
              <div class="filter-group">
                <label for="filtroFecha">Fecha:</label>
                <input
                  id="filtroFecha"
                  type="date"
                  [(ngModel)]="filtroFecha"
                  (change)="aplicarFiltros()"
                  class="filter-input"
                />
              </div>

              <div class="filter-group">
                <label for="filtroMedico">Médico:</label>
                <select
                  id="filtroMedico"
                  [(ngModel)]="filtroMedicoId"
                  (change)="aplicarFiltros()"
                  class="filter-select"
                >
                  <option [ngValue]="null">Todos los Médicos</option>
                  @for (m of medicos(); track m.id) {
                    <option [ngValue]="m.id">
                      Dr/a. {{ m.nombres + ' ' + m.apellidos }} (Mat. {{ m.matricula }})
                    </option>
                  }
                </select>
              </div>

              <div class="filter-group">
                <label for="filtroEstado">Estado:</label>
                <select
                  id="filtroEstado"
                  [(ngModel)]="filtroEstado"
                  (change)="aplicarFiltros()"
                  class="filter-select"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option [value]="EstadoReserva.ACTIVO">Activos</option>
                  <option [value]="EstadoReserva.ATENDIDO">Atendidos</option>
                  <option [value]="EstadoReserva.AUSENTE">Ausentes</option>
                  <option [value]="EstadoReserva.CANCELADO">Cancelados</option>
                </select>
              </div>

              <button class="btn-clear-filters" (click)="limpiarFiltros()">
                Limpiar Filtros
              </button>
            </div>

            <div class="card-header">
              <h3>Turnos Registrados en el Sistema</h3>
              <span class="count-badge">{{ turnosFiltrados().length }} turnos</span>
            </div>

            @if (isLoading()) {
              <div class="loading-state">
                <div class="spinner"></div>
                <p>Cargando listado de turnos...</p>
              </div>
            } @else if (turnosFiltrados().length === 0) {
              <div class="empty-state">
                <h4>No se encontraron turnos con los filtros aplicados</h4>
                <p>Intente modificar o limpiar los criterios de búsqueda.</p>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Fecha / Hora</th>
                      <th>Médico</th>
                      <th>Paciente</th>
                      <th>DNI Paciente</th>
                      <th>Arancel Congelado</th>
                      <th>Estado</th>
                      <th class="text-right">Acción (Admin)</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (turno of turnosFiltrados(); track turno.id) {
                      <tr>
                        <td class="cell-time">
                          <div class="time-slot">
                            <span class="time-hours">{{ formatSlotHour(turno.fecha_hora) }}</span>
                            <span class="time-date">{{ formatFechaDisplay(turno.fecha_hora) }}</span>
                          </div>
                        </td>
                        <td>
                          <strong>Dr/a. {{ turno.medico.nombres + ' ' + turno.medico.apellidos }}</strong>
                        </td>
                        <td>
                          {{ turno.paciente.nombres }} {{ turno.paciente.apellidos }}
                        </td>
                        <td>{{ turno.paciente.documento }}</td>
                        <td class="cell-valor">
                          \${{ turno.valor_consulta | number }}
                        </td>
                        <td>
                          <span class="status-badge" [ngClass]="getStatusBadgeClass(turno.estado)">
                            {{ getStatusLabel(turno.estado) }}
                          </span>
                        </td>
                        <td class="text-right">
                          @if (turno.estado === EstadoReserva.ACTIVO) {
                            @if (canAdminCancelTurno(turno.fecha_hora)) {
                              <button
                                class="btn-cancel"
                                (click)="cancelarTurnoAdmin(turno)"
                                title="Cancelar turno (permitido hasta el momento en que inicia la consulta)"
                              >
                                Cancelar Turno
                              </button>
                            } @else {
                              <span
                                class="cancel-notice"
                                title="Regla de negocio: la cancelación por administrador solo está permitida hasta el momento en que inicia la consulta"
                              >
                                Consulta iniciada / pasada
                              </span>
                            }
                          } @else if (turno.estado === EstadoReserva.CANCELADO || turno.estado === EstadoReserva.AUSENTE) {
                            <span class="text-muted">Cancelado</span>
                          } @else if (turno.estado === EstadoReserva.ATENDIDO) {
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

        @if (activeTab() === 'nueva-reserva') {
          <div class="admin-card">
            <div class="card-header">
              <h3>Registrar Nueva Reserva para Paciente</h3>
              <p class="header-note">
                Como Administrador puede asignar un turno para cualquier paciente del sistema respetando horarios (8hs a 16hs) y anticipación (hasta 30 días).
              </p>
            </div>

            <div class="reserva-body">
              <form [formGroup]="reservaForm" (ngSubmit)="onCrearReservaAdmin()" class="reserva-form">
                <div class="form-section">
                  <label class="section-label" for="pacienteSelect">
                    <span class="step-num">1</span>
                    Seleccione el Paciente:
                  </label>
                  <select
                    id="pacienteSelect"
                    formControlName="id_paciente"
                    class="select-lg"
                  >
                    <option [ngValue]="null" disabled>-- Seleccione un Paciente --</option>
                    @for (paciente of pacientes(); track paciente.id) {
                      <option [ngValue]="paciente.id">
                        {{ paciente.nombres }} {{ paciente.apellidos }} (DNI: {{ paciente.documento }}){{ ' - ' + paciente.email }}
                      </option>
                    }
                  </select>
                </div>

                <div class="form-section">
                  <label class="section-label">
                    <span class="step-num">2</span>
                    Seleccione el Médico Clínico:
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
                          <strong>Dr/a. {{ medico.nombres + ' ' + medico.apellidos }}</strong>
                          <span class="medico-mat">Matrícula: {{ medico.matricula }}</span>
                          <span class="medico-fee">Valor Consulta: \${{ medico.valor_consulta | number }}</span>
                        </div>
                        <div class="check-icon">✓</div>
                      </div>
                    }
                  </div>
                </div>

                <div class="form-section">
                  <label class="section-label" for="fechaAdmin">
                    <span class="step-num">3</span>
                    Fecha del Turno:
                  </label>
                  <div class="date-picker-wrap">
                    <input
                      id="fechaAdmin"
                      type="date"
                      formControlName="fecha"
                      [min]="minDate"
                      [max]="maxDate"
                      (change)="onFechaChange()"
                      class="date-input-lg"
                    />
                    <small class="hint-text">Máximo 30 días de anticipación.</small>
                  </div>
                </div>

                @if (reservaForm.value.id_medico && reservaForm.value.fecha) {
                  <div class="form-section">
                    <label class="section-label">
                      <span class="step-num">4</span>
                      Horario de Atención (8hs a 16hs):
                    </label>
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

                @if (reservaForm.value.id_paciente && selectedMedico() && reservaForm.value.fecha && reservaForm.value.hora !== null) {
                  <div class="summary-box">
                    <h4>Confirmación de Reserva (Administración)</h4>
                    <div class="summary-row">
                      <span>Paciente:</span>
                      <strong>{{ getSelectedPacienteName() }}</strong>
                    </div>
                    <div class="summary-row">
                      <span>Médico Clínico:</span>
                      <strong>Dr/a. {{ selectedMedico()?.nombres }} {{ selectedMedico()?.apellidos }}</strong>
                    </div>
                    <div class="summary-row">
                      <span>Fecha y Horario:</span>
                      <strong>{{ formatDateDisplay(reservaForm.value.fecha!) }} a las {{ formatHourString(reservaForm.value.hora!) }}</strong>
                    </div>
                    <div class="summary-row highlight">
                      <span>Valor Consulta Congelado:</span>
                      <strong class="price-value">\${{ selectedMedico()?.valor_consulta | number }}</strong>
                    </div>

                    <button
                      type="submit"
                      class="btn-confirm-reserva"
                      [disabled]="isSubmitting()"
                    >
                      @if (isSubmitting()) {
                        <span class="spinner-sm"></span>
                        <span>Registrando...</span>
                      } @else {
                        <span>Confirmar Reserva</span>
                      }
                    </button>
                  </div>
                }
              </form>
            </div>
          </div>
        }

        @if (activeTab() === 'medicos') {
          <div class="admin-card">
            <div class="card-header">
              <div>
                <h3>Gestión de Médicos y Valor de la Consulta</h3>
                <p class="header-note">
                  Modifique el arancel de consulta de los médicos clínicos. Recuerde que las reservas ya emitidas conservan su valor congelado.
                </p>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID Médico</th>
                    <th>Médico Clínico</th>
                    <th>Matrícula</th>
                    <th>Email de Contacto</th>
                    <th>Valor Consulta Actual</th>
                    <th class="text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (medico of medicos(); track medico.id) {
                    <tr>
                      <td>#{{ medico.id }}</td>
                      <td>
                        <strong>Dr/a. {{ medico.nombres + ' ' + medico.apellidos }}</strong>
                      </td>
                      <td>{{ medico.matricula }}</td>
                      <td>{{ medico.email }}</td>
                      <td class="cell-fee">
                        \${{ medico.valor_consulta | number }}
                      </td>
                      <td class="text-right">
                        <button
                          class="btn-edit-fee"
                          (click)="openEditFeeModal(medico)"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          <span>Modificar Valor</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (editingMedico()) {
          <div class="modal-backdrop" (click)="closeEditFeeModal()">
            <div class="modal-card" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Modificar Valor de Consulta</h3>
                <button class="modal-close" (click)="closeEditFeeModal()">×</button>
              </div>

              <div class="modal-body">
                <p>
                  Médico: <strong>Dr/a. {{ editingMedico()?.nombres }} {{ editingMedico()?.apellidos }}</strong>
                </p>
                <p class="modal-matricula">Matrícula: {{ editingMedico()?.matricula }}</p>

                <div class="form-group">
                  <label for="nuevoValor">Nuevo Valor de Consulta (\$):</label>
                  <input
                    id="nuevoValor"
                    type="number"
                    min="1"
                    step="1"
                    [(ngModel)]="nuevoValorConsulta"
                    class="input-fee"
                  />
                  <small class="hint-text">
                    El nuevo arancel se aplicará a las futuras reservas que se realicen.
                  </small>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn-secondary" (click)="closeEditFeeModal()">Cancelar</button>
                <button
                  class="btn-primary"
                  (click)="guardarNuevoValorConsulta()"
                  [disabled]="isSavingFee() || !nuevoValorConsulta || nuevoValorConsulta <= 0"
                >
                  @if (isSavingFee()) {
                    <span>Guardando...</span>
                  } @else {
                    <span>Guardar Arancel</span>
                  }
                </button>
              </div>
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
      background: #fef3c7;
      color: #b45309;
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
    .tabs-nav {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
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
    .admin-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .filters-bar {
      padding: 1.25rem 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 1rem;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .filter-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }
    .filter-input, .filter-select {
      padding: 0.5rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      background: white;
      color: #0f172a;
      outline: none;
    }
    .btn-clear-filters {
      padding: 0.5rem 0.85rem;
      background: #e2e8f0;
      border: none;
      border-radius: 8px;
      color: #475569;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-clear-filters:hover { background: #cbd5e1; }
    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #0f172a;
    }
    .count-badge {
      font-size: 0.85rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }
    .header-note {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: #64748b;
    }
    .table-responsive { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .data-table th {
      background: #f8fafc;
      padding: 0.85rem 1.25rem;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }
    .data-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .cell-time { white-space: nowrap; }
    .time-slot { display: flex; flex-direction: column; }
    .time-hours { font-weight: 700; color: #0284c7; }
    .time-date { font-size: 0.75rem; color: #64748b; }
    .cell-valor { font-weight: 700; color: #0f172a; }
    .cell-fee { font-size: 1.05rem; font-weight: 800; color: #0284c7; }
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
    }
    .btn-cancel:hover { background: #e11d48; color: white; }
    .cancel-notice {
      font-size: 0.75rem;
      color: #94a3b8;
      font-style: italic;
    }
    .btn-edit-fee {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.9rem;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 6px;
      color: #0369a1;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-edit-fee:hover {
      background: #0284c7;
      color: white;
      border-color: #0284c7;
    }
    .text-right { text-align: right; }
    .text-muted { color: #94a3b8; font-size: 0.85rem; }
    .text-success { color: #16a34a; font-weight: 600; font-size: 0.85rem; }

    .reserva-body { padding: 2rem; }
    .reserva-form { display: flex; flex-direction: column; gap: 2rem; }
    .form-section { display: flex; flex-direction: column; gap: 0.75rem; }
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
    .select-lg {
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 1rem;
      background: #f8fafc;
      color: #0f172a;
      max-width: 500px;
      outline: none;
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
    .medico-info { display: flex; flex-direction: column; }
    .medico-mat { font-size: 0.75rem; color: #64748b; }
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
    .medico-option.selected .check-icon { display: flex; }
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
    .hint-text { color: #64748b; font-size: 0.8rem; }
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
    .slot-time { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
    .slot-status { font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: #10b981; }
    .slot-btn.occupied .slot-status { color: #ef4444; }
    .summary-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .summary-box h4 { margin: 0 0 0.5rem; color: #0f172a; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      color: #334155;
    }
    .summary-row.highlight {
      padding-top: 0.6rem;
      border-top: 1px dashed #cbd5e1;
      font-size: 1.05rem;
    }
    .price-value { font-size: 1.35rem; color: #0284c7; }
    .btn-confirm-reserva {
      margin-top: 0.5rem;
      padding: 0.9rem;
      background: #0284c7;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-confirm-reserva:hover:not(:disabled) { background: #0369a1; }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .modal-card {
      background: white;
      border-radius: 14px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 { margin: 0; font-size: 1.2rem; color: #0f172a; }
    .modal-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
    }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-matricula { font-size: 0.85rem; color: #64748b; margin: -0.5rem 0 0; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label { font-size: 0.9rem; font-weight: 600; color: #334155; }
    .input-fee {
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      outline: none;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .btn-secondary {
      padding: 0.6rem 1.2rem;
      background: #e2e8f0;
      color: #475569;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary {
      padding: 0.6rem 1.2rem;
      background: #0284c7;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:hover:not(:disabled) { background: #0369a1; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .loading-state, .empty-state {
      padding: 3rem 1rem;
      text-align: center;
      color: #64748b;
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
    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  protected readonly EstadoReserva = EstadoReserva;

  private readonly fb = inject(FormBuilder);
  private readonly reservasService = inject(ReservasService);
  private readonly medicosService = inject(MedicosService);
  private readonly usuariosService = inject(UsuariosService);

  readonly activeTab = signal<'turnos' | 'nueva-reserva' | 'medicos'>('turnos');
  readonly allReservas = signal<Reserva[]>([]);
  readonly turnosFiltrados = signal<Reserva[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly pacientes = signal<Usuario[]>([]);

  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly feedbackType = signal<'success' | 'error'>('success');

  filtroFecha: string = '';
  filtroMedicoId: number | null = null;
  filtroEstado: string = 'TODOS';

  readonly editingMedico = signal<Medico | null>(null);
  nuevoValorConsulta: number = 0;
  readonly isSavingFee = signal(false);

  readonly selectedMedico = signal<Medico | null>(null);
  readonly timeSlots = signal<{ hour: number; label: string; occupied: boolean }[]>([]);

  readonly minDate = this.reservasService.getMinDate();
  readonly maxDate = this.reservasService.getMaxDate();

  readonly reservaForm = this.fb.group({
    id_paciente: [null as number | null, [Validators.required]],
    id_medico: [null as number | null, [Validators.required]],
    fecha: ['', [Validators.required]],
    hora: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);

    this.medicosService.getMedicos().subscribe({
      next: (meds) => this.medicos.set(meds)
    });

    this.usuariosService.getPacientes().subscribe({
      next: (pacs) => this.pacientes.set(pacs)
    });

    this.reservasService.getReservas().subscribe({
      next: (reservas) => {
        reservas.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
        this.allReservas.set(reservas);
        this.aplicarFiltros();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showFeedback('Error al cargar datos del sistema.', 'error');
      }
    });
  }

  aplicarFiltros(): void {
    let filtered = [...this.allReservas()];

    if (this.filtroFecha) {
      filtered = filtered.filter((r) => {
        const d = new Date(r.fecha_hora);
        const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return ymd === this.filtroFecha;
      });
    }

    if (this.filtroMedicoId !== null) {
      filtered = filtered.filter((r) => r.medico?.id === this.filtroMedicoId);
    }

    if (this.filtroEstado !== 'TODOS') {
      filtered = filtered.filter((r) => r.estado === this.filtroEstado);
    }

    this.turnosFiltrados.set(filtered);
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.filtroMedicoId = null;
    this.filtroEstado = 'TODOS';
    this.aplicarFiltros();
  }

  canAdminCancelTurno(fechaHora: string): boolean {
    return this.reservasService.canAdminCancel(fechaHora);
  }

  cancelarTurnoAdmin(turno: Reserva): void {
    if (!this.canAdminCancelTurno(turno.fecha_hora)) {
      this.showFeedback('Solo se permite cancelar el turno hasta el momento en que inicia la consulta.', 'error');
      return;
    }

    if (!confirm(`¿Confirma cancelar el turno de ${turno.paciente.nombres} ${turno.paciente.apellidos}?`)) {
      return;
    }

    this.reservasService.cancelarReserva(turno.id).subscribe({
      next: () => {
        this.showFeedback('Turno cancelado exitosamente por administración.', 'success');
        this.loadAllData();
      },
      error: (err) => {
        this.showFeedback(err.error?.message || 'Error al cancelar turno.', 'error');
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

    this.reservasService.getDisponibilidad(medicoId, fecha).subscribe({
      next: (horarios) => {
        const ahora = Date.now();
        const slots = horarios.map((h) => {
          const fechaHora = new Date(h.fecha_hora);
          const hour = fechaHora.getHours();
          return {
            hour,
            label: this.formatHourString(hour),
            occupied: !h.disponible || fechaHora.getTime() <= ahora
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
      },
      error: () => {
        this.timeSlots.set([]);
        this.showFeedback('Error al consultar los horarios disponibles.', 'error');
      }
    });
  }

  getSelectedPacienteName(): string {
    const pId = this.reservaForm.value.id_paciente;
    const p = this.pacientes().find((x) => x.id === pId);
    return p ? `${p.nombres} ${p.apellidos} (DNI ${p.documento})` : '';
  }

  onCrearReservaAdmin(): void {
    if (this.reservaForm.invalid) {
      return;
    }

    const { id_paciente, id_medico, fecha, hora } = this.reservaForm.value;
    if (!id_paciente || !id_medico || !fecha || hora === null || hora === undefined) {
      return;
    }


    this.isSubmitting.set(true);

    const [year, month, day] = fecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day, hora, 0, 0);
    const fechaIso = fechaObj.toISOString();

    const dto: CreateReservaRequest = {
      id_medico,
      id_paciente,
      fecha_hora: fechaIso
    };

    this.reservasService.createReserva(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showFeedback('Reserva creada exitosamente por Administración.', 'success');
        this.reservaForm.reset();
        this.selectedMedico.set(null);
        this.timeSlots.set([]);
        this.loadAllData();
        this.activeTab.set('turnos');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Error al procesar reserva.';
        this.showFeedback(msg, 'error');
      }
    });
  }

  openEditFeeModal(medico: Medico): void {
    this.editingMedico.set(medico);
    this.nuevoValorConsulta = medico.valor_consulta;
  }

  closeEditFeeModal(): void {
    this.editingMedico.set(null);
  }

  guardarNuevoValorConsulta(): void {
    const med = this.editingMedico();
    if (!med || !this.nuevoValorConsulta || this.nuevoValorConsulta <= 0) {
      return;
    }

    this.isSavingFee.set(true);
    const dto = { valor_consulta: Math.round(this.nuevoValorConsulta) };

    this.medicosService.updateValorConsulta(med.id, dto).subscribe({
      next: () => {
        this.isSavingFee.set(false);
        this.showFeedback(
          `Arancel actualizado para Dr/a. ${med.nombres} ${med.apellidos}: \$${dto.valor_consulta}`,
          'success'
        );
        this.closeEditFeeModal();
        const lista = this.medicos().map((m) =>
          m.id === med.id ? { ...m, valor_consulta: dto.valor_consulta } : m
        );
        this.medicos.set(lista);
      },
      error: () => {
        this.isSavingFee.set(false);
        this.showFeedback('Error al actualizar el arancel de consulta.', 'error');
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

  getStatusBadgeClass(estado: EstadoReserva): string {
    switch (estado) {
      case EstadoReserva.ATENDIDO:
        return 'badge-atendido';
      case EstadoReserva.AUSENTE:
      case EstadoReserva.CANCELADO:
        return 'badge-ausente';
      default:
        return 'badge-activo';
    }
  }

  getStatusLabel(estado: EstadoReserva): string {
    switch (estado) {
      case EstadoReserva.ATENDIDO:
        return 'Atendido';
      case EstadoReserva.AUSENTE:
        return 'Ausente';
      case EstadoReserva.CANCELADO:
        return 'Cancelado';
      default:
        return 'Activo';
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
