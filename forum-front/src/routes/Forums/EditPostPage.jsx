import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Image, Modal } from "react-bootstrap";
import addBtnImg from "./../../assets/container.articles.write.thumbnails.new.png";
import axios from "axios";
import "./EditPostPage.css"

function EditPostPage() {
  const MAX_IMAGES = 20;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { forumid, postid } = useParams();

  let [post, setPost] = useState([])
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [attachments, setAttachments] = useState([]); // [{ id, file, url }]

  const fileInputRef = useRef(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(()=>{
    axios.get("/api/reqPost", { params: { postid } })
    .then((postRes) => {
      const postData = postRes.data.post;
      setPost(postData)
      setTitle(postData.title)
      setContent(postData.content)
      if (postData?.images?.length > 0) {
        convertImg(postData);
      }
    })
    .catch((err) => console.log(err));
  }, [postid])

  const convertImg = (postData) => {
    if (!postData?.images) return;

    const converted = postData.images.map(img => ({
      id: `${crypto?.randomUUID ? crypto.randomUUID() : Date.now() + Math.random()}`,
      file: null,
      url: img.img_URL,
      img_key: img.img_key
    }));

    setAttachments(converted);
  };

  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (typeof a?.url === "string" && a.url.startsWith("blob:")) {
          URL.revokeObjectURL(a.url);
        }
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
      if (target?.url?.startsWith("blob:")) URL.revokeObjectURL(target.url);

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

  const keepOldImages = attachments
  .filter(a => !a.file && a.img_key)  // 기존 이미지
  .map(a => ({
    img_key: a.img_key,
    img_URL: a.url,
  }));

  const newFiles = attachments
  .filter(a => a.file)  // 새 이미지
  .map(a => a.file);

  const originalKeys = (post.images || []).map(img => img.img_key);
  const keepKeys = new Set(keepOldImages.map(img => img.img_key));
  const removedOldKeys = originalKeys.filter(k => !keepKeys.has(k));

  const handlePostSubmit = () => {
    if (attachments.length > MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
      return;
    }
    if (!title || !content) {
      alert("제목과 내용을 입력하세요.");
      return;
    }

    if (loading) return

    const formData = new FormData();
    formData.append("parent_id", forumid);
    formData.append("post_id", postid);
    formData.append("title", title);
    formData.append("content", content);

    formData.append("keepOldImages", JSON.stringify(keepOldImages));
    formData.append("removedOldKeys", JSON.stringify(removedOldKeys));

    newFiles.forEach(file => formData.append("images", file));

    setLoading(true);

    axios.post("/api/editPost", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      console.log("수정 성공:", res.data);
      navigate(`/forum/${forumid}`);
    })
    .catch((err) => {
      alert(err.response?.data?.message || "수정 중 오류 발생");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    })
    .finally(() => {
      setLoading(false);
    });
  };

  if (loading) return <div className="loading-overlay">수정 중...</div>

  return (
    <Container className="mt-4 editpost">
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="editpost-card">
            <Card.Header>
              <h5 className="mb-0">글 수정하기</h5>
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

                <Row className="mt-3 editpost-grid">
                  {attachments.map((a) => (
                    <Col xs={4} md={2} key={a.id} className="mb-2">
                      <Image
                        src={a.url}
                        className="editpost-thumb"
                        onClick={() => openDeleteModal(a.id)}
                      />
                    </Col>
                  ))}

                  <Col xs={4} md={2} className="mb-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="editpost-addbox"
                    >
                      <Image src={addBtnImg} className="editpost-addicon" />
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
                글수정 취소
              </Button>
              <Button variant="primary" onClick={handlePostSubmit}>
                수정
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EditPostPage;