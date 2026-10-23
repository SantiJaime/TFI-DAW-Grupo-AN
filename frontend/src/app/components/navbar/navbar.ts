import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toolbar } from 'primeng/toolbar';
import { RolUsuario } from '../../core/enums/usuario.enums';
import { AuthService } from '../../core/services/auth.service';

interface SeccionRol {
  etiqueta: string;
  ruta: string;
  enlace: string;
  icono: string;
}

const SECCION_POR_ROL: Record<RolUsuario, SeccionRol> = {
  [RolUsuario.PACIENTE]: {
    etiqueta: 'Paciente',
    ruta: '/paciente',
    enlace: 'Mis turnos',
    icono: 'pi pi-calendar',
  },
  [RolUsuario.MEDICO]: {
    etiqueta: 'Médico',
    ruta: '/medico',
    enlace: 'Agenda',
    icono: 'pi pi-clock',
  },
  [RolUsuario.ADMINISTRADOR]: {
    etiqueta: 'Administrador',
    ruta: '/admin',
    enlace: 'Administración',
    icono: 'pi pi-cog',
  },
};

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Toolbar, Button, Tag],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly authService = inject(AuthService);

  protected readonly seccion = computed(() => {
    const rol = this.authService.usuario()?.rol;
    return rol ? SECCION_POR_ROL[rol] : null;
  });
}
