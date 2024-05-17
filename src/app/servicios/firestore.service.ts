import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { cargas, creditos } from '../tab1/cargas';

@Injectable({
  providedIn: 'root'
})

export class FirestoreService {

  constructor(private firestore: Firestore) { }

  private creditos = collection(this.firestore,'creditos');
  private usuarios = collection(this.firestore,"usuarios");
  private cargas = collection(this.firestore,"cargas");
  public datosUsuarioActual:any;
  public cargaUsuarioActual:cargas | null = null;
  public qrActual = "";
  public flagQR = false;

  agregarInformacionUsuario(usuario:any)
  {
    try
    {
      return addDoc(this.usuarios,usuario);
    }
    catch(error:any)
    {
      console.log(error.code);
      return null;
    }
  }

  async obtenerInfoUsuario(email:string)
  {
    try
    {
      const consulta = query(this.usuarios, where("email", "==", email));
      const consultaEjecuto = await getDocs(consulta);
      let datos = false;
      consultaEjecuto.forEach((datos) => 
      {
        // doc.data() is never undefined for query doc snapshots
        this.datosUsuarioActual = datos.data();
        return true;
      });   
      return false;
     }
    catch(error:any)
    {
      console.log(error.code);
      return null;
    }
  }

  limpiarCreditos()
  {
    
  }

  obtenerUsuarios(): Observable<any[]> 
  {
    return new Observable<any[]>((observable) => {
      onSnapshot(this.usuarios, (snap) => {
        const usuarios: any[] = [];
        snap.docChanges().forEach(x => {
          const user = x.doc.data() as any;
          usuarios.push(user);
        });
        observable.next(usuarios);
      });
    });
  }

  obtenerCreditos(): Observable<creditos[]> 
  {
    return new Observable<any[]>((observable) => {
      onSnapshot(this.creditos, (snap) => {
        const creditos: any[] = [];
        snap.docChanges().forEach(x => {
          const credit = x.doc.data() as any;
          creditos.push(credit);
        });
        observable.next(creditos);
      });
    });
  }

  // escucharCarga(idUsuario:number): Observable<cargas[]> 
  // {
  //   return new Observable<any[]>((observable) => {
  //     onSnapshot(this.cargas, async (snap) => {
  //       const cargas: any[] = [];
  //       snap.docChanges().forEach(x => {
  //         const carga = x.doc.data() as any;
  //         cargas.push(carga);
  //       });
  //       observable.next(cargas);
  //     });
  //   });
  // }

  cambioQR():Observable<string>
  {
    return new Observable<string>((observable) =>
    {
      setInterval(() => 
      {
      if(this.flagQR)
      {
        observable.next();
        this.flagQR = false;
      }      
      }, 10);

    })
  }

  agregarNuevaCarga(carga:cargas)
  {
    try
    {
      return addDoc(this.cargas,carga);
    }
    catch(error:any)
    {
      console.log(error.code);
      return null;
    }
  }

  async editarCarga(idJugador:number,dato:any)
  {
    try
    {
      const consulta = query(this.cargas, where("id", "==", idJugador));
      const consultaEjecuto = await getDocs(consulta);
      consultaEjecuto.forEach(async (datos) => 
      {
        // doc.data() is never undefined for query doc snapshots
        const id = datos.id;
        await updateDoc(doc(this.firestore,"cargas",id),
      {
        cargas:dato.cargas,
        creditosTotales:dato.creditosTotales
      })
      });   
      return true;
     }
    catch(error:any)
    {
      console.log(error.code);  
      return null;
    }
  }

  async obtenerCarga(idJugador:number)
  {
    try
    {
      const consulta = query(this.cargas, where("id", "==", idJugador));
      const consultaEjecuto = await getDocs(consulta);
      let carga:any = null;
      consultaEjecuto.forEach((datos) => 
      {
        // doc.data() is never undefined for query doc snapshots
        carga = datos.data();
      });   
      this.cargaUsuarioActual = carga;
      return carga;
     }
    catch(error:any)
    {
      console.log(error.code);
      return null;
    }
  }
}