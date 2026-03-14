import { useEffect, useState } from 'react'
import { Modal, Button, Form, Image } from "react-bootstrap";

export function ChangeUsernameModal({ show, onHide, onSubmit }) {
  const [value, setValue] = useState("");

  const handleSave = () => {
    onSubmit(value);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>아이디 변경</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label>새 아이디</Form.Label>
        <Form.Control
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="새 아이디 입력"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>닫기</Button>
        <Button variant="primary" onClick={handleSave}>변경</Button>
      </Modal.Footer>
    </Modal>
  );
}

export function ChangeEmailModal({ show, onHide, onSubmit }) {
  const [value, setValue] = useState("");

  const handleSave = () => {
    onSubmit(value);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>이메일 변경</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label>새 이메일</Form.Label>
        <Form.Control
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="새 이메일 입력"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>닫기</Button>
        <Button variant="primary" onClick={handleSave}>변경</Button>
      </Modal.Footer>
    </Modal>
  );
}

export function ChangeProfileImgModal({ show, onHide, onSubmit, profileImg }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSave = async () => {
    if (!file) return alert("이미지를 선택하세요.");

    await onSubmit(file);
    setFile(null);
    setPreviewUrl(null);
    onHide();
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>프로필 사진 변경</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Label>새 프로필 사진</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {
          <div className="mt-3 text-center">
            <Image
              src={previewUrl || profileImg}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover"
              }}
            />
          </div>
        }
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
        <Button variant="primary" onClick={handleSave}>
          변경
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function ChangePasswordModal({ show, onHide, onSubmit }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  const handleSave = () => {
    if (newPw !== newPw2) return alert("새 비밀번호가 일치하지 않습니다.");
    onSubmit({ currentPw, newPw });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>비밀번호 변경</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label>현재 비밀번호</Form.Label>
        <Form.Control
          type="password"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          placeholder="현재 비밀번호"
        />

        <div style={{ height: 12 }} />

        <Form.Label>새 비밀번호</Form.Label>
        <Form.Control
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          placeholder="새 비밀번호"
        />

        <div style={{ height: 12 }} />

        <Form.Label>새 비밀번호 확인</Form.Label>
        <Form.Control
          type="password"
          value={newPw2}
          onChange={(e) => setNewPw2(e.target.value)}
          placeholder="새 비밀번호 확인"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>닫기</Button>
        <Button variant="primary" onClick={handleSave}>변경</Button>
      </Modal.Footer>
    </Modal>
  );
}
