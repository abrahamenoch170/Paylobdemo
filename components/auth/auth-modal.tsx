import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const { signIn, signUp, signInWithGoogle, signInWithGitHub, signInWithApple } = useAuth();

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
  }, [initialMode, isOpen]);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLogin
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
    reset: resetSignup
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  useEffect(() => {
    if (!isOpen) {
      resetLogin();
      resetSignup();
      setShowPassword(false);
      setErrorMsg(null);
    }
  }, [isOpen, resetLogin, resetSignup]);

  const handleAuthSuccess = () => {
    onClose();
    router.push('/role');
  };

  const onLogin = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      await signIn(data.email, data.password);
      handleAuthSuccess();
    } catch (e: any) {
      setErrorMsg(e.message || 'Login failed.');
    }
  };

  const onSignup = async (data: SignupFormData) => {
    setErrorMsg(null);
    try {
      await signUp(data.email, data.password, data.fullname);
      handleAuthSuccess();
    } catch (e: any) {
      setErrorMsg(e.message || 'Signup failed.');
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setErrorMsg(null);
    try {
      if (provider === 'Google') await signInWithGoogle();
      else if (provider === 'GitHub') await signInWithGitHub();
      else if (provider === 'Apple') await signInWithApple();
      handleAuthSuccess();
    } catch (e: any) {
      setErrorMsg(e.message || `${provider} login failed.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0A0A0A]/40 z-50 flex items-center justify-center p-0 md:p-4 transition-all overflow-y-auto">
      <div
        className="w-full h-full md:h-auto md:max-w-md bg-[#FFFFFF] md:rounded-xl shadow-xl flex flex-col relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#8B8680] hover:text-[#1C1C1C] hover:bg-[#F5F2ED] rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 overflow-y-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1C1C1C] mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-sm text-[#8B8680]">
              {mode === 'login'
                ? 'Enter your details to sign in to your account'
                : 'Sign up to start receiving secure payments'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-3 mb-6">
            <Button variant="secondary" className="w-full text-sm font-medium" onClick={() => handleSocialAuth('Google')}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
            <Button variant="secondary" className="w-full text-sm font-medium" onClick={() => handleSocialAuth('Apple')}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.67.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.85 1.76-1.74 3.38-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.43 2.5-2.14 4.54-3.74 4.25z" />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="secondary" className="w-full text-sm font-medium" onClick={() => handleSocialAuth('GitHub')}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Continue with GitHub
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[#D4CFCA] flex-1" />
            <span className="text-xs text-[#8B8680] uppercase tracking-wider font-semibold">Or continue with email</span>
            <div className="h-px bg-[#D4CFCA] flex-1" />
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4 animate-in fade-in duration-300">
              <Input
                placeholder="Email address"
                type="email"
                {...registerLogin('email')}
                error={loginErrors.email?.message}
              />
              <div className="relative">
                <Input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  {...registerLogin('password')}
                  error={loginErrors.password?.message}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-[#8B8680] hover:text-[#1C1C1C]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isLoginSubmitting}>
                  {isLoginSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>

              <div className="text-center mt-6">
                <span className="text-[#8B8680] text-sm">Don&apos;t have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-sm font-semibold text-[#1C1C1C] hover:underline"
                >
                  Create one
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4 animate-in fade-in duration-300">
              <Input
                placeholder="Full name"
                {...registerSignup('fullname')}
                error={signupErrors.fullname?.message}
              />
              <Input
                placeholder="Email address"
                type="email"
                {...registerSignup('email')}
                error={signupErrors.email?.message}
              />
              <div className="relative">
                <Input
                  placeholder="Password (min 8 characters)"
                  type={showPassword ? "text" : "password"}
                  {...registerSignup('password')}
                  error={signupErrors.password?.message}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-[#8B8680] hover:text-[#1C1C1C]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Input
                placeholder="Confirm password"
                type={showPassword ? "text" : "password"}
                {...registerSignup('confirmPassword')}
                error={signupErrors.confirmPassword?.message}
              />

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSignupSubmitting}>
                  {isSignupSubmitting ? 'Creating...' : 'Create account'}
                </Button>
              </div>

              <div className="text-center mt-6">
                <span className="text-[#8B8680] text-sm">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm font-semibold text-[#1C1C1C] hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
