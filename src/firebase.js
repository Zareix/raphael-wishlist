import firebase from "firebase/compat/app"
import { getAuth } from "firebase/auth"
import "firebase/compat/firestore"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyB5OhrV6i_RuOw44cDgWjd0ujdXxhnVB44",
  authDomain: "raphael-wishlist.firebaseapp.com",
  projectId: "raphael-wishlist",
  storageBucket: "raphael-wishlist.appspot.com",
  messagingSenderId: "20760194101",
  appId: "1:20760194101:web:982bc1b2d4527e3d2e557c",
}

firebase.initializeApp(firebaseConfig)

const firebaseApp = firebase.app()

export const auth = getAuth(firebaseApp)

export const db = firebase.firestore()

export const db9 = getFirestore(firebaseApp)
