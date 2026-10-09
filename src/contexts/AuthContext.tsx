import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
  type UserCredential
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  loginWithGoogle: () => Promise<UserCredential>;
  loginWithEmail: (email: string, pass: string) => Promise<UserCredential>;
  registerWithEmail: (email: string, pass: string, displayName?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  getFriendlyErrorMessage: (errorCode: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getFriendlyErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Tài khoản không tồn tại trên hệ thống.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản trước đó.';
    case 'auth/weak-password':
      return 'Mật khẩu quá ngắn (cần tối thiểu 6 ký tự).';
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ.';
    case 'auth/popup-closed-by-user':
      return 'Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất.';
    case 'auth/cancelled-popup-request':
      return 'Yêu cầu đăng nhập trước đó đã bị hủy.';
    case 'auth/popup-blocked':
      return 'Trình duyệt đã chặn cửa sổ pop-up. Vui lòng cho phép pop-up và thử lại.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền internet.';
    case 'auth/too-many-requests':
      return 'Bạn đã thử quá nhiều lần. Vui lòng đợi ít phút trước khi thử lại.';
    default:
      return 'Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại sau.';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<UserCredential> => {
    if (!auth) {
      throw new Error('Firebase Auth chưa được khởi tạo. Vui lòng cấu hình .env.');
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string): Promise<UserCredential> => {
    if (!auth) {
      throw new Error('Firebase Auth chưa được khởi tạo. Vui lòng cấu hình .env.');
    }
    return await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<UserCredential> => {
    if (!auth) {
      throw new Error('Firebase Auth chưa được khởi tạo. Vui lòng cấu hình .env.');
    }
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && cred.user) {
      try {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      } catch (err) {
        console.warn('Lỗi cập nhật tên người dùng:', err);
      }
    }
    return cred;
  };

  const logout = async (): Promise<void> => {
    if (!auth) return;
    await signOut(auth);
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    isFirebaseConfigured,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    getFriendlyErrorMessage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
