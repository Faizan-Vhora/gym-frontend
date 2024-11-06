import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  user: {}, // Initialize user as an object
};

interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  profileImageUrl: string;
}

const slice = createSlice({
  name: 'user', // Name of the slice
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload; // Set the user object with the payload data
    },
  },
});

export const { addUser } = slice.actions;
export default slice.reducer;
