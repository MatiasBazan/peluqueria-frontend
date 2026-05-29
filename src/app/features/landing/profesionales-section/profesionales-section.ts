import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Profesional } from '../../../core/models';

/** Sección "Profesionales" de la landing. Recibe el equipo activo del backend. */
@Component({
  selector: 'app-profesionales-section',
  imports: [RouterLink],
  templateUrl: './profesionales-section.html',
  styleUrl: './profesionales-section.css',
})
export class ProfesionalesSection {
  readonly profesionales = input.required<Profesional[]>();
  readonly cargando = input<boolean>(false);

  protected readonly skeletons = [0, 1, 2];

  protected fotoDe(p: Profesional): string {
    return p.foto || `https://picsum.photos/seed/lumiere-${p.id}/400/400`;
  }
}
