import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDEZgeBkZa8rSPStUjFxZHZho41u4snseA',
  authDomain: 'admin-management-893f1.firebaseapp.com',
  projectId: 'admin-management-893f1',
  storageBucket: 'admin-management-893f1.appspot.com',
  messagingSenderId: '673749600167',
  appId: '1:673749600167:web:2c818dc396abccc07f1882',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
