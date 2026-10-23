import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { EstadoReservaTag } from '../../components/estado-reserva/estado-reserva';
import { FormReserva } from '../../components/form-reserva/form-reserva';
import { EstadoReserva } from '../../core/enums/reserva.enums';
import { Medico } from '../../core/models/medico.models';
import { Reserva } from '../../core/models/reserva.models';
import { AuthService } from '../../core/services/auth.service';
import { MedicosService } from '../../core/services/medicos.service';
import { ReservasService } from '../../core/services/reservas.service';
import { mensajeError } from '../../core/utils/errores';

@Component({
  selector: 'app-paciente',
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TableModule,
    Card,
    EstadoReservaTag,
    Button,
    FormReserva,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './paciente.html',
})
export class PanelPaciente implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly reservasService = inject(ReservasService);
  private readonly medicosService = inject(MedicosService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly tabActiva = signal<string | number | undefined>('turnos');
  protected readonly turnos = signal<Reserva[]>([]);
  protected readonly medicos = signal<Medico[]>([]);
  protected readonly cargando = signal(true);

  ngOnInit(): void {
    this.cargarTurnos();
    this.medicosService.getMedicos().subscribe({
      next: (medicos) => this.medicos.set(medicos),
      error: (err: HttpErrorResponse) =>
        this.mostrarError(err, 'No se pudieron cargar los médicos.'),
    });
  }

  protected puedeCancelar(turno: Reserva): boolean {
    return (
      turno.estado === EstadoReserva.ACTIVO &&
      this.reservasService.pacientePuedeCancelar(turno.fecha_hora)
    );
  }

  protected cancelar(turno: Reserva): void {
    this.confirmationService.confirm({
      header: 'Cancelar turno',
      message: `¿Querés cancelar el turno con Dr/a. ${turno.medico.apellidos}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Sí, cancelar', severity: 'danger' },
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      accept: () => {
        this.reservasService.cancelarReserva(turno.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Turno cancelado',
              detail: 'El turno se canceló correctamente.',
            });
            this.cargarTurnos();
          },
          error: (err: HttpErrorResponse) =>
            this.mostrarError(err, 'No se pudo cancelar el turno.'),
        });
      },
    });
  }

  protected onReservada(): void {
    this.cargarTurnos();
    this.tabActiva.set('turnos');
  }

  private cargarTurnos(): void {
    this.cargando.set(true);
    this.reservasService.getMisReservas().subscribe({
      next: (turnos) => {
        this.turnos.set(
          turnos.sort(
            (a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime(),
          ),
        );
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.mostrarError(err, 'No se pudieron cargar tus turnos.');
      },
    });
  }

  private mostrarError(err: HttpErrorResponse, porDefecto: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError(err, porDefecto),
    });
  }
}
