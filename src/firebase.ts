import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

export type UserType = {
  id: string;
  name: string;
  email: string;
  password: string;
  lastLoginDate: string;
  registeredDate: string;
  status: 'active' | 'blocked';
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getLastUser = async (): Promise<undefined | Error | UserType> => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const lastUser = querySnapshot.docs[0] as unknown as UserType;
      return lastUser;
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error("Didn't find the last user");
    }
    return undefined;
  }
};

const findUserByEmail = async (
  email: string
): Promise<UserType | undefined | Error> => {
  try {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map((docItem) => ({
      ...docItem.data(),
      id: docItem.id,
    })) as UserType[];
    return users[0];
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Error: ${err.message}`);
    }
    return undefined;
  }
};

const logInAdminWithEmailAndPassword = async () => {
  try {
    const user = await signInWithEmailAndPassword(
      auth,
      import.meta.env.VITE_adminEmail,
      import.meta.env.VITE_adminPassword
    );
    return user;
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message);
    }
    return undefined;
  }
};

const updateLastLogin = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { lastLoginDate: new Date().toISOString() });
  } catch (err) {
    if (err instanceof Error) {
      alert(`Error updating last login: ${err.message}`);
    }
  }
};

const logInWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserType | undefined> => {
  try {
    await logInAdminWithEmailAndPassword();
    const getUserByEmail = await findUserByEmail(email);

    if (!getUserByEmail || getUserByEmail instanceof Error) {
      if (getUserByEmail instanceof Error) {
        throw new Error(getUserByEmail.message);
      }

      alert('Email or password is wrong');
      return undefined;
    }

    if (getUserByEmail.password !== password) {
      alert('Email or password is wrong');
      return undefined;
    }

    await updateLastLogin(getUserByEmail.id);

    return getUserByEmail;
  } catch (err) {
    if (err instanceof Error) {
      alert('Bad login... Try again.');
    }
    return undefined;
  }
};

const registerWithEmailAndPassword = async (
  name: string,
  email: string,
  password: string
): Promise<UserType | undefined> => {
  try {
    await logInAdminWithEmailAndPassword();

    const registeredDate = new Date().toISOString();
    const lastLoginDate = registeredDate;

    const getUserByEmail = await findUserByEmail(email);

    if (getUserByEmail) {
      alert('This email was already registered!');
      return undefined;
    }

    const getLastUserID = await getLastUser();

    if (!getLastUserID || getLastUserID instanceof Error) {
      if (getLastUserID instanceof Error) {
        throw new Error(getLastUserID.message);
      }
    }

    const user: UserType = {
      id: '1',
      name,
      lastLoginDate,
      registeredDate,
      password,
      email,
      status: 'active',
    };

    await addDoc(collection(db, 'users'), user);

    return user;
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message);
    }
  }
  return undefined;
};

const getUsers = async (): Promise<UserType[] | undefined> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users = querySnapshot.docs.map((docItem) => ({
    ...docItem.data(),
    id: docItem.id,
  })) as UserType[];

  return users;
};

const removeUsersFromDB = async (users: UserType[]) => {
  try {
    await Promise.all(
      users.map(
        (user) =>
          new Promise((resolve, reject) => {
            const userDocRef = doc(db, 'users', user.id);
            deleteDoc(userDocRef)
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          })
      )
    );
  } catch (err) {
    if (err instanceof Error) {
      alert(`Error removing user: ${err.message}`);
    }
  }
};

export {
  registerWithEmailAndPassword,
  logInWithEmailAndPassword,
  getUsers,
  removeUsersFromDB,
  findUserByEmail,
};
