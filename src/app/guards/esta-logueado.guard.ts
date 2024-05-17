import { CanActivateFn, Router } from "@angular/router";
import { AutenticacionService } from "../servicios/autenticacion.service";
import { firstValueFrom } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class estaLogueadoGuard 
{
  constructor(private autenticador: AutenticacionService, private router: Router) 
  {

  }

  canActivate: CanActivateFn = async (): Promise<boolean> => 
  {
    const observable = this.autenticador.obtenerUsuarioLogueado();
    this.autenticador.usuarioActual = await firstValueFrom(observable);
    
    if(this.autenticador.usuarioActual != null)
    {
      return true;
    }

    this.router.navigateByUrl("sesiones");
    return false;
  };
}