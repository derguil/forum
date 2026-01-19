import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Outlet, useSearchParams } from 'react-router-dom'
import { Button, Container, Nav, Navbar, Row, Col, ListGroup, NavDropdown, Image, Card, Pagination }  from 'react-bootstrap';
import axios from 'axios';
import ForumTitle from './ForumTitle';
import "./ForumPosts.css"

function ForumPosts() {
  const navigate = useNavigate();

  const limit = 10;
  let [forum, setForum] = useState([])
  let [posts, setPosts] = useState([])
  let [postCount, setPostCount] = useState(0)
  const [loading, setLoading] = useState(true);
  const { forumid } = useParams()

  const [searchParams, setSearchParams] = useSearchParams();
  const currPage = Number(searchParams.get("p") || 1);

  let [userId, setUserId] = useState(null)

  useEffect(() => {
    axios.get("/api/reqForum", { params: { forumid } })
      .then(res => setForum(res.data.forum))
      .catch(console.log);
  }, [forumid]);

  useEffect(() => {
    setLoading(true);

    axios.get("/api/reqPosts", {
      params: { forumid, currPage, limit }
    })
    .then(res => {
      setPosts(res.data.posts);
      setPostCount(res.data.totalPostsCount);
    })
    .catch(console.log)
    .finally(() => setLoading(false));
  }, [forumid, currPage]);

  useEffect(() => {
    axios.get("/api/auth/me")
      .then(res => setUserId(res.data.user))
      .catch(() => setUserId(null));
  }, []);

  const isLoggedIn = !!userId;
  
  if (loading) return <div style={{ padding: '0 15px' }}>로딩중...</div>
  
  return (
    <Container fluid className="ForumPosts-wrap">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div id="container" className='article'>
            <ForumTitle forumtitle={forum.title} isLoggedIn={isLoggedIn}></ForumTitle>
            {posts.length === 0 && <div>게시글을 찾을 수 없습니다.</div>}
            {
              posts.map((post, i)=>{  
                return(
                  <div key={i}>
                    <Post post={post}/>
                  </div>
                )
              })
            }
          </div>
          <hr></hr>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PagiNation postCount={postCount} currPage={currPage} limit={limit}></PagiNation>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

function timeAgo(wtime) {
  const diff = (new Date() - new Date(wtime)) / 1000;

  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

  return `${Math.floor(diff / 86400)}일 전`;
}

function Post({ post }) {
  const hasImage = Array.isArray(post.images) && post.images.length > 0;

  return (
    <Card className="post-card">
      <Card.Link
        as={Link}
        to={`/forum/${post.parent_id}/${post._id}`}
        className="post-link"
      >
        <Card.Body className="post-body">
          <div className="post-left">
            <Card.Title className="post-title">{post.title}</Card.Title>
            <Card.Text className="post-content preview">{post.content}</Card.Text>

            <div className="post-meta">
              <ul className="status">
                <li title="댓글" className="comment">{post.commentCount}</li>
              </ul>
              <time className="post-time">{timeAgo(post.wtime)}</time>
              <h3 className="post-user">{post.written?.username}</h3>
            </div>
          </div>

          {hasImage && (
            <Image
              src={post.images[0].img_URL}
              className="post-thumb"
              alt="post thumbnail"
            />
          )}
        </Card.Body>
      </Card.Link>
    </Card>
  );
}

function PagiNation({ postCount, currPage, limit }){
  const navigate = useNavigate();

  const totalPages = Math.max(1, Math.ceil(postCount / limit));
  const go = (p) => {
    if (p < 1 || p > totalPages || p === currPage) return;
    navigate(`?p=${p}`, { replace: true });
  }

  return(
    <Pagination>
      <Pagination.First
        disabled={currPage === 1}
        onClick={() => go(1)}
      />
      <Pagination.Prev
        disabled={currPage === 1}
        onClick={() => go(currPage - 1)}
      />

      {(currPage > 3) && <Pagination.Ellipsis disabled/>}
      {(currPage > 2) && <Pagination.Item onClick={() => go(currPage - 2)}>{currPage - 2}</Pagination.Item>}
      {(currPage > 1) && <Pagination.Item onClick={() => go(currPage - 1)}>{currPage - 1}</Pagination.Item>}
      <Pagination.Item active>{currPage}</Pagination.Item>
      {(currPage < totalPages) && <Pagination.Item onClick={() => go(currPage + 1)}>{currPage + 1}</Pagination.Item>}
      {(currPage < totalPages - 1) && <Pagination.Item onClick={() => go(currPage + 2)}>{currPage + 2}</Pagination.Item>}
      {(currPage < (totalPages - 2)) && <Pagination.Ellipsis disabled/>}

      <Pagination.Next
        disabled={currPage === totalPages}
        onClick={() => go(currPage + 1)}
      />
      <Pagination.Last
        disabled={currPage === totalPages}
        onClick={() => go(totalPages)}
      />
    </Pagination>
  )
}



export default ForumPosts