import React, { createContext, useContext, useReducer } from 'react';

// Define action types
type AuthActionType = 'LOGIN_SUCCESS' | 'LOGOUT';

// Define the structure of our state
interface AuthState {
  token: string | null;
  user: object | null;
  isPending: boolean;
  error: string | null;
}

// Define actions
interface AuthAction {
  type: AuthActionType;
  payload?: any;
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
        token: action.payload.token,
        user: action.payload.user,
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

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
