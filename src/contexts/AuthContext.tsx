"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const ADMIN_EMAIL = "MrsshereenelmairyTHEONLYTOPADMININTHEUDUCATIONALPLATFORM9938892@@@245$%4533@ADMIN.COM";

type UserRole = "student" | "teacher" | "admin" | null;
type UserStatus = "pending" | "active" | "banned" | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole;
  userStatus: UserStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string, parentName: string, parentPhone: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>(null);

  const syncUserData = async (user: User) => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: "Miss Shereen Elmairy",
          email: user.email,
          phone: "",
          role: "admin",
          status: "active",
          createdAt: serverTimestamp(),
        });
      } else if (docSnap.data().role !== "admin") {
        await updateDoc(docRef, { role: "admin", status: "active" });
      }
      setUserRole("admin");
      setUserStatus("active");
      return;
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserRole(data.role as UserRole);
      setUserStatus((data.status as UserStatus) || "active");
    } else {
      setUserRole(null);
      setUserStatus(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      try {
        if (user) {
          await syncUserData(user);
        } else {
          setUserRole(null);
          setUserStatus(null);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setUserRole(null);
        setUserStatus(null);
      }
      setLoading(false);
    });
    const safetyTimeout = setTimeout(() => setLoading(false), 5000);
    return () => { clearTimeout(safetyTimeout); unsubscribe(); };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string, phone: string, parentName: string, parentPhone: string, role: UserRole = "student") => {
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const finalRole = isAdmin ? "admin" : role;
    const finalStatus = isAdmin ? "active" : "pending";

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      phone,
      parentName,
      parentPhone,
      role: finalRole,
      status: finalStatus,
      createdAt: serverTimestamp(),
    });
    setUserRole(finalRole as UserRole);
    setUserStatus(finalStatus as UserStatus);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const docRef = doc(db, "users", cred.user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const email = cred.user.email || "";
      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      await setDoc(docRef, {
        name: cred.user.displayName || "User",
        email,
        phone: cred.user.phoneNumber || "",
        parentName: "",
        parentPhone: "",
        role: isAdmin ? "admin" : "student",
        status: isAdmin ? "active" : "pending",
        createdAt: serverTimestamp(),
      });
      setUserRole(isAdmin ? "admin" : "student");
      setUserStatus(isAdmin ? "active" : "pending");
    } else {
      const data = docSnap.data();
      setUserRole(data.role as UserRole);
      setUserStatus((data.status as UserStatus) || "active");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, userRole, userStatus, login, register, logout, resetPassword, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
