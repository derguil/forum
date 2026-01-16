import { useEffect, useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import axios from 'axios';

function Login() {
  let navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    if (!username || !password) {
      alert("필수값 누락");
      return;
    }
    axios.post("/api/auth/login", {
      username,
      password
    })
    .then(res => {
      navigate("/forum");
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
          <Col xs={12} md={6} lg={5}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h2 className="mb-4 fw-bold">로그인</h2>

                <Form>
                  <Form.Group className="mb-3" controlId="loginId">
                    <Form.Label>아이디</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="아이디를 입력하세요"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="loginPw">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button type="button" className="w-100" variant="dark" onClick={()=>{
                    handleLogin()
                  }}>
                    로그인
                  </Button>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      아직 계정이 없나요?{" "}
                      <Link to="/register" className="text-decoration-underline">
                        회원가입
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

export default Login;
