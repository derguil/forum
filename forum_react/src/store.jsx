import { configureStore } from "@reduxjs/toolkit";
import chatSlice from "./routes/Chattings/ChatSlice"

export const store = configureStore({
  reducer: {
    chat: chatSlice,
  },
});
