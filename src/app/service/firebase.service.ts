import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, DocumentData, DocumentReference, addDoc, serverTimestamp, query, orderBy, limit, updateDoc, doc, setDoc } from '@angular/fire/firestore';

import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { Auth, signOut, user } from '@angular/fire/auth';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';



@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  private storage: Storage = inject(Storage);
  messaging: Messaging = inject(Messaging);


  constructor(private router: Router) { }

  userName: any
  user$ = user(this.auth);


  signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(this.auth, provider)
      .then(() => {
        this.router.navigate(['/', 'chat']);
      })
      .catch((error) => {
        console.log("login error",error)
      });
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/'])
    }).catch((error) => {
      console.log('sign out error: ' + error);
    })
  }


  addMessage = async (textMessage: string | null, imageUrl: string | null): Promise<void | DocumentReference<DocumentData>> => {
    let data: any;
    try {
      this.user$.subscribe(async (user) => {
        if (textMessage && textMessage.length > 0) {
          data = await addDoc(collection(this.firestore, 'messages'), {
            name: user?.displayName,
            text: textMessage,
            profilePicUrl: user?.photoURL,
            timestamp: serverTimestamp(),
            uid: user?.uid
          })
        }
        else if (imageUrl && imageUrl.length > 0) {
          data = await addDoc(collection(this.firestore, 'messages'), {
            name: user?.displayName,
            imageUrl: imageUrl,
            profilePicUrl: user?.photoURL,
            timestamp: serverTimestamp(),
            uid: user?.uid
          });
        }

      }
      );
    }
    catch (error) {
      console.error('Error writing new message to Firebase Database', error);
      return;
    }
  }

  saveTextMessage = async (messageText: string) => {
    this.addMessage(messageText, null)
    return null;
  };

  loadMessages = () => {
    const recentMessagesQuery = query(collection(this.firestore, 'messages'), orderBy('timestamp', 'desc'), limit(12));
    return collectionData(recentMessagesQuery);
  }

 
  saveImageMessage = async (file: any) => {
    try {
   
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const formattedTime = currentDate.toTimeString().split(' ')[0].replace(/:/g, ''); 

      const filePath = `${this.auth.currentUser?.uid}/${formattedDate}_${formattedTime}_${file.name}`;
      const newImageRef = ref(this.storage, filePath);
      const fileSnapshot = await uploadBytesResumable(newImageRef, file);

      const publicImageUrl = await getDownloadURL(newImageRef);
      const messageRef = await this.addMessage(null, publicImageUrl);
      
    } catch (error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    }
  }

  // Saves the messaging device token to Cloud Firestore.
saveMessagingDeviceToken= async () => {
  try {
    
    const currentToken = await getToken(this.messaging);
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to Cloud Firestore.
      const tokenRef = doc(this.firestore, 'fcmTokens', currentToken);
      console.log(this.auth.currentUser)
    
      await setDoc(tokenRef, { uid: this.auth.currentUser?.uid });

      // This will fire when a message is received while the app is in the foreground.
      // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
      onMessage(this.messaging, (message) => {
        console.log(
          'New foreground notification from Firebase Messaging!',
          message.notification
        );
      });
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  } catch(error) {
    console.error('Unable to get messaging token.', error);
  };
}
  
// Requests permissions to show notifications.
requestNotificationsPermissions = async () => {
  console.log('Requesting notifications permission...');
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    // Notification permission granted.
    await this.saveMessagingDeviceToken();
  } else {
    console.log('Unable to get permission to notify.');
  }
}


}
