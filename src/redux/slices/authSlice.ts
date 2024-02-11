import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { UserType } from '../../firebase';

type InitialState = {
  isAuth: boolean;
  user: UserType | null;
};

const initialState: InitialState = {
  isAuth: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.isAuth = false;
      state.user = null;
      sessionStorage.removeItem('id');
    },
    setUser: (state, action: PayloadAction<UserType>) => {
      state.isAuth = true;
      state.user = action.payload;
      sessionStorage.setItem('id', action.payload.id.toString());
    },
  },
});

export default authSlice.reducer;
export const { setUser, logoutUser } = authSlice.actions;
export const authSelector = (state: RootState) => state.auth;
