import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';



@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firestore = inject(Firestore);
  auth:Auth= inject(Auth);
  user$ = user(this.auth);

  
  // userCollection = collection(this.firestore, 'user') as CollectionReference<any>;

  // dataObservable: Observable<any> = collectionData(this.userCollection);

  ngOnInit() {
  }

  // async print() {
  //   console.log(this.firestore);
  //   console.log("fireService");
  // }

  constructor(private router: Router) { }


  userName:any


  signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(this.auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
       console.log(user)
        this.router.navigate(['/', 'chat']);
              })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }
  
}
