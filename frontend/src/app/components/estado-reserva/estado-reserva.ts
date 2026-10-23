import { Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import { EstadoReserva } from '../../core/enums/reserva.enums';
import { ESTADOS_RESERVA } from '../../core/utils/reservas.utils';

@Component({
  selector: 'app-estado-reserva',
  imports: [Tag],
  template: `<p-tag [value]="info().etiqueta" [severity]="info().severidad" />`,
})
export class EstadoReservaTag {
  readonly estado = input.required<EstadoReserva>();

  protected readonly info = computed(() => ESTADOS_RESERVA[this.estado()]);
}
