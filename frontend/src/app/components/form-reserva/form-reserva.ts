import { DecimalPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { merge } from 'rxjs';
import { Medico } from '../../core/models/medico.models';
import { Reserva } from '../../core/models/reserva.models';
import { Usuario } from '../../core/models/usuario.models';
import { ReservasService } from '../../core/services/reservas.service';
import { mensajeError } from '../../core/utils/errores';
import { formatearYMD } from '../../core/utils/reservas.utils';

const DIAS_MAXIMOS_ANTICIPACION = 30;

interface OpcionHorario {
  etiqueta: string;
  fecha_hora: string;
  ocupado: boolean;
}

@Component({
  selector: 'app-form-reserva',
  imports: [ReactiveFormsModule, Select, DatePicker, SelectButton, Button, DecimalPipe, DatePipe],
  templateUrl: './form-reserva.html',
  styleUrl: './form-reserva.css',
})
export class FormReserva implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly medicos = input.required<Medico[]>();
  readonly pacientes = input<Usuario[] | null>(null);
  readonly reservada = output<Reserva>();

  protected readonly horarios = signal<OpcionHorario[]>([]);
  protected readonly cargandoHorarios = signal(false);
  protected readonly enviando = signal(false);

  protected readonly fechaMinima = new Date();
  protected readonly fechaMaxima = (() => {
    const max = new Date();
    max.setDate(max.getDate() + DIAS_MAXIMOS_ANTICIPACION);
    return max;
  })();

  protected readonly form = new FormGroup({
    id_paciente: new FormControl<number | null>(null),
    id_medico: new FormControl<number | null>(null, { validators: [Validators.required] }),
    fecha: new FormControl<Date | null>(null, { validators: [Validators.required] }),
    fecha_hora: new FormControl<string | null>(null, { validators: [Validators.required] }),
  });

  private readonly idMedico = toSignal(this.form.controls.id_medico.valueChanges, {
    initialValue: null,
  });
  private readonly idPaciente = toSignal(this.form.controls.id_paciente.valueChanges, {
    initialValue: null,
  });
  protected readonly fechaHora = toSignal(this.form.controls.fecha_hora.valueChanges, {
    initialValue: null,
  });

  protected readonly opcionesMedicos = computed(() =>
    this.medicos().map((m) => ({
      etiqueta: `Dr/a. ${m.apellidos}, ${m.nombres} (Mat. ${m.matricula})`,
      id: m.id,
    })),
  );

  protected readonly opcionesPacientes = computed(() =>
    (this.pacientes() ?? []).map((p) => ({
      etiqueta: `${p.apellidos}, ${p.nombres} (DNI ${p.documento})`,
      id: p.id,
    })),
  );

  protected readonly medicoSeleccionado = computed(
    () => this.medicos().find((m) => m.id === this.idMedico()) ?? null,
  );

  protected readonly pacienteSeleccionado = computed(
    () => this.pacientes()?.find((p) => p.id === this.idPaciente()) ?? null,
  );

  ngOnInit(): void {
    if (this.pacientes()) {
      this.form.controls.id_paciente.addValidators(Validators.required);
    }

    merge(this.form.controls.id_medico.valueChanges, this.form.controls.fecha.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cargarHorarios());
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Completá todos los pasos para reservar el turno.',
      });
      return;
    }

    const { id_paciente, id_medico, fecha_hora } = this.form.getRawValue();
    this.enviando.set(true);

    this.reservasService
      .createReserva({
        id_medico: id_medico!,
        fecha_hora: fecha_hora!,
        ...(id_paciente ? { id_paciente } : {}),
      })
      .subscribe({
        next: (reserva) => {
          this.enviando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Turno reservado',
            detail: `Turno con Dr/a. ${reserva.medico.apellidos} reservado correctamente.`,
          });
          this.form.reset();
          this.horarios.set([]);
          this.reservada.emit(reserva);
        },
        error: (err: HttpErrorResponse) => {
          this.enviando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'No se pudo reservar',
            detail: mensajeError(err, 'Ocurrió un error al reservar el turno.'),
          });
          if (err.status === 409) {
            this.cargarHorarios();
          }
        },
      });
  }

  private cargarHorarios(): void {
    const { id_medico, fecha } = this.form.getRawValue();
    this.form.controls.fecha_hora.reset();

    if (!id_medico || !fecha) {
      this.horarios.set([]);
      return;
    }

    this.cargandoHorarios.set(true);
    this.reservasService.getDisponibilidad(id_medico, formatearYMD(fecha)).subscribe({
      next: (disponibilidad) => {
        const ahora = Date.now();
        this.horarios.set(
          disponibilidad.map((d) => {
            const inicio = new Date(d.fecha_hora);
            return {
              etiqueta: `${String(inicio.getHours()).padStart(2, '0')}:00`,
              fecha_hora: d.fecha_hora,
              ocupado: !d.disponible || inicio.getTime() <= ahora,
            };
          }),
        );
        this.cargandoHorarios.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.horarios.set([]);
        this.cargandoHorarios.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar horarios',
          detail: mensajeError(err, 'No se pudieron obtener los horarios disponibles.'),
        });
      },
    });
  }
}
