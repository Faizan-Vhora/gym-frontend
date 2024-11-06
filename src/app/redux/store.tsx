// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import reducer from './slice'; // Import your existing reducer

// Configuration for redux-persist
const persistConfig = {
  key: 'root', // Key for the persisted state
  storage, // Storage engine (localStorage)
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, reducer);

// Configure the Redux store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
});

// Create a persistor
export const persistor = persistStore(store);
