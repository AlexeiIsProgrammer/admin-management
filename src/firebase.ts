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
import toIsoString from './utils/toIsoString';

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
  }
  return undefined;
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

    const user = users[0];

    if (!user) return user;

    if (users[0].status === 'blocked') {
      throw new Error(`You've been blocked!`);
    }

    return user;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
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
      alert(err.message);
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

    const user: Omit<UserType, 'id'> = {
      name,
      lastLoginDate,
      registeredDate,
      password,
      email,
      status: 'active',
    };

    const userResponse = await addDoc(collection(db, 'users'), user);

    return { ...user, id: userResponse.id };
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message);
    }
  }
  return undefined;
};

const checkIfUserRemovedOrBlocked = async (
  users: UserType[],
  action
): Promise<undefined | boolean> => {
  const userId = sessionStorage.getItem('id');
  const currentUser = users.find(({ id }) => userId === id);
  try {
    if (currentUser) {
      await findUserByEmail(currentUser.email);

      if (action === 'get') return undefined;

      sessionStorage.removeItem('id');
      alert(`You've ${action} yourself!`);
      return true;
    }
  } catch {
    alert(`You've been blocked or deleted!`);
    return true;
  }

  return undefined;
};

const getUsers = async (): Promise<UserType[] | undefined | boolean> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users = querySnapshot.docs.map((docItem) => ({
    ...docItem.data(),
    id: docItem.id,
    lastLoginDate: toIsoString(docItem.data().lastLoginDate),
    registeredDate: toIsoString(docItem.data().registeredDate),
  })) as UserType[];

  if (await checkIfUserRemovedOrBlocked(users, 'get')) {
    return true;
  }

  return users;
};

const removeUsersFromDB = async (
  users: UserType[]
): Promise<boolean | undefined> => {
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

    return await checkIfUserRemovedOrBlocked(users, 'removed');
  } catch (err) {
    if (err instanceof Error) {
      alert(`Error removing user: ${err.message}`);
    }
  }
  return undefined;
};

const updateUsersStatus = async (
  users: UserType[],
  status: 'active' | 'blocked'
): Promise<boolean | undefined> => {
  try {
    const userPromises = users
      .filter((user) => user.status !== status)
      .map(
        (user) =>
          new Promise((resolve, reject) => {
            const userDocRef = doc(db, 'users', user.id);
            updateDoc(userDocRef, {
              status,
            })
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          })
      );
    await Promise.all(userPromises);

    return status === 'blocked'
      ? await checkIfUserRemovedOrBlocked(users, 'blocked')
      : undefined;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
  }
  return undefined;
};

export {
  registerWithEmailAndPassword,
  logInWithEmailAndPassword,
  getUsers,
  removeUsersFromDB,
  updateUsersStatus,
  findUserByEmail,
};
