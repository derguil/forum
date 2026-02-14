import { useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Button, Dropdown, DropdownButton } from "react-bootstrap";
import MessageInbox from "./MessageInbox";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { setThreads, updateThreadPreview, markThreadRead } from "../../store/chatSlice";
import axios from "axios";
import { socket } from "../../socket";
import { useAppDispatch, useAppSelector } from "../../store/Hooks";
import type { ReqThreadsResponse } from "../../types/api";
import "./Chat.css";

export default function ChatPage() {
  const navigate = useNavigate();
  const { threadid } = useParams<{ threadid?: string }>();
  const dispatch = useAppDispatch();

  const threads = useAppSelector((state) => state.chat.threads) || [];

  useEffect(() => {
    axios
      .get<ReqThreadsResponse>("/api/reqThreads")
      .then((res) => {
        dispatch(setThreads(res.data.threads || []));
      })
      .catch((err) => console.log(err));
  }, [dispatch]);

  const activeThreadId = threadid;
  const activeThread = useMemo(
    () => threads.find((t) => String(t._id) === String(activeThreadId)) ?? null,
    [threads, activeThreadId]
  );

  useEffect(() => {
    const handleThreadUpdate = (payload: { thread_id: string; lastMessage: string; updatedAt: string; unreadCountInc: number }) => {
      const delta = activeThreadId === payload.thread_id ? 0 : payload.unreadCountInc;

      dispatch(
        updateThreadPreview({
          threadid: payload.thread_id,
          lastMessage: payload.lastMessage,
          updatedAt: payload.updatedAt,
          unreadDelta: delta,
        })
      );
    };

    socket.on("thread:update", handleThreadUpdate);
    return () => {
      socket.off("thread:update", handleThreadUpdate);
    };
  }, [activeThreadId, dispatch]);

  const handleSelectThread = (_id: string) => {
    dispatch(markThreadRead({ _id }));
    navigate(`/message/${_id}`);
  };

  return (
    <Container className="py-3">
      <Row className="g-3 justify-content-center">
        <Col xs={12} md={4} lg={3}>
          <Card className="chat-card h-100">
            <Card.Header className="chat-card-header">
              <div className="d-flex align-items-center justify-content-between">
                <div className="chat-title">쪽지함</div>
                <div className="d-flex align-items-center gap-2">
                  <Button size="sm" variant="outline-secondary" title="더보기">
                    ⋮
                  </Button>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              <MessageInbox threads={threads} activeThreadId={activeThreadId} onSelect={handleSelectThread} />
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={8} lg={6}>
          <Card className="chat-card h-100">
            <Card.Header className="chat-card-header">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  {activeThread && (
                    <div className="chat-profile-img-box">
                      <img
                        className="chat-profile-img"
                        src={activeThread?.otherUser.profileImg?.img_URL}
                        alt="profile"
                      />
                    </div>
                  )}
                  <div className="chat-title">{activeThread?.otherUser.username ?? "대화 없음"}</div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {activeThread && (
                    <DropdownButton id="dropdown-basic-button" className="chat-dropdown" title="">
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={() => navigate(`/forum/${activeThread.forum_id}/${activeThread.post_id}`)}
                      >
                        원본 글로 이동
                      </Dropdown.Item>
                    </DropdownButton>
                  )}
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              <Outlet />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
