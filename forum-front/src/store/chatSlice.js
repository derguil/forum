import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    threads: [],
    threadChats: {}
  },
  reducers: {
    setThreads(state, action) {
      state.threads = action.payload;
    },

    setMessages(state, action) {
      const { threadid, messages } = action.payload;
      state.threadChats[threadid] = messages;
    },

    addMessage(state, action) {
      const { threadid, message } = action.payload;
      if (!state.threadChats[threadid]) {
        state.threadChats[threadid] = [];
      }
      state.threadChats[threadid].push(message);
    },

    updateThreadPreview(state, action) {
      const { threadid, lastMessage, updatedAt, unreadDelta } = action.payload;

      const idx = state.threads.findIndex(t => String(t._id) === String(threadid));
      if (idx === -1) return;

      const t = state.threads[idx];
      t.lastMessage = lastMessage;
      t.updatedAt = updatedAt;
      t.myUnreadCount += unreadDelta;

      state.threads.splice(idx, 1);
      state.threads.unshift(t);
    },

    markThreadRead(state, action) {
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