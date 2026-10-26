import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { EstadoReservaTag } from '../../components/estado-reserva/estado-reserva';
import { FormReserva } from '../../components/form-reserva/form-reserva';
import { EstadoReserva } from '../../core/enums/reserva.enums';
import { Medico } from '../../core/models/medico.models';
import { FiltroReservas, Reserva } from '../../core/models/reserva.models';
import { Usuario } from '../../core/models/usuario.models';
import { MedicosService } from '../../core/services/medicos.service';
import { ReservasService } from '../../core/services/reservas.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { mensajeError } from '../../core/utils/errores';
import { ESTADOS_RESERVA, formatearYMD } from '../../core/utils/reservas.utils';

@Component({
  selector: 'app-admin',
  imports: [
    ReactiveFormsModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TableModule,
    Card,
    EstadoReservaTag,
    Button,
    Select,
    DatePicker,
    Dialog,
    InputNumber,
    FormReserva,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class PanelAdmin implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly medicosService = inject(MedicosService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly tabActiva = signal<string | number | undefined>('turnos');
  protected readonly reservas = signal<Reserva[]>([]);
  protected readonly medicos = signal<Medico[]>([]);
  protected readonly pacientes = signal<Usuario[]>([]);
  protected readonly cargando = signal(true);

  protected readonly opcionesMedicos = computed(() =>
    this.medicos().map((m) => ({ etiqueta: `Dr/a. ${m.apellidos}, ${m.nombres}`, id: m.id })),
  );
  protected readonly opcionesEstados = Object.values(EstadoReserva).map((estado) => ({
    etiqueta: ESTADOS_RESERVA[estado].etiqueta,
    valor: estado,
  }));

  protected readonly filtros = new FormGroup({
    fecha: new FormControl<Date | null>(null),
    id_medico: new FormControl<number | null>(null),
    estado: new FormControl<EstadoReserva | null>(null),
  });

  protected readonly medicoEditando = signal<Medico | null>(null);
  protected readonly guardandoValor = signal(false);
  protected readonly formValor = new FormGroup({
    valor_consulta: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  ngOnInit(): void {
    this.filtros.valueChanges.subscribe(() => this.cargarReservas());
    this.cargarReservas();
    this.cargarMedicos();
    this.usuariosService.getPacientes().subscribe({
      next: (pacientes) => this.pacientes.set(pacientes),
      error: (err: HttpErrorResponse) =>
        this.mostrarError(err, 'No se pudieron cargar los pacientes.'),
    });
  }

  protected hayFiltrosAplicados(): boolean {
    return Object.values(this.filtros.getRawValue()).some((valor) => valor !== null);
  }

  protected limpiarFiltros(): void {
    this.filtros.reset();
  }

  protected puedeCancelar(turno: Reserva): boolean {
    return (
      turno.estado === EstadoReserva.ACTIVO &&
      this.reservasService.adminPuedeCancelar(turno.fecha_hora)
    );
  }

  protected cancelar(turno: Reserva): void {
    this.confirmationService.confirm({
      header: 'Cancelar turno',
      message: `¿Querés cancelar el turno de ${turno.paciente.nombres} ${turno.paciente.apellidos}?`,
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
            this.cargarReservas();
          },
          error: (err: HttpErrorResponse) =>
            this.mostrarError(err, 'No se pudo cancelar el turno.'),
        });
      },
    });
  }

  protected onReservada(): void {
    this.cargarReservas();
    this.tabActiva.set('turnos');
  }

  protected editarValor(medico: Medico): void {
    this.formValor.reset({ valor_consulta: medico.valor_consulta });
    this.medicoEditando.set(medico);
  }

  protected cerrarEdicion(): void {
    this.medicoEditando.set(null);
  }

  protected guardarValor(): void {
    const medico = this.medicoEditando();
    const valor = this.formValor.controls.valor_consulta.value;
    if (!medico || this.formValor.invalid || valor === null) {
      this.formValor.markAllAsTouched();
      return;
    }

    this.guardandoValor.set(true);
    this.medicosService.updateValorConsulta(medico.id, { valor_consulta: valor }).subscribe({
      next: (actualizado) => {
        this.guardandoValor.set(false);
        this.medicos.update((lista) =>
          lista.map((m) => (m.id === actualizado.id ? actualizado : m)),
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Valor actualizado',
          detail: `Nuevo valor para Dr/a. ${actualizado.apellidos}: $ ${actualizado.valor_consulta}`,
        });
        this.cerrarEdicion();
      },
      error: (err: HttpErrorResponse) => {
        this.guardandoValor.set(false);
        this.mostrarError(err, 'No se pudo actualizar el valor de la consulta.');
      },
    });
  }

  private cargarReservas(): void {
    const { fecha, id_medico, estado } = this.filtros.getRawValue();
    const filtro: FiltroReservas = {
      ...(fecha ? { fecha: formatearYMD(fecha) } : {}),
      ...(id_medico ? { id_medico } : {}),
      ...(estado ? { estado } : {}),
    };

    this.cargando.set(true);
    this.reservasService.getReservas(filtro).subscribe({
      next: (reservas) => {
        this.reservas.set(
          reservas.sort(
            (a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime(),
          ),
        );
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.mostrarError(err, 'No se pudieron cargar las reservas.');
      },
    });
  }

  private cargarMedicos(): void {
    this.medicosService.getMedicos().subscribe({
      next: (medicos) => this.medicos.set(medicos),
      error: (err: HttpErrorResponse) =>
        this.mostrarError(err, 'No se pudieron cargar los médicos.'),
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
