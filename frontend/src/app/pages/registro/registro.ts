import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { mensajeError } from '../../core/utils/errores';

const LARGO_MINIMO_CLAVE = 6;

type Campo = 'nombres' | 'apellidos' | 'documento' | 'email' | 'clave' | 'confirmacion';

function clavesIguales(form: AbstractControl): ValidationErrors | null {
  const { clave, confirmacion } = form.value;
  return clave && confirmacion && clave !== confirmacion ? { clavesDistintas: true } : null;
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, InputText, Password, Button],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  protected readonly cargando = signal(false);
  protected readonly largoMinimoClave = LARGO_MINIMO_CLAVE;

  protected readonly form = new FormGroup(
    {
      nombres: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      apellidos: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      documento: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{7,8}$/)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      clave: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(LARGO_MINIMO_CLAVE)],
      }),
      confirmacion: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: clavesIguales },
  );

  protected campoInvalido(campo: Campo): boolean {
    const control = this.form.controls[campo];
    const invalido =
      control.invalid || (campo === 'confirmacion' && this.form.hasError('clavesDistintas'));
    return invalido && (control.touched || control.dirty);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Revisá los campos marcados.',
      });
      return;
    }

    const { confirmacion, ...datos } = this.form.getRawValue();
    this.cargando.set(true);

    this.authService
      .registrar(datos)
      .pipe(switchMap(() => this.authService.login({ email: datos.email, clave: datos.clave })))
      .subscribe({
        next: ({ usuario }) => {
          this.cargando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Cuenta creada',
            detail: `Bienvenido/a, ${usuario.nombres}. Ya podés reservar tus turnos.`,
          });
          this.router.navigate(['/inicio']);
        },
        error: (err: HttpErrorResponse) => {
          this.cargando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'No se pudo crear la cuenta',
            detail: mensajeError(err, 'Ocurrió un error al registrarse.'),
          });
        },
      });
  }
}
