import { createContext, ReactNode, useContext } from 'react';
import { InAuthUser } from '@/models/in_auth_user';
import useFirebaseAuth from '@/hooks/use_firebase_auth';

interface InAuthUserContext {
  authUser: InAuthUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthUserContext = createContext<InAuthUserContext>({
  authUser: null,
  loading: true,
  signInWithGoogle: () => ({ user: null, credential: null }),
  signOut: () => {},
});

export const AuthUserProvider = function ({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  return <AuthUserContext.Provider value={auth}>{children}</AuthUserContext.Provider>;
};

export const useAuth = () => useContext(AuthUserContext);
