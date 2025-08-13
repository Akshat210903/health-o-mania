
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, updateProfile, type User } from 'firebase/auth';
import {
    doc,
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    runTransaction,
    Timestamp,
    writeBatch,
    setDoc,
    orderBy,
    limit,
    getDoc,
    or,
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getFunctions, httpsCallable, type HttpsCallable } from 'firebase/functions';

// --- INTERFACES ---

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  userCode: string;
  photoURL?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  friends?: string[];
}

export interface Coach {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  specialty: string;
  bio: string;
  certifications: string;
  createdAt: Timestamp;
}

export interface LiveClass {
  id: string;
  title: string;
  instructorName: string;
  instructorId: string;
  coachDocId: string;
  time: string;
  duration: string;
  category: string;
  image?: string;
  meetLink: string;
  startAt: Timestamp;
  createdAt: Timestamp;
}

interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  baseXp: number;
  status: 'pending' | 'completed' | 'missed';
}

interface FoodLog {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  scannedAt: string;
}

export interface FriendRequest {
    id: string;
    from: string;
    to: string;
    participants: string[];
    fromName: string;
    fromUserCode: string;
    status: 'pending';
}

export interface Friend extends UserProfile {}


interface UserDataContextType {
  user: User | null;
  userProfile: UserProfile | null;
  tasks: Task[];
  foodLog: FoodLog[];
  liveClasses: LiveClass[];
  friendRequests: FriendRequest[];
  friends: Friend[];
  isLoading: boolean;
  latestCoach: Coach | null;
  currentUserCoachProfile: Coach | null;
  manageFriendRequest: (payload: { action: 'send' | 'accept' | 'reject' | 'remove', userCode?: string, requestId?: string, friendId?: string }) => Promise<void>;
  completeTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'baseXp'>) => void;
  updateTask: (taskId: string, taskData: Omit<Task, 'id' | 'status' | 'baseXp'>) => void;
  deleteTask: (taskId: string) => void;
  addFoodLog: (food: Omit<FoodLog, 'id' | 'scannedAt'>) => void;
  removeFoodLog: (foodId: string) => void;
  updateUserProfile: (data: { name?: string; photoURL?: string }) => Promise<void>;
  addCoach: (coachData: Omit<Coach, 'id' | 'createdAt' | 'userId' | 'email'>) => Promise<void>;
  removeCoach: () => Promise<void>;
  addLiveClass: (classData: { title: string; category: string; duration: string; meetLink: string; startAt: Date; }, imageFile: File | null) => Promise<void>;
  removeLiveClass: (classId: string) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

// Initialize Cloud Functions
let manageFriendRequestCallable: HttpsCallable<any, any>;
try {
    const functions = getFunctions(auth.app);
    manageFriendRequestCallable = httpsCallable(functions, 'manageFriendRequest');
} catch (e) {
    console.error("Could not initialize Cloud Functions", e);
}


export function UserDataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [foodLog, setFoodLog] = useState<FoodLog[]>([]);
  const [latestCoach, setLatestCoach] = useState<Coach | null>(null);
  const [currentUserCoachProfile, setCurrentUserCoachProfile] = useState<Coach | null>(null);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
        setIsLoading(true);
        if (authUser) {
            setUser(authUser);
        } else {
            setUser(null);
            setUserProfile(null);
            setTasks([]);
            setFoodLog([]);
            setLatestCoach(null);
            setCurrentUserCoachProfile(null);
            setLiveClasses([]);
            setFriendRequests([]);
            setFriends([]);
            setIsLoading(false);
        }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    }
    
    let isMounted = true;
    let unsubFriends: (() => void) | undefined;


    // Current User Profile listener
    const userDocRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
        if (!isMounted) return;
        if (docSnap.exists()) {
            const profileData = { id: docSnap.id, ...docSnap.data() } as UserProfile;
            setUserProfile(profileData);
            
            // Once we have the profile, set up the listener for friends
            if (profileData.friends && profileData.friends.length > 0) {
                 if (unsubFriends) unsubFriends(); // Unsubscribe from old listener if it exists
                 const friendsQuery = query(collection(db, 'users'), where('__name__', 'in', profileData.friends));
                 unsubFriends = onSnapshot(friendsQuery, (snapshot) => {
                     if (!isMounted) return;
                     const friendsList = snapshot.docs.map(d => ({id: d.id, ...d.data()}) as Friend);
                     setFriends(friendsList);
                 }, (error) => {
                    if (!isMounted) return;
                    console.error("Firestore: Friends listener error", error);
                    toast({ variant: 'destructive', title: 'DB: Listener Error', description: `Could not load friends: ${error.message}`});
                 });
            } else {
                setFriends([]);
            }

        } else {
            const displayName = user.displayName || "New User";
            const userCodeName = displayName.split(" ")[0].substring(0, 10).toUpperCase().replace(/[^A-Z]/g, '') || "USER";
            const userCode = `${userCodeName}-${Math.floor(100 + Math.random() * 900)}`;

            setDoc(userDocRef, {
                name: user.displayName || null,
                email: user.email || null,
                phoneNumber: user.phoneNumber || null,
                userCode: userCode,
                photoURL: user.photoURL || null,
                level: 1,
                xp: 0,
                xpToNextLevel: 100,
                friends: [],
            }).catch(error => {
                console.error("Error creating user document:", error);
                toast({ variant: 'destructive', title: 'DB: CRITICAL FAILURE', description: `Failed to create profile: ${error.message}`});
            });
        }
        setIsLoading(false);
    }, (error) => {
        if (!isMounted) return;
        console.error("Firestore: User profile listener error", error);
        toast({ variant: 'destructive', title: 'DB: Listener Error', description: `Could not load profile: ${error.message}`});
        setIsLoading(false);
    });

    const requestsQuery = query(collection(db, 'friendRequests'), where('to', '==', user.uid), where('status', '==', 'pending'));
    const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
      if(!isMounted) return;
      setFriendRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest)));
    }, (error) => {
        if (!isMounted) return;
        console.error("Error listening to friend requests:", error);
        toast({ variant: 'destructive', title: 'DB: Listener Error', description: `Could not load friend requests: ${error.message}`});
    });
    
    // Other listeners
    const tasksColRef = collection(db, 'users', user.uid, 'tasks');
    const unsubTasks = onSnapshot(tasksColRef, (snapshot) => {
        if (!isMounted) return;
        const tasksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksList);
    });
    
    const foodLogColRef = collection(db, 'users', user.uid, 'foodLog');
    const foodLogQuery = query(foodLogColRef, orderBy('scannedAt', 'desc'));
    const unsubFoodLog = onSnapshot(foodLogQuery, (snapshot) => {
        if (!isMounted) return;
        const foodList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                scannedAt: (data.scannedAt as Timestamp)?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'
            } as FoodLog;
        });
        setFoodLog(foodList);
    });

    const coachesColRef = collection(db, 'coaches');
    const latestCoachQuery = query(coachesColRef, orderBy('createdAt', 'desc'), limit(1));
    const unsubLatestCoach = onSnapshot(latestCoachQuery, (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
            const coachDoc = snapshot.docs[0];
            setLatestCoach({ id: coachDoc.id, ...coachDoc.data() } as Coach);
        } else {
            setLatestCoach(null);
        }
    });

    const currentUserCoachQuery = query(coachesColRef, where('userId', '==', user.uid), limit(1));
    const unsubCurrentUserCoach = onSnapshot(currentUserCoachQuery, (snapshot) => {
        if (!isMounted) return;
        if (!snapshot.empty) {
            const coachDoc = snapshot.docs[0];
            setCurrentUserCoachProfile({ id: coachDoc.id, ...coachDoc.data() } as Coach);
        } else {
            setCurrentUserCoachProfile(null);
        }
    });

    const liveClassesColRef = collection(db, 'liveClasses');
    const liveClassesQuery = query(liveClassesColRef, orderBy('startAt', 'desc'));
    const unsubLiveClasses = onSnapshot(liveClassesQuery, (snapshot) => {
        if (!isMounted) return;
        const classesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveClass));
        setLiveClasses(classesList);
    });

    return () => {
        isMounted = false;
        unsubProfile();
        unsubTasks();
        unsubFoodLog();
        unsubLatestCoach();
        unsubCurrentUserCoach();
        unsubLiveClasses();
        unsubRequests();
        if (unsubFriends) unsubFriends();
    };
  }, [user, toast]);
  
  const manageFriendRequest = useCallback(async (payload: { action: 'send' | 'accept' | 'reject' | 'remove', userCode?: string, requestId?: string, friendId?: string }) => {
    if (!user) {
        toast({variant: 'destructive', title: 'Not Authenticated'});
        return;
    }
    if (!manageFriendRequestCallable) {
        toast({variant: 'destructive', title: 'Function not ready'});
        return;
    }
    try {
        const result = await manageFriendRequestCallable(payload);
        toast({ title: 'Success', description: (result.data as any).message });
    } catch (error: any) {
        console.error("Action failed:", error);
        toast({ variant: 'destructive', title: 'Action failed', description: error.message });
        throw error; // Re-throw so the client knows it failed
    }
  }, [user, toast]);
  
  const getXpForDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
        case 'Easy': return 10;
        case 'Medium': return 30;
        case 'Hard': return 50;
    }
  };

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'status' | 'baseXp'>) => {
    if (!user) return;
    const newTask: Omit<Task, 'id'> = {
        ...taskData,
        status: 'pending',
        baseXp: getXpForDifficulty(taskData.difficulty),
    };
    await addDoc(collection(db, 'users', user.uid, 'tasks'), newTask);
    toast({ title: "Task Added!", description: `${taskData.title} has been added.` });
  }, [user, toast]);

  const updateTask = useCallback(async (taskId: string, taskData: Omit<Task, 'id' | 'status' | 'baseXp'>) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    await updateDoc(taskDocRef, {
        ...taskData,
        baseXp: getXpForDifficulty(taskData.difficulty),
    });
    toast({ title: "Task Updated!", description: `${taskData.title} has been updated.` });
  }, [user, toast]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
    toast({ title: "Task Deleted", description: "The task has been removed." });
  }, [user, toast]);

  const completeTask = useCallback(async (taskId: string) => {
    if (!user || !userProfile) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'pending') return;

    const xpGained = task.baseXp;
    
    const userDocRef = doc(db, 'users', user.uid);
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
            throw "User document does not exist!";
        }

        let newXp = userDoc.data().xp + xpGained;
        let newLevel = userDoc.data().level;
        let newXpToNextLevel = userDoc.data().xpToNextLevel;
        let leveledUp = false;

        if (newXp >= newXpToNextLevel) {
            newLevel++;
            newXp -= newXpToNextLevel;
            newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5);
            leveledUp = true;
        }

        transaction.update(userDocRef, { 
            xp: newXp,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel
        });

        transaction.update(taskDocRef, { status: 'completed' });

        setTimeout(() => {
            if(leveledUp) {
                toast({ title: "Level Up!", description: `You've reached level ${newLevel}! You gained ${xpGained} XP.` });
            } else {
                 toast({ title: "Task Completed!", description: `You earned ${xpGained} XP.` });
            }
        }, 100);
    });
  }, [user, userProfile, tasks, toast]);

  const addFoodLog = useCallback(async (food: Omit<FoodLog, 'id' | 'scannedAt'>) => {
    if (!user) return;
    const newLogEntry = { ...food, scannedAt: serverTimestamp() };
    await addDoc(collection(db, 'users', user.uid, 'foodLog'), newLogEntry);
    toast({ title: "Meal Logged!", description: `${food.foodName} has been added.` });
  }, [user, toast]);

  const removeFoodLog = useCallback(async (foodId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'foodLog', foodId));
    toast({ title: "Log Entry Removed" });
  }, [user, toast]);
  
  const updateUserProfile = useCallback(async (data: { name?: string; photoURL?: string }) => {
    if (!user || !auth.currentUser) return;
    
    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (data.name !== undefined) authUpdates.displayName = data.name;
    if (data.photoURL !== undefined) authUpdates.photoURL = data.photoURL;

    const firestoreUpdates: { name?: string; photoURL?: string } = {};
    if (data.name !== undefined) firestoreUpdates.name = data.name;
    if (data.photoURL !== undefined) firestoreUpdates.photoURL = data.photoURL;

    try {
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser, authUpdates);
      }
      
      if (Object.keys(firestoreUpdates).length > 0) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, firestoreUpdates);
      }
      
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    }
  }, [user, toast]);

  const addCoach = useCallback(async (coachData: Omit<Coach, 'id' | 'createdAt' | 'userId' | 'email'>) => {
    if (!user || !user.email) {
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to apply.' });
        return;
    }
    await addDoc(collection(db, 'coaches'), {
      ...coachData,
      userId: user.uid,
      email: user.email,
      createdAt: serverTimestamp(),
    });
    toast({
      title: "Application Submitted!",
      description: "Thank you! We will review your application and get back to you shortly.",
    });
  }, [user, toast]);

  const removeCoach = useCallback(async () => {
    if (!user || !currentUserCoachProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'No coach profile found to remove.' });
        return;
    }
    try {
        // First delete all classes hosted by this coach
        const classesQuery = query(collection(db, 'liveClasses'), where('coachDocId', '==', currentUserCoachProfile.id));
        const classesSnapshot = await getDocs(classesQuery);
        const batch = writeBatch(db);
        classesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Then delete the coach profile
        const coachDocRef = doc(db, 'coaches', currentUserCoachProfile.id);
        batch.delete(coachDocRef);
        
        await batch.commit();
        
        setCurrentUserCoachProfile(null); // Clear local state

        toast({ title: 'Coach Profile Removed', description: 'You and all your hosted classes have been removed.' });
    } catch (error: any) {
        console.error("Failed to remove coach profile:", error);
        toast({ variant: 'destructive', title: 'Removal Failed', description: 'Could not remove your coach profile. Please try again.' });
    }
  }, [user, currentUserCoachProfile, toast]);

  const addLiveClass = useCallback(async (classData: { title: string; category: string; duration: string; meetLink: string; startAt: Date; }, imageFile: File | null) => {
    if (!user || !currentUserCoachProfile || !currentUserCoachProfile.id) {
        toast({ variant: 'destructive', title: 'Not a Coach', description: 'Your coach profile is not fully loaded or you are not a coach.' });
        return;
    }
    
    const newClassData: any = {
        ...classData,
        instructorName: currentUserCoachProfile.fullName,
        instructorId: user.uid,
        coachDocId: currentUserCoachProfile.id,
        time: format(classData.startAt, 'PPP p'),
        startAt: classData.startAt, 
        createdAt: serverTimestamp(),
    };

    if (imageFile) {
        try {
            const imageRef = storageRef(storage, `live-class-banners/${user.uid}-${Date.now()}-${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            newClassData.image = await getDownloadURL(imageRef);
        } catch (error: any) {
            console.error("Failed to upload image:", error);
            if (error.code === 'storage/unauthorized') {
                 toast({
                    variant: 'destructive',
                    title: 'Image Upload Failed: Permission Denied',
                    description: 'Please check your Firebase Storage security rules to allow uploads.',
                    duration: 10000,
                });
            } else {
                 toast({ variant: "destructive", title: "Image Upload Failed", description: `An unexpected error occurred: ${error.message}` });
            }
            return;
        }
    }
    
    await addDoc(collection(db, 'liveClasses'), newClassData);
    toast({ title: "Class Created!", description: "Your new live class is now listed." });
  }, [user, currentUserCoachProfile, toast]);

  const removeLiveClass = useCallback(async (classId: string) => {
    if (!user) return;
    // Security rules will handle permission checking
    await deleteDoc(doc(db, 'liveClasses', classId));
    toast({ title: "Class Removed", description: "The live class has been deleted." });
  }, [user, toast]);

  const value = {
    user,
    userProfile,
    tasks,
    foodLog,
    liveClasses,
    friendRequests,
    friends,
    isLoading,
    latestCoach,
    currentUserCoachProfile,
    manageFriendRequest,
    completeTask,
    addTask,
    updateTask,
    deleteTask,
    addFoodLog,
    removeFoodLog,
    updateUserProfile,
    addCoach,
    removeCoach,
    addLiveClass,
    removeLiveClass,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

    