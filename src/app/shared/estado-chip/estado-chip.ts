import { Component, computed, input } from '@angular/core';

import { EstadoTurno } from '../../core/models';
import { ESTADO_ETIQUETA } from '../util/format';

/** Insignia de color según el estado de un turno. */
@Component({
  selector: 'app-estado-chip',
  template: `<span class="chip" [class]="'estado-' + estado().toLowerCase()">{{ etiqueta() }}</span>`,
  styleUrl: './estado-chip.css',
})
export class EstadoChip {
  readonly estado = input.required<EstadoTurno>();
  protected readonly etiqueta = computed(() => ESTADO_ETIQUETA[this.estado()]);
}
