import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for the state
interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  profileImageUrl: string;
}

interface UserState {
  user: User | null;
}

interface NotificationState {
  unreadCount: number;
}

// Initial states
const initialUserState: UserState = {
  user: null, // or `undefined`
};

const initialNotificationState: NotificationState = {
  unreadCount: 0, // Start with 0 or your desired initial value
};

// Create user slice
const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload; // Set the user object with the payload data
    },
  },
});

// Create notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState: initialNotificationState,
  reducers: {
    // Action to set unread count
    notificationCount: (state, action: PayloadAction<{ unreadCount: number }>) => {
      state.unreadCount = action.payload.unreadCount;
    },
  },
});

// Export actions
export const { addUser } = userSlice.actions;
export const { notificationCount } = notificationSlice.actions;

// Export reducers individually
export const userReducer = userSlice.reducer;
export const notificationReducer = notificationSlice.reducer;
