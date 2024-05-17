import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';




const firebaseConfig = {
  apiKey: "AIzaSyB8dYQ_SCeEvibegt1-WJ3SHDHW2OmzCOI",
  authDomain: "aplicaciones-pps-40a32.firebaseapp.com",
  projectId: "aplicaciones-pps-40a32",
  storageBucket: "aplicaciones-pps-40a32.appspot.com",
  messagingSenderId: "567945289994",
  appId: "1:567945289994:web:594c0dad08dad859521af3"
};

@NgModule({
  declarations: [AppComponent],
  imports: 
  [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    NgxSpinnerModule,
    BrowserAnimationsModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
