import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button, Modal, InputGroup, Form } from "react-bootstrap";
import axios from "axios";
import { useAppSelector } from "../../store/Hooks";
import type { Forum, ReqForumsResponse } from "../../types/api";

function ForumList() {
  const [refresh, setRefresh] = useState(false);
  const [forums, setForums] = useState<Forum[]>([]);

  useEffect(() => {
    axios
      .get<ReqForumsResponse>("/api/reqForums")
      .then((res) => {
        setForums(res.data.forums);
      })
      .catch((err) => console.log(err));
  }, [refresh]);

  const authUserId = useAppSelector((state) => state.auth.user?._id);
  const isLoggedIn = !!authUserId;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <ul className="forum-list">
        {forums.map((forum) => {
          return (
            <li key={forum._id}>
              <Link to={`/forum/${forum._id}`}>{forum.title}</Link>
            </li>
          );
        })}
        {isLoggedIn && (
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleShow();
              }}
            >
              게시판 새로 만들기
            </Link>
          </li>
        )}
      </ul>
      <Outlet />

      <Example show={show} handleClose={handleClose} setRefresh={setRefresh} />
    </>
  );
}

type ExampleProps = {
  show: boolean;
  handleClose: () => void;
  setRefresh: Dispatch<SetStateAction<boolean>>;
};

function Example({ show, handleClose, setRefresh }: ExampleProps) {
  const navigate = useNavigate();

  const [forumName, setForumName] = useState("");
  return (
    <>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>게시판 새로 만들기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="이름"
              aria-label="Default"
              aria-describedby="inputGroup-sizing-default"
              value={forumName}
              onChange={(e) => setForumName(e.target.value)}
            />
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              axios
                .post("/api/addForum", {
                  forumName: forumName,
                })
                .then((res) => {
                  console.log("생성됨:", res.data);
                  handleClose();
                  setRefresh((prev) => !prev);
                })
                .catch((err) => {
                  alert(err.response?.data?.message || "작성 중 오류 발생");
                  if (err.response?.status === 401) {
                    navigate("/login");
                  }
                });
            }}
          >
            새로 만들기!
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ForumList;
