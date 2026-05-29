import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { Profesional, Servicio } from '../../core/models';
import { ProfesionalService } from '../../core/services/profesional.service';
import { ServicioService } from '../../core/services/servicio.service';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';
import { ServiciosSection } from './servicios-section/servicios-section';
import { ProfesionalesSection } from './profesionales-section/profesionales-section';

/** Página pública: hero + servicios + profesionales + contacto. */
@Component({
  selector: 'app-landing',
  imports: [RouterLink, Header, Footer, ServiciosSection, ProfesionalesSection],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  private readonly servicioService = inject(ServicioService);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly profesionales = signal<Profesional[]>([]);
  protected readonly cargandoServicios = signal(true);
  protected readonly cargandoProfesionales = signal(true);

  /**
   * Ubicación del local que se muestra en el mapa de la sección de contacto.
   * Coordenadas genéricas del centro de Buenos Aires (Obelisco) porque la
   * dirección actual ("Av. Siempreviva 742") es ficticia. Para un cliente real,
   * reemplazar únicamente estas dos constantes por la ubicación exacta del
   * local: el bbox y el marcador se recalculan solos.
   */
  private readonly localLat = -34.6037;
  private readonly localLon = -58.3816;

  /** URL del mapa embebido de OpenStreetMap, sanitizada para usarla en el iframe. */
  protected readonly mapaUrl: SafeResourceUrl = this.buildMapaUrl();

  constructor() {
    this.servicioService
      .listarPublicos()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (servicios) => {
          this.servicios.set(servicios);
          this.cargandoServicios.set(false);
        },
        error: () => this.cargandoServicios.set(false),
      });

    this.profesionalService
      .listarPublicos()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (profesionales) => {
          this.profesionales.set(profesionales);
          this.cargandoProfesionales.set(false);
        },
        error: () => this.cargandoProfesionales.set(false),
      });
  }

  /** Arma la URL del iframe de OpenStreetMap centrada en la ubicación del local. */
  private buildMapaUrl(): SafeResourceUrl {
    // Margen chico alrededor del punto para mostrar la cuadra/zona, no toda la ciudad.
    const margenLon = 0.0045;
    const margenLat = 0.0035;
    const bbox = [
      this.localLon - margenLon,
      this.localLat - margenLat,
      this.localLon + margenLon,
      this.localLat + margenLat,
    ].join('%2C');
    const url =
      `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}` +
      `&layer=mapnik&marker=${this.localLat}%2C${this.localLon}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
