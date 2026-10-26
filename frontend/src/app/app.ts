import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Navbar } from './components/navbar/navbar';
import { AuthService } from './core/services/auth.service';
import { aplicarColorDeRol } from './core/utils/tema';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialog, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthService);

  constructor() {
    effect(() => aplicarColorDeRol(this.authService.usuario()?.rol));
  }
}
