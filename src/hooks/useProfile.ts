import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firebaseError';

export interface UserProfile {
  name: string;
  photoUrl: string | null;
  dailyReminders: boolean;
  geminiApiKey: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'anônimo',
  photoUrl: null,
  dailyReminders: true,
  geminiApiKey: '',
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem('@app_profile_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_PROFILE;
  });
  const [user, setUser] = useState(auth.currentUser);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(DEFAULT_PROFILE);
        setIsLoadingProfile(false);
      } else {
        setIsLoadingProfile(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const userDoc = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<UserProfile, 'ownerId' | 'updatedAt'>;
        const newProfile = {
            name: data.name || DEFAULT_PROFILE.name,
            photoUrl: data.photoUrl || DEFAULT_PROFILE.photoUrl,
            dailyReminders: data.dailyReminders ?? DEFAULT_PROFILE.dailyReminders,
            geminiApiKey: data.geminiApiKey || DEFAULT_PROFILE.geminiApiKey
        };
        setProfile(newProfile);
        localStorage.setItem('@app_profile_cache', JSON.stringify(newProfile));
      } else {
        // Create initial profile
        setDoc(userDoc, {
          ...DEFAULT_PROFILE,
          photoUrl: DEFAULT_PROFILE.photoUrl || '',
          ownerId: user.uid,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
      }
      setIsLoadingProfile(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user?.uid}`);
      setIsLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile); // optimistic update
    localStorage.setItem('@app_profile_cache', JSON.stringify(newProfile));

    try {
        await updateDoc(doc(db, 'users', user.uid), {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return true;
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed:", error);
      }
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('@app_profile_cache');
    await signOut(auth);
  };

  const resetProfile = async () => {
    if (!user) return;
    try {
        // Reset user profile document
        await setDoc(doc(db, 'users', user.uid), {
            ...DEFAULT_PROFILE,
            photoUrl: DEFAULT_PROFILE.photoUrl || '',
            ownerId: user.uid,
            updatedAt: serverTimestamp()
        });
        
        // Delete all tasks for the user
        const tasksQuery = query(collection(db, 'tasks'), where('ownerId', '==', user.uid));
        const tasksSnapshot = await getDocs(tasksQuery);
        const taskDeletePromises = tasksSnapshot.docs.map(docSnap => deleteDoc(doc(db, 'tasks', docSnap.id)));
        
        // Delete all notifications for the user
        const notificationsQuery = query(collection(db, 'notifications'), where('ownerId', '==', user.uid));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const notificationDeletePromises = notificationsSnapshot.docs.map(docSnap => deleteDoc(doc(db, 'notifications', docSnap.id)));
        
        await Promise.all([...taskDeletePromises, ...notificationDeletePromises]);

        setProfile(DEFAULT_PROFILE);
        localStorage.removeItem('@app_profile_cache');
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return { profile, updateProfile, resetProfile, user, loginWithGoogle, logout, isLoadingProfile };
}
