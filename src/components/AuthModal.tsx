import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'login'
}) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    isFirebaseConfigured,
    getFriendlyErrorMessage
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode || 'login');
      setError(null);
      setSyncNotice(null);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const resetForm = () => {
    setMode(defaultMode || 'login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError(null);
    setSyncNotice(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePostLogin = async (_userId: string) => {
    setTimeout(() => {
      onSuccess?.();
      handleClose();
    }, 1200);
  };

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) {
      setError('Firebase chưa được cấu hình các khóa VITE_FIREBASE_* trong file .env');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const cred = await loginWithGoogle();
      if (cred.user) {
        await handlePostLogin(cred.user.uid);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      setError(getFriendlyErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setError('Firebase chưa được cấu hình các khóa VITE_FIREBASE_* trong file .env');
      return;
    }

    setError(null);

    if (!email.trim() || !password) {
      setError('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Mật khẩu phải có tối thiểu 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const cred = await loginWithEmail(email, password);
        if (cred.user) {
          await handlePostLogin(cred.user.uid);
        }
      } else {
        const cred = await registerWithEmail(email, password, displayName);
        if (cred.user) {
          await handlePostLogin(cred.user.uid);
        }
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      setError(getFriendlyErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full border border-stone-200/90 shadow-2xl p-5 sm:p-7 space-y-4 relative animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* NÚT ĐÓNG */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto shadow-inner border border-red-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Lưu giữ bộ sưu tập cổ phục và đồng bộ trên mọi thiết bị
          </p>
        </div>

        {/* CẢNH BÁO NẾU CHƯA CẤU HÌNH FIREBASE */}
        {!isFirebaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Chưa cấu hình Firebase</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Vui lòng điền thông tin <code className="bg-amber-100 px-1 py-0.5 rounded">VITE_FIREBASE_*</code> trong file <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code> để kích hoạt Firebase.
              </p>
            </div>
          </div>
        )}

        {/* TAB SWITCHER */}
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* NÚT GOOGLE SIGN IN */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer active:scale-98 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Tiếp tục với Google</span>
        </button>

        {/* PHÂN CÁCH */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-stone-400 uppercase tracking-wider absolute">
            hoặc Email
          </span>
        </div>

        {/* FORM EMAIL / PASSWORD */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-700 block">
                Họ và tên
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 shadow-2xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-700 block">
              Địa chỉ Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-700 block">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 shadow-2xs"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-700 block">
                Xác nhận mật khẩu
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* BÁO LỖI */}
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* THÔNG BÁO ĐỒNG BỘ THÀNH CÔNG */}
          {syncNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{syncNotice}</span>
            </div>
          )}

          {/* NÚT SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
            )}
          </button>
        </form>

        {/* NÚT TIẾP TỤC DÙNG DẠNG KHÁCH */}
        <div className="text-center pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] text-stone-500 hover:text-stone-800 font-medium transition-colors cursor-pointer"
          >
            Tiếp tục sử dụng với tư cách Khách
          </button>
        </div>
      </div>
    </div>
  );
};
