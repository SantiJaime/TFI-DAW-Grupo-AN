import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { AuthService } from '../../core/services/auth.service';
import { mensajeError } from '../../core/utils/errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputText, Password, Button],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  protected readonly cargando = signal(false);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    clave: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected campoInvalido(campo: 'email' | 'clave'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
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

    this.cargando.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: ({ usuario }) => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Sesión iniciada',
          detail: `Bienvenido/a, ${usuario.nombres}`,
        });
        this.router.navigate(['/inicio']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al iniciar sesión',
          detail: mensajeError(err, 'Ocurrió un error al iniciar sesión.'),
        });
      },
    });
  }
}
