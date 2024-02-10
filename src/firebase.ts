import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

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

const registerWithEmailAndPassword = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = res;
    const status = 'active';
    const registrationDate = Date.now();
    const lastLoginDate = registrationDate;
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      name,
      email,
      registrationDate,
      lastLoginDate,
      status,
      authProvider: 'local',
    });
  } catch (err) {
    if (err instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(err.message);
    }
  }
};

const logInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err instanceof Error) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(err.message);
    }
  }
};

const logout = () => {
  signOut(auth);
};

export { registerWithEmailAndPassword, logInWithEmailAndPassword, logout };
