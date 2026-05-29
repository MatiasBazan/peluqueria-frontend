import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Cabecera fija con navegación, usada en las páginas públicas. */
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly menuAbierto = signal(false);

  protected toggleMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
