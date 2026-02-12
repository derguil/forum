import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, addMessage } from "../../store/chatSlice"
import axios from "axios";
import { socket } from "../../socket";
import './ChatRoomPanel.css'

function formatMMDD_HHMM(date) {
  const d = new Date(date);

  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${MM}/${DD} ${HH}:${mm}`;
}

export default function ChatRoomPanel() {
  const navigate = useNavigate()
  const { threadid } = useParams();
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const messages = useSelector(
    (state) => state.chat.threadChats[String(threadid)]
  ) || [];

  const authUserId = useSelector(state => state.auth.user?._id);

  const shapeMessage = (m, authUserId) => ({
    ...m,
    type: String(m.sent) === String(authUserId) ? "me" : "other",
  });

  useEffect(() => {
    if (!threadid) return;
    setLoading(true);
    axios.get("/api/reqMessages", { params: { threadid } })
      .then((res) => {
        const shaped = res.data.threadChats.map(m => shapeMessage(m, authUserId));
        dispatch(setMessages({ threadid, messages: shaped }));
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [threadid]);
  
  const [sending, setSending] = useState(false);
  const submit = () => {
    const value = text.trim();
    if (!value || !threadid || sending) return;
    
    setSending(true);
    
    axios.post("/api/sendMessage", { threadid, text: value })
    .then((res) => {
      setText("");
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        navigate("/login", { replace: true });
        return;
      }
    })
    .finally(() => setSending(false));
  };

  useEffect(() => {
    if (!threadid) return;
    socket.emit("thread:join", threadid);
    console.log(threadid + " join emit");

    return () => {
      socket.emit("thread:leave", threadid);
      console.log(threadid + " leave emit");
    };
  }, [socket, threadid]);

  useEffect(() => {
    const onBroadcast = (payload) => {
      const m = {
        _id: payload._id,
        thread_id: payload.thread_id,
        text: payload.text,
        sent: payload.sent,
        createdAt: payload.createdAt,
      };
      dispatch(addMessage({
        threadid: payload.thread_id,
        message: shapeMessage(m, authUserId),
      }));
    };
    socket.on("broadcast", onBroadcast);
    return () => socket.off("broadcast", onBroadcast);
  }, [socket, dispatch, authUserId]);

  useEffect(() => {
    if (loading) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [loading, messages.length]);
  
  if (!threadid) {
    return <div className="p-3 text-muted">왼쪽에서 대화를 선택하세요.</div>;
  }
  
  if (loading) {
    return <div className="p-3 text-muted">불러오는 중...</div>;
  }
  
  return (
    <div className="room-wrap">
      <div className="room-messages" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m._id} className={`msg-row ${m.type}`}>
            <div className={`msg-bubble ${m.type}`}>
              <div className="msg-text">{m.text}</div>
              <div className="msg-time">{formatMMDD_HHMM(m.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="room-input">
        <InputGroup>
          <Form.Control
            placeholder="메시지를 입력하세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <Button onClick={submit}>전송</Button>
        </InputGroup>
      </div>
    </div>
  );
}
