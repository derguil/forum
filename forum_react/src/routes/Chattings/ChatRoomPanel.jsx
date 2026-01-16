import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, addMessage } from "./ChatSlice"
import axios from "axios";

function timeAgo(wtime) {
  const diff = (new Date() - new Date(wtime)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function ChatRoomPanel() {
  const navigate = useNavigate()
  const { threadid } = useParams();
  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const messages = useSelector(
    (state) => state.chat.messagesByThread[String(threadid)]
  ) || [];

  useEffect(() => {
    if (!threadid) return;

    setLoading(true);

    axios.get("/api/reqMessages", { params: { threadid } })
      .then((res) => {
        dispatch(
          setMessages({
            threadid: String(threadid),
            messages: res.data.threadChats || [],
          })
        );
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [threadid]);

  useEffect(() => {
    if (loading) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [loading, messages.length]);

  const threads = useSelector((state) => state.chat.threads) || [];

  const otherUserId = useMemo(() => {
    const t = threads.find((x) => String(x._id) === String(threadid));
    if (!t) return null;
    if (t.otherUser?._id) return t.otherUser._id;
  }, [threads, threadid]);

  const [sending, setSending] = useState(false);
  const submit = () => {
    const value = text.trim();
    if (!value || !threadid || sending) return;

    setSending(true);

    axios.post("/api/sendMessage", { threadid, text: value, otherUserId })
      .then((res) => {
        dispatch(addMessage({ threadid: String(threadid), message: res.data.message }));
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
              <div className="msg-time">{timeAgo(m.createdAt)}</div>
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
