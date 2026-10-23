import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { EstadoReservaTag } from '../../components/estado-reserva/estado-reserva';
import { EstadoReserva } from '../../core/enums/reserva.enums';
import { Reserva } from '../../core/models/reserva.models';
import { AuthService } from '../../core/services/auth.service';
import { MedicosService } from '../../core/services/medicos.service';
import { ReservasService } from '../../core/services/reservas.service';
import { mensajeError } from '../../core/utils/errores';
import { ESTADOS_RESERVA, formatearYMD } from '../../core/utils/reservas.utils';

@Component({
  selector: 'app-medico',
  imports: [ReactiveFormsModule, DatePicker, TableModule, EstadoReservaTag, Button, DatePipe],
  templateUrl: './medico.html',
  styleUrl: './medico.css',
})
export class PanelMedico implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly reservasService = inject(ReservasService);
  private readonly medicosService = inject(MedicosService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly ESTADOS = ESTADOS_RESERVA;
  protected readonly EstadoReserva = EstadoReserva;

  protected readonly turnos = signal<Reserva[]>([]);
  protected readonly cargando = signal(false);
  protected readonly matricula = signal<number | null>(null);

  protected readonly resumen = computed(() => {
    const turnos = this.turnos();
    const contar = (estado: EstadoReserva) => turnos.filter((t) => t.estado === estado).length;
    return [
      { etiqueta: 'Turnos', valor: turnos.length, icono: 'pi pi-calendar' },
      { etiqueta: 'Pendientes', valor: contar(EstadoReserva.ACTIVO), icono: 'pi pi-clock' },
      { etiqueta: 'Atendidos', valor: contar(EstadoReserva.ATENDIDO), icono: 'pi pi-check' },
      { etiqueta: 'Ausentes', valor: contar(EstadoReserva.AUSENTE), icono: 'pi pi-user-minus' },
    ];
  });

  protected readonly form = new FormGroup({
    fecha: new FormControl(new Date(), { nonNullable: true }),
  });

  ngOnInit(): void {
    const idMedico = this.authService.usuario()?.id_medico;
    if (idMedico) {
      this.medicosService.getMedico(idMedico).subscribe({
        next: (medico) => this.matricula.set(medico.matricula),
      });
    }

    this.form.controls.fecha.valueChanges.subscribe(() => this.cargarTurnos());
    this.cargarTurnos();
  }

  protected irADia(diasDesdeHoy: number): void {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diasDesdeHoy);
    this.form.controls.fecha.setValue(fecha);
  }

  protected marcarAtendido(turno: Reserva): void {
    this.confirmar(
      turno,
      `¿Confirmás que ${turno.paciente.nombres} ${turno.paciente.apellidos} fue atendido/a?`,
      'Marcar atendido',
      () => this.reservasService.marcarAtendido(turno.id),
    );
  }

  protected marcarAusente(turno: Reserva): void {
    this.confirmar(
      turno,
      `¿Confirmás que ${turno.paciente.nombres} ${turno.paciente.apellidos} estuvo ausente?`,
      'Marcar ausente',
      () => this.reservasService.marcarAusente(turno.id),
    );
  }

  private confirmar(
    turno: Reserva,
    mensaje: string,
    accion: string,
    peticion: () => ReturnType<ReservasService['marcarAtendido']>,
  ): void {
    this.confirmationService.confirm({
      header: accion,
      message: mensaje,
      icon: 'pi pi-question-circle',
      acceptButtonProps: { label: 'Confirmar' },
      rejectButtonProps: { label: 'Volver', severity: 'secondary', outlined: true },
      accept: () => {
        peticion().subscribe({
          next: (actualizado) => {
            this.turnos.update((lista) =>
              lista.map((t) => (t.id === turno.id ? { ...t, estado: actualizado.estado } : t)),
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Turno actualizado',
              detail: `Turno marcado como ${this.ESTADOS[actualizado.estado].etiqueta.toLowerCase()}.`,
            });
          },
          error: (err: HttpErrorResponse) =>
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: mensajeError(err, 'No se pudo actualizar el turno.'),
            }),
        });
      },
    });
  }

  private cargarTurnos(): void {
    this.cargando.set(true);
    this.reservasService.getMisTurnos(formatearYMD(this.form.controls.fecha.value)).subscribe({
      next: (turnos) => {
        this.turnos.set(
          turnos.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()),
        );
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.turnos.set([]);
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeError(err, 'No se pudieron cargar los turnos.'),
        });
      },
    });
  }
}
