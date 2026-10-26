import { RolUsuario } from '../enums/usuario.enums';

const COLOR_SIN_SESION = 'blue';

export const COLOR_POR_ROL: Record<RolUsuario, string> = {
  [RolUsuario.ADMINISTRADOR]: 'orange',
  [RolUsuario.MEDICO]: 'purple',
  [RolUsuario.PACIENTE]: 'green',
};

const TONOS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export function aplicarColorDeRol(rol: RolUsuario | undefined): void {
  const color = rol ? COLOR_POR_ROL[rol] : COLOR_SIN_SESION;
  const estilos = document.documentElement.style;
  for (const tono of TONOS) {
    estilos.setProperty(`--p-primary-${tono}`, `var(--p-${color}-${tono})`);
  }
}
