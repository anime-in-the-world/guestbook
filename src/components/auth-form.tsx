'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { validateUsername } from '@/lib/username-validation';
import { signUpWithEmail } from '@/actions/auth';

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setUsernameError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || 'Something went wrong');
          setIsLoading(false);
          return;
        }
      } else {
        // validate username on client
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
          setUsernameError(usernameValidation.error || 'Invalid username');
          setIsLoading(false);
          return;
        }

        const { error: signUpError } = await signUpWithEmail(
          email,
          password,
          usernameValidation.sanitized!
        );
        if (signUpError) {
          setError(signUpError || 'Something went wrong');
          setIsLoading(false);
          return;
        }
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg bg-white/5 border border-white/10 p-1">
        <button
          onClick={() => {
            setIsLogin(true);
            setError('');
            setUsernameError('');
          }}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
            isLogin
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
          type="button"
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setError('');
            setUsernameError('');
          }}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
            !isLogin
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
          type="button"
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="w-full pl-10 pr-3 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {usernameError && (
              <p className="text-xs text-red-400">{usernameError}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-3 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </div>
      </form>
    </div>
  );
}
