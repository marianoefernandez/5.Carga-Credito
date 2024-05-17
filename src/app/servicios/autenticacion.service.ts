import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import  firebase  from 'firebase/compat/app';


@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  constructor(private autenticador: AngularFireAuth) 
  {

  }

  public usuarioActual:any|null =null;

  
  async registro(email:string,contraseña:string)
  {
    try
    {
      const usuario = await this.autenticador.createUserWithEmailAndPassword(email,contraseña);
      usuario.user?.sendEmailVerification()
      return usuario;
    }
    catch(error:any)
    {      
      return error.code;
    }
  }

  async login(email:string,contraseña:string)
  {
    try
    {
      return await this.autenticador.signInWithEmailAndPassword(email,contraseña);
    }
    catch(error:any)
    {
      return error.code;
    }
  }

  async loginConGoogle(email:string,contraseña:string)
  {
    try
    {
      return await this.autenticador.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
    catch(error)
    {
      console.log("Error en google con google", error);
      return false;
    }
  }

  obtenerUsuarioLogueado()
  {
    return this.autenticador.authState;
  }

  cerrarSesion()
  {
    return this.autenticador.signOut();
  }

  reeviarEmail()
  {
    if(this.usuarioActual != null)
    {
      this.usuarioActual?.sendEmailVerification();
    }
  }

  async recuperarClave(email:string)
  {
    return this.autenticador.sendPasswordResetEmail(email).then(function()
    {
      return true;
    }).catch(function()
    {
      return false;
    })
  }
}
