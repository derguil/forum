import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    threads: [],
    messagesByThread: {}
  },
  reducers: {
    setThreads(state, action) {
      state.threads = action.payload;
    },

    setMessages(state, action) {
      const { threadid, messages } = action.payload;
      state.messagesByThread[threadid] = messages;
    },

    addMessage(state, action) {
      const { threadid, message } = action.payload;

      state.messagesByThread[threadid]?.push(message);

      const idx = state.threads.findIndex(
        t => String(t._id) === String(threadid)
      );

      if (idx !== -1) {
        const t = state.threads[idx];
        t.lastMessage = message.text;
        t.updatedAt = message.createdAt;

        state.threads.splice(idx, 1);
        state.threads.unshift(t);
      }
    },

    markThreadRead(state, action) {
      const { _id } = action.payload;
      const t = state.threads.find(
        (x) => String(x._id) === String(_id)
      );
      if (t) {
        t.unread = 0;
      }
    }
  }
});

export const { setThreads, setMessages, addMessage, markThreadRead } = chatSlice.actions;
export default chatSlice.reducer;