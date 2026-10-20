import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-inicio',
  imports: [Toolbar, Card, Tag, Button],
  template: `
    <p-toolbar>
      <ng-template #start>
        <span class="marca">Clínica Médica</span>
      </ng-template>
      <ng-template #end>
        <p-button
          label="Cerrar sesión"
          icon="pi pi-sign-out"
          severity="secondary"
          [outlined]="true"
          (onClick)="authService.logout()"
        />
      </ng-template>
    </p-toolbar>

    <main class="inicio">
      @if (authService.usuario(); as usuario) {
        <p-card [header]="'Bienvenido/a, ' + usuario.nombres + ' ' + usuario.apellidos">
          <p class="dato">Email: {{ usuario.email }}</p>
          <p class="dato">Rol: <p-tag [value]="usuario.rol" /></p>
        </p-card>
      }
    </main>
  `,
  styles: `
    .marca {
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--p-primary-color);
    }
    .inicio {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .dato {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }
  `,
})
export class Inicio {
  protected readonly authService = inject(AuthService);
}
