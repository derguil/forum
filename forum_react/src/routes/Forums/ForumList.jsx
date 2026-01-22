import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Outlet, Navigate } from 'react-router-dom'
import { Button, Container, Nav, Navbar, Row, Col, ListGroup, NavDropdown, Modal, InputGroup, Form  }  from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from "react-redux";

function ForumList(){
  let navigate = useNavigate()
  
  let [refresh, setRefresh] = useState(false)
  let [forums, setForums] = useState([])

  useEffect(()=>{
    axios.get("/api/reqForums")
    .then((res) => {
      setForums(res.data.forums)
    })
    .catch((err) => console.log(err));
  }, [refresh])

  const authUserId = useSelector(state => state.auth.user?._id);
  const isLoggedIn = !!authUserId;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return(
    <>
      <ul className="forum-list">
        {
          forums.map((forum, i)=>{
            return(
              <li>
                <Link to={`/forum/${forum._id}`}>{forum.title}</Link>
              </li>
            )
          })
        }
        {isLoggedIn && (
          <li>
            <Link onClick={handleShow}>게시판 새로 만들기</Link>
          </li>
        )}
      </ul>
      <Outlet></Outlet>

      <Example show={show} handleClose={handleClose} setRefresh={setRefresh}></Example>
    </>
  )
}

function Example({ show, handleClose, setRefresh }) {
  let navigate = useNavigate()

  const [forumName, setForumName] = useState("");
  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
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
          <Button variant="primary" onClick={() => {
            axios.post("/api/addForum", {
              forumName: forumName
            })
            .then(res => {
              console.log("생성됨:", res.data);
              handleClose();
              setRefresh(prev => !prev);
            })
            .catch((err) => {
              alert(err.response?.data?.message || "작성 중 오류 발생");
              if (err.response?.status === 401) {
                navigate("/login");
              }
            })
          }}>새로 만들기!</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ForumList