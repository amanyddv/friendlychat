import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, DocumentData, DocumentReference, addDoc, serverTimestamp, query, orderBy, limit } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { Auth, signOut, user } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';



@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firestore = inject(Firestore);
  auth:Auth= inject(Auth);
  private storage: Storage = inject(Storage);

  
  user$ = user(this.auth);

  


  ngOnInit() {
  }

  

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
  logout() {
    signOut(this.auth).then(() => {
        this.router.navigate(['/'])
        console.log('signed out');
    }).catch((error) => {
        console.log('sign out error: ' + error);
    })
}


// Adds a text or image message to Cloud Firestore.
addMessage = async(textMessage: string ): Promise<void | DocumentReference<DocumentData>> => {
  let data: any;
  console.log("work")
  try {
    this.user$.subscribe(async (user) => 
    { 
      if(textMessage && textMessage.length > 0) {
        data =  await addDoc(collection(this.firestore, 'messages'), {
          name: user?.displayName,
          text: textMessage,
          profilePicUrl: user?.photoURL,
          timestamp: serverTimestamp(),
          uid: user?.uid
        })}
       
        return data;
      }
    );
  }
  catch(error) {
    console.error('Error writing new message to Firebase Database', error);
    return;
  }
}

// Saves a new message to Cloud Firestore.
saveTextMessage = async (messageText: string) => {
  this.addMessage(messageText)
  return null;
};

loadMessages = () => {
  const recentMessagesQuery = query(collection(this.firestore, 'messages'), orderBy('timestamp', 'desc'), limit(12));
  return collectionData(recentMessagesQuery);
}



}
