import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Image, Modal } from "react-bootstrap";
import addBtnImg from "./../../assets/container.articles.write.thumbnails.new.png";
import axios from "axios";
import "./WritePostPage.css"

function WritePostPage() {
  const MAX_IMAGES = 20;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { forumid } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [attachments, setAttachments] = useState([]); // [{ id, file, url }]

  const fileInputRef = useRef(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a?.url) URL.revokeObjectURL(a.url);
      });
    };
  }, [attachments]);

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  const confirmDelete = () => {
    if (!selectedId) return;

    setAttachments((prev) => {
      const target = prev.find((a) => a.id === selectedId);
      if (target?.url) URL.revokeObjectURL(target.url);

      return prev.filter((a) => a.id !== selectedId);
    });

    closeDeleteModal();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalCount = attachments.length + files.length;
    if (totalCount > MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
      e.target.value = "";
      return;
    }

    const newOnes = files.map((file) => ({
      id: `${crypto?.randomUUID ? crypto.randomUUID() : Date.now() + Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newOnes]);

    e.target.value = "";
  };

  const handlePostSubmit = () => {
    if (!title || !content) {
      alert("제목과 내용을 입력하세요.");
      return;
    }
    if (attachments.length > MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
      return;
    }
    
    if (loading) return;

    const formData = new FormData();
    formData.append("parent_id", forumid);
    formData.append("title", title);
    formData.append("content", content);

    attachments.forEach((a) => {
      formData.append("images", a.file);
    });

    setLoading(true);

    axios.post("/api/writePost", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      console.log("작성 성공:", res.data);
      navigate(`/forum/${forumid}`);
    })
    .catch((err) => {
      alert(err.response?.data?.message || "작성 중 오류 발생");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    })
    .finally(() => {
      setLoading(false);
    });
  };

  if (loading) return <div className="loading-overlay">업로드 중...</div>

  return (
    <Container className="mt-4 writepost">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="writepost-card">
            <Card.Header>
              <h5 className="mb-0">글쓰기</h5>
            </Card.Header>

            <Card.Body>
              <Form.Group className="mb-3" controlId="postTitle">
                <Form.Label>제목</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="postContent">
                <Form.Label>내용</Form.Label>
                <Form.Control
                  as="textarea"
                  className="post-content editor"
                  rows={6}
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="postImages">
                <Form.Label>이미지 추가</Form.Label>

                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />

                <Row className="mt-3 writepost-grid">
                  {attachments.map((a) => (
                    <Col xs={4} md={2} key={a.id} className="mb-2">
                      <Image
                        src={a.url}
                        className="writepost-thumb"
                        onClick={() => openDeleteModal(a.id)}
                      />
                    </Col>
                  ))}

                  <Col xs={4} md={2} className="mb-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="writepost-addbox"
                    >
                      <Image src={addBtnImg} className="writepost-addicon" />
                    </div>
                  </Col>
                </Row>

                <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>이미지 삭제</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>이 이미지를 첨부에서 삭제할까요?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={closeDeleteModal}>
                      취소
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                      삭제
                    </Button>
                  </Modal.Footer>
                </Modal>
              </Form.Group>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => navigate(`/forum/${forumid}`)}>
                글쓰기 취소
              </Button>
              <Button variant="primary" onClick={handlePostSubmit}>
                작성
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default WritePostPage;