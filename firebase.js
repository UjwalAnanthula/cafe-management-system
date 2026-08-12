const firebaseConfig = {
  apiKey: "AIzaSyBXMVdEm_W6HAmDtydXJTI8xJyhNNGtcHI",
  authDomain: "bean-and-bloom-cafe-936ed.firebaseapp.com",
  projectId: "bean-and-bloom-cafe-936ed",
  storageBucket: "bean-and-bloom-cafe-936ed.firebasestorage.app",
  messagingSenderId: "273869683823",
  appId: "1:273869683823:web:e021576ef64796b864a19a",
  measurementId: "G-VTDEVVM8V2"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

window.firebaseDb = db;
window.firebaseAuth = auth;
window.db = db;