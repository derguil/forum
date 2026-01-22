import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Badge, Button, ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";
import MessageInbox from "./MessageInbox";
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setThreads, markThreadRead } from "../../store/chatSlice"
import axios from 'axios';
import "./Chat.css";

export default function ChatPage() {  
  const navigate = useNavigate();
  const { threadid } = useParams();
  const dispatch = useDispatch();

  const activeId = threadid || "";

  const threads = useSelector(
    (state) => state.chat.threads
  ) || [];
  console.log(threads)

  useEffect(() => {
    axios.get("/api/reqThreads")
      .then((res) => {
        dispatch(setThreads(res.data.threads || []));
      })
      .catch((err) => console.log(err))
  }, []);

  const activeThread = useMemo(() => threads.find((t) => t._id === activeId) ?? null,
    [threads, activeId]
  );

  const handleSelectThread = (_id) => {
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
              <MessageInbox
                threads={threads}
                activeId={activeId}
                onSelect={handleSelectThread}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={8} lg={6}>
          <Card className="chat-card h-100">
            <Card.Header className="chat-card-header">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  {activeThread && 
                    <div className="chat-profile-img-box">
                      <img
                        className="chat-profile-img"
                        src={ activeThread?.otherUser.profileImg.img_URL }
                        alt="profile"
                      />
                    </div>
                  }
                  <div className="chat-title">{activeThread?.otherUser.username ?? "대화 없음"}</div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {activeThread && 
                    <DropdownButton
                      id="dropdown-basic-button"
                      className="chat-dropdown"
                    >
                      {/* <Dropdown.Item>채팅방 나가기</Dropdown.Item>
                      <Dropdown.Item>전체 삭제</Dropdown.Item> */}
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={()=>navigate(`/forum/${activeThread.forum_id}/${activeThread.post_id}`)}>원본 글로 이동</Dropdown.Item>
                    </DropdownButton>
                  }
                </div>  
              </div>  
            </Card.Header>

            <Card.Body className="p-0">
              <Outlet/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
