// PostDetail.jsx (변경본)
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Container, Row, Col, Image, Card, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import ForumTitle from './ForumTitle';
import "./PostDetail.css";

export default function PostDetail() {
  let [forum, setForum] = useState([])
  let [post, setPost] = useState([])
  let [comments, setComments] = useState([])
  let [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(true);
  const [deleteloading, setDeleteloading] = useState(false);
  const { forumid, postid } = useParams();
  let [userId, setUserId] = useState(null)

  useEffect(() => {
    Promise.all([
      axios.get("/api/reqForum", { params: { forumid } }),
      axios.get("/api/reqPost", { params: { postid } }),
      axios.get("/api/reqComments", { params: { postid } }),
    ])
      .then(([forumRes, postRes, commentsRes]) => {
        setForum(forumRes.data.forum);
        setPost(postRes.data.post);
        setComments(commentsRes.data.comments);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));

    axios.get("/api/auth/me")
      .then(res => setUserId(res.data.user))
      .catch(() => setUserId(null));
  }, [postid, refresh]);

  const isLoggedIn = !!userId;

  if (loading) return <div className="postdetail-loading-overlay">로딩 중...</div>
  if (deleteloading) return <div className="postdetail-loading-overlay">삭제 중...</div>

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div className="postdetail-wrap">
          <ForumTitle forumtitle={forum.title} isLoggedIn={false}/>
            <Card className="mx-auto">
              <Card.Body>

                <Profile
                  wtime={timeAgo(post.wtime)}
                  wby={post.written.username}
                  wbyimg={post.written.profileImg.img_URL}
                  isOwn={userId == post.wby}
                  isLoggedIn={isLoggedIn}
                  post_id={postid}
                  forum_id={forumid}
                  setDeleteloading={setDeleteloading}
                />

                <Card.Title>{post.title}</Card.Title>
                <Card.Text className="postdetail-content">{post.content}</Card.Text>

                {post.images?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {post.images.map((img, i) => (
                      <Image
                        key={i}
                        src={img.img_URL}
                        style={{
                          width: "100%",
                          maxHeight: "500px",
                          objectFit: "contain",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                )}

              </Card.Body>
            </Card>

            <hr />

            <div>
              {comments.map((comment, i) => (
                <Comment
                  key={i}
                  comment={comment}
                  userId={userId}
                  isLoggedIn={isLoggedIn}
                  setRefresh={setRefresh}
                  postid={postid}
                  setDeleteloading={setDeleteloading}
                />
              ))}

              {isLoggedIn && (
                <CommentWrite postid={postid} setRefresh={setRefresh} />
              )}
            </div>

          </div>
        </Col>
      </Row>
    </Container>
  )
}

function Profile({ wtime, wby, wbyimg, isOwn, isLoggedIn, post_id, forum_id, setDeleteloading }) {
  const navigate = useNavigate();
  return (
    <div className='postdetail-header'>
      <div className="postdetail-profile">
        <div className="postdetail-profile-img-box">
          <img
            className="postdetail-profile-img"
            src={wbyimg}
            alt="profile"
          />
        </div>
        <div className="postdetail-profile-text">
          <h3 className="postdetail-large">{wby}</h3>
          <time className="postdetail-large">{wtime}</time>
        </div>
      </div>

      <div className="postdetail-right-actions">
        {(isOwn && isLoggedIn) &&
          <>
            <button className="postdetail-btn" onClick={() => { navigate(`edit`) }}>수정</button>
            <button
              className="postdetail-btn"
              onClick={() => {
                const ok = window.confirm("이 글을 삭제하시겠습니까?");
                if (!ok) return;

                setDeleteloading(true);

                axios.delete("/api/post", {
                  params: { post_id }
                })
                  .then(res => {
                    console.log("삭제 성공:", res.data)
                    navigate(`/forum/${forum_id}`);
                  })
                  .catch((err) => {
                    alert(err.response?.data?.message || "삭제 실패")
                  })
                  .finally(() => {
                    setDeleteloading(false);
                  });
              }}
            >
              삭제
            </button>
          </>
        }
        {(!isOwn && isLoggedIn) &&
          <button 
            className="postdetail-btn"
            onClick={() => {
              axios.post("/api/threads", {
                post_id,
              })
                .then(res => {
                  navigate(`/message/${res.data.threadId}`);
                })
                .catch((err) => {
                  alert(err.response?.data?.message || "쪽지 전송 실패")
                })
            }}
          >
            쪽지
          </button>
        }
      </div>
    </div>
  )
}

function Comment({ comment, userId, isLoggedIn, setRefresh, postid, setDeleteloading }) {
  return (
    <Card style={{ maxWidth: '2000px', width: '100%', margin: '0 auto' }}>
      <Card.Body>
        <ProfileComment
          wtime={timeAgo(comment.wtime)}
          wby={comment.written.username}
          wbyimg={comment.written.profileImg.img_URL}
          isOwn={userId == comment.wby}
          isLoggedIn={isLoggedIn}
          comment_id={comment._id}
          setRefresh={setRefresh}
          postid={postid}
          setDeleteloading={setDeleteloading}
        />
        <Card.Text>{comment.comment}</Card.Text>
      </Card.Body>
    </Card>
  )
}

function ProfileComment({ wtime, wby, wbyimg, isOwn, isLoggedIn, comment_id, setRefresh, postid, setDeleteloading }) {
  return (
    <div className="postdetail-comment-header">
      <div className="postdetail-comment-profile">
        <img src={wbyimg} className="postdetail-comment-picture" alt="profile" />
        <h3 className="postdetail-comment-text">{wby}</h3>
        <time className="postdetail-comment-text">{wtime}</time>
      </div>

      <div className="postdetail-right-actions">
        {(isOwn && isLoggedIn) &&
          <button
            className="postdetail-btn postdetail-btn-sm"
            onClick={() => {
              const ok = window.confirm("이 댓글을 삭제하시겠습니까?");
              if (!ok) return;

              setDeleteloading(true);

              axios.delete("/api/comment", {
                params: { comment_id, postid }
              })
                .then(res => {
                  console.log("삭제 성공:", res.data)
                  setRefresh(prev => !prev);
                })
                .catch((err) => {
                  alert(err.response?.data?.message || "삭제 실패")
                })
                .finally(() => {
                  setDeleteloading(false);
                });
            }}
          >
            삭제
          </button>
        }

        {(!isOwn && isLoggedIn) &&
          <button className="postdetail-btn postdetail-btn-sm">쪽지</button>
        }
      </div>
    </div>
  );
}

function timeAgo(wtime) {
  const diff = (new Date() - new Date(wtime)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function CommentWrite({ postid, setRefresh }) {
  let navigate = useNavigate()
  const [comment, setComment] = useState("")

  const handleCommentSubmit = () => {
    if (!comment) {
      alert("내용을 입력하세요.")
      return;
    }

    axios.post("/api/writeComment", {
      parent_id: postid,
      comment: comment,
    })
      .then(res => {
        console.log("작성 성공:", res.data)
        setComment("");
        setRefresh(prev => !prev);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      })
  };

  return (
    <InputGroup className="mb-3">
      <Form.Control
        placeholder="댓글을 입력하세요."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button variant="outline-secondary" onClick={handleCommentSubmit}>
        댓글 쓰기
      </Button>
    </InputGroup>
  )
}
