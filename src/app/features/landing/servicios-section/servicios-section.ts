import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Servicio } from '../../../core/models';
import { formatDuracion, formatPrecio } from '../../../shared/util/format';

/** Sección "Servicios" de la landing. Recibe los servicios activos del backend. */
@Component({
  selector: 'app-servicios-section',
  imports: [RouterLink],
  templateUrl: './servicios-section.html',
  styleUrl: './servicios-section.css',
})
export class ServiciosSection {
  readonly servicios = input.required<Servicio[]>();
  readonly cargando = input<boolean>(false);

  protected readonly formatPrecio = formatPrecio;
  protected readonly formatDuracion = formatDuracion;
  protected readonly skeletons = [0, 1, 2, 4];
}
