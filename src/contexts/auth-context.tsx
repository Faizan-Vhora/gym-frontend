import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react'; // Type-only import for ReactNode
import * as React from 'react';

// Define the user interface
interface User {
  id: number;
  name: string;
  email: string;
  // Add any other user properties you need
}

// Define action types
type AuthActionType = 'LOGIN_SUCCESS' | 'LOGOUT';

// Define the structure of our state
interface AuthState {
  token: string | null;
  user: User | null;
  isPending: boolean;
  error: string | null;
}

// Define actions
interface AuthAction {
  type: AuthActionType;
  payload?: {
    token?: string;
    user?: User;
  };
}

// Initial state
const initialState: AuthState = {
  token: null,
  user: null,
  isPending: false,
  error: null,
};

// Create a reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload?.token || null,
        user: action.payload?.user || null,
        isPending: false,
        error: null,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

// Create a context
const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Create a provider component using a function declaration
export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth(): { state: AuthState; dispatch: React.Dispatch<AuthAction> } {
  return useContext(AuthContext);
}
