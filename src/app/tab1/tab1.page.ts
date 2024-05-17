import { Component } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FirestoreService } from '../servicios/firestore.service';
import { cargas, creditos } from './cargas';
import { Output, EventEmitter } from '@angular/core';
import { AlertController } from '@ionic/angular';




@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public ocultarCreditos:boolean = false;
  public ocultarHistorial:boolean = true;
  public btnHistorialLabel:string = "Ver historial";
  public creditoActual : number = 0;
  public iconoOcultar = "eye-outline";
  public suscripcion:Subscription | null = null;
  public suscripcion2:Subscription | null = null;
  public qrDisponibles : creditos[] = [];
  public flag = false;
  public flag2 = false;
  
  constructor(public autenticador:AutenticacionService,private router:Router,public spinner:NgxSpinnerService,public firestore:FirestoreService,private alertController:AlertController) 
  {

  }

  async ngOnInit()
  {
    this.spinner.show();

    await this.firestore.obtenerInfoUsuario(this.autenticador.usuarioActual.email);
    await this.firestore.obtenerCarga(this.firestore.datosUsuarioActual.id);
    // this.obtenerCreditoLabel();
    this.qrDisponibles = await firstValueFrom(this.firestore.obtenerCreditos());
    this.flag = false;
    this.ocultarCreditos = false;
    this.ocultarHistorial = true;
    this.spinner.hide();

    this.suscripcion = this.firestore.cambioQR().subscribe(dato =>
      {
        this.cargarCredito();
      }
    )

    // this.suscripcion = this.firestore.obtenerCreditos().subscribe(async creditos => 
    //   {
    //     if(this.flag)
    //     {
    //       this.qrDisponibles = await firstValueFrom(this.firestore.obtenerCreditos());
    //     }

    //     this.flag = true;
    //   }
    // );

    // this.suscripcion2 = this.firestore.escucharCarga(this.firestore.datosUsuarioActual.id).subscribe(dato =>
    //   {
    //     console.log("HUBO UN CAMBIO");
    //   }
    // )


  }

  ngOnDestroy()
  {
    this.suscripcion?.unsubscribe();
    this.suscripcion2?.unsubscribe();
  }

  async limpiarCreditos()
  {
    if(this.firestore.cargaUsuarioActual!= null)
    {
      if(this.firestore.cargaUsuarioActual.creditosTotales > 0)
      {
        const alert = await this.alertController.create({
          header: 'Confirmación',
          message: "¿Está seguro qué quiere limpiar sus creditos? Todos sus códigos y su historial se perdera",
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: async () => {
                const alert2 = await this.alertController.create(
                  {
                    header:"Operación Cancelada",
                    message:"Se ha cancelado con éxito su operación",
                    buttons:["Aceptar"]
                  }
                )

                await alert2.present();
              }
            },
            {
              text: 'Aceptar',
              handler: async () => {         
                this.spinner.show();

                setTimeout(async () => {
                if(this.firestore.cargaUsuarioActual != null)
                  {
                    this.firestore.cargaUsuarioActual.cargas = [];
                    this.firestore.cargaUsuarioActual.creditosTotales = 0;
                    this.creditoActual = this.firestore.cargaUsuarioActual.creditosTotales;
                  }
    
                  const cargaVacia = {cargas:[],creditosTotales:this.creditoActual};
                  await this.firestore.editarCarga(this.firestore.datosUsuarioActual.id,cargaVacia);    
                  this.spinner.hide();
                  const alert3 = await this.alertController.create(
                    {
                      header:"Operación Aceptada",
                      message:"Se han limpiado todos sus créditos",
                      buttons:["Aceptar"]
                    }
                  )
                  await alert3.present(); 
                }, 1500);

              }
            }
          ]
        });

        await alert.present();
      }
      else
      {
        const alert = await this.alertController.create({
          header: 'Error al limpiar créditos',
          message: "Debe tener créditos cargados para poder limpiar sus creditos",
          buttons: ['Aceptar'],
        });

        await alert.present();
      }
    }
  }

  cambiarEstadoHistorial()
  {
    this.spinner.show()
    
    setTimeout(() => {
      this.ocultarHistorial = !this.ocultarHistorial;
      this.ocultarHistorial ? this.btnHistorialLabel = "Ver Historial" : this.btnHistorialLabel = "Ocultar Historial";
      this.spinner.hide();
    }, 1500);
  }

  async cargarCredito()
  {

    this.spinner.show();

    if(this.qrDisponibles.length == 0)
    {
      this.qrDisponibles = await firstValueFrom(this.firestore.obtenerCreditos());
    }

    let valor = this.buscarQR();


    setTimeout(async () => {
      if(valor != null)
        {
          if((this.firestore.datosUsuarioActual.perfil == "admin" && this.contarQRCargas() < 2) || this.contarQRCargas() < 1)
            {
              const alert = await this.alertController.create({
                header: 'QR Escaneado éxitosamente',
                message: "El QR es correcto y se le han cargado al " + this.firestore.datosUsuarioActual.perfil +  " la cantidad de: " + valor.valor + " créditos",
                buttons: ['Aceptar'],
              });

              await alert.present();
              
              if(this.firestore.cargaUsuarioActual != null)
              {
                valor.fecha = new Date();
                this.firestore.cargaUsuarioActual.cargas.push(valor);
                this.firestore.cargaUsuarioActual.creditosTotales+=valor.valor;
                this.creditoActual = this.firestore.cargaUsuarioActual.creditosTotales;
              }

              const cargaNueva = {cargas:this.firestore.cargaUsuarioActual?.cargas,creditosTotales:this.creditoActual};
              await this.firestore.editarCarga(this.firestore.datosUsuarioActual.id,cargaNueva);
            }
            else
            {
              let mensaje = "El QR ya fue escaneado anteriormente por este usuario.";

              if(this.firestore.datosUsuarioActual.perfil == "admin")
              {
                mensaje = "El QR ya fue escaneado dos veces por el administrador y no se puede escanear más";
              }
              
              const alert = await this.alertController.create({
                header: 'Error al escanear el QR',
                message: mensaje,
                buttons: ['Aceptar'],
              }); 
              await alert.present();
           
            }
            
        }
        else
        {
          const alert = await this.alertController.create({
            header: 'Error al escanear el QR',
            message: 'El QR escaneado no es valido para la carga.',
            buttons: ['Aceptar'],
          });
          await alert.present();
        }
      this.spinner.hide();
    }, 1500);
  }

  obtenerFecha(fecha:any)
  {
    if(!this.ocultarHistorial)
    {
      try
      {
        let fechaDate : Date = fecha.toDate();
        let fechaString = fechaDate.getDate() + "/" + (fechaDate.getMonth() + 1) + "/" + fechaDate.getFullYear() + " " + fechaDate.getHours() + ":" + fechaDate.getMinutes();
        return fechaString;  
      }
      catch(e)
      {
        let fechaString = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes();
        return fechaString;  
      }
    }

    return "";  
  }

  buscarQR()
  {
    for (let i = 0; i < this.qrDisponibles.length; i++) {
      const qr = this.qrDisponibles[i];
      
      if(qr.codigo == this.firestore.qrActual)
      {
        return qr;
      }
      
    }

    return null;
  }

  contarQRCargas()
  {
    let contador = 0
    if(this.firestore.cargaUsuarioActual != null)
    {
      for (let i = 0; i < this.firestore.cargaUsuarioActual.cargas.length; i++) {
        const carga = this.firestore.cargaUsuarioActual.cargas[i];

        if(carga.codigo ==  this.firestore.qrActual)
        {
          contador++; 
        }

        if(contador == 2)
        {
          return 2;
        }
      } 
    }

    return contador;
  }

  // obtenerCreditoLabel()
  // {
  //   if(this.firestore.cargaUsuarioActual != null)
  //   {
  //     this.creditoActual = this.firestore.cargaUsuarioActual.creditosTotales;
  //   }
  // }

  // async obtenerCantidadCreditos()
  // {
  //   if(this.cargaUsuario == null)
  //   {
  //     this.ocultarCreditos = true;
  //     await this.inicializarCargas();
  //     this.ocultarCreditos = false;
  //   }
  //   else
  //   {
  //     this.creditoActual = this.cargaUsuario.creditosTotales;
  //   }
  // }

  cambiarEstadoCredito()
  {
    this.spinner.show()
    
    setTimeout(() => {
      this.ocultarCreditos = !this.ocultarCreditos;

      if(this.ocultarCreditos)
      {
        this.iconoOcultar = "eye-off-outline";
      }
      else
      {
        this.iconoOcultar = "eye-outline";
      }
      this.spinner.hide();
    }, 500);
  }

  cerrarSesion()
  {
    this.spinner.show();
    setTimeout(async () => {
      await this.autenticador.cerrarSesion();
      this.navigate("sesiones");
      this.spinner.hide();
      
    }, 500);
  }

  public navigate(url:string)
  {
    this.router.navigateByUrl(url);
  }

}
