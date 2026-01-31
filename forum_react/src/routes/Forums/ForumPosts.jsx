import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Outlet, useSearchParams } from 'react-router-dom'
import { Button, Container, Nav, Navbar, Row, Col, ListGroup, NavDropdown, Image, Card, Pagination }  from 'react-bootstrap';
import axios from 'axios';
import ForumTitle from './ForumTitle';
import SidePostsBar from './sideMenu/SidePostsBar'
import MySideBar from './sideMenu/MySideBar'
import { useSelector } from "react-redux";
import styles from "./ForumPosts.module.css"

const emptyStyle = {
  width: "100%",
  height: "300px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#fff",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  padding: "12px 16px",
  marginBottom: "12px",
};

const emptyTextStyle = {
  fontSize: "16px",
  margin: 0,
};

function ForumPosts() {
  const navigate = useNavigate();

  const limit = 10;
  let [forum, setForum] = useState([])
  let [posts, setPosts] = useState([])
  let [postCount, setPostCount] = useState(0)
  const [loading, setLoading] = useState(true);
  const { forumid, tab } = useParams()

  const [searchParams, setSearchParams] = useSearchParams();
  const currPage = Number(searchParams.get("p") || 1);

  const isRankForum = (forumid === "6979d19e7302ac81bff9a61b" || forumid === "6979d1a87302ac81bff9a61c");

  useEffect(() => {
    if (!tab && forumid) {
      axios.get("/api/reqForum", { params: { forumid } })
        .then(res => setForum(res.data.forum))
        .catch(console.log);
    }
  }, [forumid, tab]);

  useEffect(() => {
    setLoading(true);
    
    if (tab) {
      axios.get("/api/reqUserActivity", {
        params: { tab, currPage, limit }
      })
      .then(res => {
        setPosts(res.data.posts);
        setPostCount(res.data.totalPostsCount);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
    } else if(forumid === "6979d19e7302ac81bff9a61b") { //hot게시판
        axios.get("/api/reqHotPosts", {
          params: { currPage, limit }
        })
        .then(res => {
          setPosts(res.data.posts);
          setPostCount(res.data.totalPostsCount);
        })
        .catch(console.log)
        .finally(() => setLoading(false)); 
    } else if(forumid === "6979d1a87302ac81bff9a61c") { //best게시판
        axios.get("/api/reqBestPosts", {
          params: { currPage, limit }
        })
        .then(res => {
          setPosts(res.data.posts);
          setPostCount(res.data.totalPostsCount);
        })
        .catch(console.log)
        .finally(() => setLoading(false)); 
    } else {
      axios.get("/api/reqPosts", {
        params: { forumid, currPage, limit }
      })
      .then(res => {
        setPosts(res.data.posts);
        setPostCount(res.data.totalPostsCount);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
    }
  }, [forumid, currPage, tab]);

  const authUserId = useSelector(state => state.auth.user?._id);
  const isLoggedIn = !!authUserId;
  
  const getTabTitle = () => {
    switch(tab) {
      case 'posts': return '내가 쓴 글';
      case 'comments': return '댓글 단 글';
      case 'scraps': return '내 스크랩';
      default: return '';
    }
  };
  
  if (loading) return <div style={{ padding: '0 15px' }}>로딩중...</div>
  
  return (
    <>
      <div className={styles.grid18}>
        {isLoggedIn && (
          <div style={{ gridColumn: "3 / span 2" }}>
            <MySideBar />
          </div>
        )}

        <div
          style={{
            gridColumn: isLoggedIn
              ? "5 / span 8"   // 로그인 O
              : "3 / span 10"  // 로그인 X → 왼쪽 당겨오기
          }}
        >
          <div id="container" className={styles.article}>
            {tab ? (
              <div className={`wrap ${styles.tabHeader}`}>
                <h2>{getTabTitle()}</h2>
              </div>
            ) : (
              <ForumTitle forumid={forumid} forumtitle={forum.title} isLoggedIn={isLoggedIn} isRankForum={isRankForum}></ForumTitle>
            )}
            {postCount === 0 &&
              <div className="wrap" style={emptyStyle}>
                <h2 style={emptyTextStyle}>게시글을 찾을 수 없습니다.</h2>
              </div>
            }
            <div className={styles.postsWrap}>
              {
                posts.map((post)=>{  
                  return(
                    <Post key={post._id} post={post}/>
                  )
                })
              }
            </div>
          </div>
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <SidePostsBar></SidePostsBar>
        </div>
      </div>
      <div className={styles.paginationWrap}>
        <PagiNation postCount={postCount} currPage={currPage} limit={limit} />
      </div>
    </>
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
  const isFirst = (post.voteCount + post.commentCount + post.scrapCount == 0)

  return (
    <div className={styles.postCard}>
      <Card.Link
        as={Link}
        to={`/forum/${post.parent_id}/${post._id}`}
        className={styles.postLink}
      >
        <div className={styles.postBody}>
          <div className={styles.postLeft}>
            { post.forum && <h2 className={styles.postForumTitle}>{post.forum.title}</h2>}
            <h2 className={styles.postTitle}>{post.title}</h2>
            <div className={styles.postContent}>{post.content.replace(/\r\n|\r|\n/g, '\n').replace(/\n+/g, '\n').trim()}</div>

            <div className={`${styles.postMeta} ${isFirst ? styles.noDivider : ""}`}>
              <ul className={styles.detailStatus}>
                {post.voteCount > 0 && (
                  <li title="공감" className={styles.vote}>{post.voteCount}</li>
                )}
                {post.commentCount > 0 && (
                  <li title="댓글" className={styles.comment}>{post.commentCount}</li>
                )}
                {post.scrapCount > 0 && (
                  <li title="스크랩" className={styles.scrap}>{post.scrapCount}</li>
                )}
              </ul>
              <time className={`${styles.postTime} ${isFirst ? styles.noDivider : ""}`}>{timeAgo(post.wtime)}</time>
              <h3 className={styles.postUser}>{post.written?.username}</h3>
            </div>
          </div>

          {hasImage && (
            <Image
              src={post.images[0].img_URL}
              className={styles.postThumb}
              alt="post thumbnail"
            />
          )}
        </div>
      </Card.Link>
    </div>
  );
}

function PagiNation({ postCount, currPage, limit }){
  const navigate = useNavigate();

  const totalPages = Math.max(1, Math.ceil(postCount / limit));
  const go = (p) => {
    if (p < 1 || p > totalPages || p === currPage) return;
    navigate(`?p=${p}`);
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