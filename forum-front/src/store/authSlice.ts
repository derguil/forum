import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/user";

type AuthState = {
  user: User | null;
  loaded: boolean;
};

const initialState: AuthState = {
  user: null,
  loaded: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loaded = true;
    },
    clearUser(state) {
      state.user = null;
      state.loaded = true;
    },
    setLoaded(state, action: PayloadAction<boolean>) {
      state.loaded = action.payload;
    }
  }
});

export const { setUser, clearUser, setLoaded } = authSlice.actions;
export default authSlice.reducer;