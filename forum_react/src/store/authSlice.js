import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loaded: false
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.loaded = true;
    },
    clearUser(state) {
      state.user = null;
      state.loaded = true;
    },
    setLoaded(state, action) {
      state.loaded = action.payload;
    }
  }
});

export const { setUser, clearUser, setLoaded } = authSlice.actions;
export default authSlice.reducer;
