import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import { notificationReducer, userReducer } from './slice'; // Import your individual reducers

// Combine your reducers into a root reducer
const rootReducer = combineReducers({
  user: userReducer,
  notification: notificationReducer,
});

// Configuration for redux-persist
const persistConfig = {
  key: 'root', // Key for the persisted state
  storage, // Storage engine (localStorage)
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
});

// Create a persistor
export const persistor = persistStore(store);

// Export the store's type for TypeScript
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
