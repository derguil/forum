import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage, ThreadPreview } from "../types/api";

type ChatState = {
  threads: ThreadPreview[];
  threadChats: Record<string, ChatMessage[]>;
};

const initialState: ChatState = {
  threads: [],
  threadChats: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setThreads(state, action: PayloadAction<ThreadPreview[]>) {
      state.threads = action.payload;
    },

    setMessages(state, action: PayloadAction<{ threadid: string; messages: ChatMessage[] }>) {
      const { threadid, messages } = action.payload;
      state.threadChats[threadid] = messages;
    },

    addMessage(state, action: PayloadAction<{ threadid: string; message: ChatMessage }>) {
      const { threadid, message } = action.payload;
      if (!state.threadChats[threadid]) {
        state.threadChats[threadid] = [];
      }
      state.threadChats[threadid].push(message);
    },

    updateThreadPreview(
      state,
      action: PayloadAction<{
        threadid: string;
        lastMessage: string;
        updatedAt: string;
        unreadDelta: number;
      }>
    ) {
      const { threadid, lastMessage, updatedAt, unreadDelta } = action.payload;

      const idx = state.threads.findIndex(t => String(t._id) === String(threadid));
      if (idx === -1) return;

      const t = state.threads[idx];
      t.lastMessage = lastMessage;
      t.updatedAt = updatedAt;
      t.myUnreadCount = (t.myUnreadCount || 0) + unreadDelta;

      state.threads.splice(idx, 1);
      state.threads.unshift(t);
    },

    markThreadRead(state, action: PayloadAction<{ _id: string }>) {
      const { _id } = action.payload;
      const t = state.threads.find(
        (x) => String(x._id) === String(_id)
      );
      if (t) {
        t.myUnreadCount = 0;
      }
    }
  }
});

export const { setThreads, setMessages, addMessage, updateThreadPreview, markThreadRead } = chatSlice.actions;
export default chatSlice.reducer;