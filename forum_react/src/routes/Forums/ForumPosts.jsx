import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Outlet } from 'react-router-dom'
import { Button, Container, Nav, Navbar, Row, Col, ListGroup, NavDropdown, Image, Card }  from 'react-bootstrap';
import axios from 'axios';
import ForumTitle from './ForumTitle';
import "./ForumPosts.css"

function ForumDetail() {
  const navigate = useNavigate();

  let [forum, setForum] = useState([])
  let [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true);
  const { forumid } = useParams()
  let [userId, setUserId] = useState(null)

  useEffect(() => {
    Promise.all([
      axios.get("/api/reqForum", { params: { forumid } }),
      axios.get("/api/reqPosts", { params: { forumid } }),
    ])
    .then(([forumRes, postsRes]) => {
      setForum(forumRes.data.forum);
      setPosts(
        [...postsRes.data.posts].sort(
          (a, b) => new Date(b.wtime) - new Date(a.wtime)
        )
      );
    })
    .catch((err) => console.log(err))
    .finally(() => setLoading(false));

    axios.get("/api/auth/me")
    .then(res => setUserId(res.data.user))
    .catch(() => setUserId(null));
  }, [forumid]);
  const isLoggedIn = !!userId;
  
  if (loading) return <div style={{ padding: '0 15px' }}>로딩중...</div>
  
  return (
    <div id="container" className='article' style={{ padding: '0 15px' }}>
      <ForumTitle forumtitle={forum.title}></ForumTitle>
      {isLoggedIn && <Button onClick={()=>{navigate(`write`)}}>글 작성</Button>}
      <hr></hr>
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



export default ForumDetail