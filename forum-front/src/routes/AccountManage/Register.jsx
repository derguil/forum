import { useEffect, useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import axios from 'axios';

function Register() {
  let navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")

  const handleRegister = () => {
    if (!username || !email || !password || !password2) {
      alert("필수값 누락");
      return;
    }
    if (password !== password2) {
      alert("비밀번호가 일치하지 않습니다");
      return;
    }
    axios.post("/api/auth/register", {
      username,
      email,
      password,
      password2
    })
    .then(res => {
      console.log("msg:", res.data);
      alert(res.data.message);
      navigate("/login");
    })
    .catch(err => {
      console.error(err);
      alert(err.response?.data?.message || "작성 중 오류 발생");
    });
  };

  return (
    <>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} md={7} lg={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h2 className="mb-4 fw-bold">회원가입</h2>

                <Form>
                  <Form.Group className="mb-3" controlId="regId">
                    <Form.Label>아이디</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="아이디"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="regEmail">
                    <Form.Label>이메일</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="regPw">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="비밀번호"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="regPw2">
                    <Form.Label>비밀번호 확인</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="비밀번호 확인"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                    />
                  </Form.Group>

                  <Button type="button" className="w-100" variant="dark" onClick={()=>{
                    handleRegister()
                  }}>
                    회원가입
                  </Button>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      이미 계정이 있나요?{" "}
                      <Link to="/login" className="text-decoration-underline">
                        로그인
                      </Link>
                    </small>    
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Register;