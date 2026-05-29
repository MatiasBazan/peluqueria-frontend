import { Component, input, output } from '@angular/core';

/**
 * Estado de error reutilizable para vistas que cargan datos del backend.
 * Muestra un mensaje claro y un botón para reintentar la carga.
 */
@Component({
  selector: 'app-estado-error',
  template: `
    <div class="estado-error card">
      <span class="material-icons">cloud_off</span>
      <p>{{ mensaje() }}</p>
      <button type="button" class="btn btn-ghost btn-sm" (click)="reintentar.emit()">
        <span class="material-icons">refresh</span>
        Reintentar
      </button>
    </div>
  `,
  styles: `
    .estado-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 56px 24px;
      color: var(--muted);
      text-align: center;
    }

    .estado-error .material-icons {
      font-size: 40px;
      color: var(--danger);
    }

    .estado-error .btn .material-icons {
      font-size: 18px;
      color: inherit;
    }
  `,
})
export class EstadoError {
  /** Mensaje a mostrar bajo el ícono. */
  readonly mensaje = input('No pudimos cargar la información.');
  /** Emitido al presionar "Reintentar". */
  readonly reintentar = output<void>();
}
