import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import {
  ChangeUsernameModal,
  ChangeEmailModal,
  ChangeProfileImgModal,
  ChangePasswordModal,
} from "./AccountModals";
import { socket } from "../../socket";
import "./MyPage.css";
import axios from 'axios';

function MyPage() {
  const navigate = useNavigate();
  const [chloading, setChloading] = useState(false);

  const [refresh, setRefresh] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setChloading(true)
    axios.get("/api/mypage")
      .then((res) => {
        setUsername(res.data.username);
        setEmail(res.data.email);
        setProfileImg(res.data.profileImg.img_URL);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        alert(err.response?.data?.message || "작성 중 오류 발생");
      })
      .finally(()=>setChloading(false))
  }, [refresh, navigate]);

  const [mypageShowUsername, setMypageShowUsername] = useState(false);
  const [mypageShowEmail, setMypageShowEmail] = useState(false);
  const [mypageShowProfileImg, setMypageShowProfileImg] = useState(false);
  const [mypageShowPassword, setMypageShowPassword] = useState(false);

  const mypageItems = [
    { label: "아이디 변경", value: username, onClick: () => setMypageShowUsername(true) },
    { label: "이메일 변경", value: email, onClick: () => setMypageShowEmail(true) },
    { label: "프로필 사진 변경", value: "", onClick: () => setMypageShowProfileImg(true) },
    { label: "비밀번호 변경", value: "", onClick: () => setMypageShowPassword(true) },
  ];

  ////////////////////

  const handleChangeUsername = async (value) => {
    setChloading(true)

    axios.put("/api/chusername", {
      username: value
    })
      .then((res) => {
        alert(res.data.message);
        setRefresh(prev => !prev);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        return
      })
      .finally(() => {
        setChloading(false);
      });
  };

  const handleChangeEmail = async (value) => {
    setChloading(true)

    axios.put("/api/chemail", {
      email: value
    })
      .then((res) => {
        alert(res.data.message);
        setRefresh(prev => !prev);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        return
      })
      .finally(() => {
        setChloading(false);
      });
  };

  const handleChangeProfileImg = (file) => {
    const formData = new FormData();
    formData.append("profileImg", file);

    setChloading(true)

    axios.put("/api/chprofileimg", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        alert(res.data.message);
        setRefresh((prev) => !prev);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "이미지 변경 중 오류 발생");
        throw err;
      })
      .finally(() => {
        setChloading(false);
      });
  };

  const handleChangePassword = async ({ currentPw, newPw }) => {
    setChloading(true)

    axios.put("/api/chpassword", {
      currentPassword: currentPw,
      newPassword: newPw
    })
      .then((res) => {
        alert(res.data.message);
        navigate("/login");
      })
      .catch((err) => {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        return
      })
      .finally(() => {
        setChloading(false);
      });
  };

  ////////////////////

  const handleLogout = () => {
    axios.post("/api/auth/logout")
      .then(res => {
        socket.disconnect()
        console.log("msg:", res.data);
        alert("로그아웃 성공");
        navigate("/login");
      })
      .catch(err => {
        console.error(err);
      });
  };

  if (chloading) return <div className="mypage-loading-overlay">변경 중...</div>

  return (
    <>
      <Container className="mypage-wrap">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={6}>
            <div className="mypage-root">
              <Card className="mypage-card mypage-card-top mb-4">
                <Card.Body className="mypage-card-body py-4">
                  <Row className="align-items-start">
                    <Col>
                      <h1 className="mypage-title mb-4">내 정보</h1>

                      <div className="mypage-profile">
                        <div className="mypage-profile-img-box">
                          <img
                            className="mypage-profile-img"
                            src={profileImg}
                            alt="profile"
                          />
                        </div>

                        <div className="mypage-profile-text">
                          <div className="mypage-name">
                            {username} / {email}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col xs="auto">
                      <Button
                        variant="danger"
                        className="mypage-logout"
                        onClick={handleLogout}
                      >
                        로그아웃
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mypage-card mypage-card-bottom">
                <Card.Body className="mypage-card-body py-4">
                  <h2 className="mypage-section-title mb-3">계정</h2>

                  <ListGroup variant="flush" className="mypage-list">
                    {mypageItems.map((it, idx) => (
                      <ListGroup.Item
                        key={idx}
                        action
                        onClick={it.onClick}
                        className="mypage-item"
                      >
                        <div className="mypage-item-row">
                          <span className="mypage-item-label">{it.label}</span>
                          <span className={`mypage-item-value ${it.value ? "" : "muted"}`}>
                            {it.value || ""}
                          </span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      <ChangeUsernameModal
        show={mypageShowUsername}
        onHide={() => setMypageShowUsername(false)}
        onSubmit={handleChangeUsername}
      />
      <ChangeEmailModal
        show={mypageShowEmail}
        onHide={() => setMypageShowEmail(false)}
        onSubmit={handleChangeEmail}
      />
      <ChangeProfileImgModal
        show={mypageShowProfileImg}
        onHide={() => setMypageShowProfileImg(false)}
        onSubmit={handleChangeProfileImg}
        profileImg={profileImg}
      />
      <ChangePasswordModal
        show={mypageShowPassword}
        onHide={() => setMypageShowPassword(false)}
        onSubmit={handleChangePassword}
      />
    </>
  );
}

export default MyPage;


// 회원 탈퇴->로그아웃->회원 삭제
// session은 redis, user는 sql에!