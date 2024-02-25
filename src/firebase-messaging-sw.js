importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAEyIJlkztngBRpHFxwYBQzVXJ6F4BlmWc",
    authDomain: "webchat-e847e.firebaseapp.com",
    projectId: "webchat-e847e",
    storageBucket: "webchat-e847e.appspot.com",
    messagingSenderId: "522893390039",
    appId: "1:522893390039:web:4f9fa6a0c5d2eb82220092"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((message) => {
    console.log('Background message received: ', message);
  });