import { AutenticacionService } from '../servicios/autenticacion.service';
import { CanActivateFn } from '@angular/router';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class noEstaLogueadoGuard {
  constructor(private autenticador: AutenticacionService, private router: Router) 
  {
    
  }

  canActivate: CanActivateFn = async (): Promise<boolean> => 
  {
    const observable = this.autenticador.obtenerUsuarioLogueado();
    this.autenticador.usuarioActual = await firstValueFrom(observable);
    
    if(this.autenticador.usuarioActual == null)
    {
      return true;
    }
    this.router.navigateByUrl("tabs/tab1");
    return false;
  };
}