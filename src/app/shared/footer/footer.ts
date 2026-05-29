import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Pie de página de las secciones públicas. */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly anio = new Date().getFullYear();
}
