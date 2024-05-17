import { Component } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { FirestoreService } from '../servicios/firestore.service';
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
  Barcode,
} from '@capacitor-mlkit/barcode-scanning';
import swal from 'sweetalert2';
import { AlertController } from '@ionic/angular';
import { cargas, creditos } from '../tab1/cargas';




@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {


  scannedResult: any;
  content_visibility = '';
  public barcodes: Barcode[] = [];

  constructor(private autenticador:AutenticacionService,private spinner:NgxSpinnerService,private router:Router,private firestore:FirestoreService,private alertController:AlertController) 
  {

  }

  async ngOnInit()
  {
    if(this.firestore.datosUsuarioActual == null)
    {
      setTimeout(async () => {
        this.spinner.show();
        this.autenticador.usuarioActual =  await firstValueFrom(this.autenticador.obtenerUsuarioLogueado());
        await this.firestore.obtenerInfoUsuario(this.autenticador.usuarioActual.email);
        this.spinner.hide();  
      }, 500);
    }
  }

  cerrarSesion()
  {
    this.spinner.show();
    setTimeout(async () => {
      await this.autenticador.cerrarSesion();
      this.navigate("sesiones");
      this.spinner.hide();
      
    }, 1500);
  }

  public async escanearQR()
  {
    this.barcodes = [];
    await this.scan();
    this.firestore.qrActual = this.barcodes[0].rawValue;
    // this.firestore.qrActual = '8c95def646b6127282ed50454b73240300dccabc';
    this.firestore.flagQR = true;

    // this.spinner.show();

    // setTimeout(() => {
    //   this.spinner.hide();
    //   this.firestore.flagQR = true;
    // }, 1000);
    
    // swal.fire
    // (
    //   {
    //     title:"QR EXITOSO",
    //     text:this.barcodes[0].rawValue,
    //     icon:'success',
    //     heightAuto:false
    //   }
    // )
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
    //await this.presentAlert2();
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    
    const alert = await this.alertController.create({
      header: 'Permiso denegado',
      message: 'Por favor active la cámara para poder escanear el QR .',
      buttons: ['Aceptar'],
    });
    await alert.present();
  }

  async presentAlert2(): Promise<void> {
    
    const alert = await this.alertController.create({
      header: 'Operación exitosa',
      message: this.barcodes[0].rawValue,
      buttons: ['OK'],
    });
    await alert.present();
  }

  public navigate(url:string)
  {
    this.router.navigateByUrl(url);
  }
}
