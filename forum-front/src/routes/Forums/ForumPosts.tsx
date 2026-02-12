import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Image, Card, Pagination } from "react-bootstrap";
import axios from "axios";
import ForumTitle from "./ForumTitle";
import SidePostsBar from "./sideMenu/SidePostsBar";
import MySideBar from "./sideMenu/MySideBar";
import styles from "./ForumPosts.module.css";
import { useAppSelector } from "../../store/Hooks";
import type { Forum, PostListItem, ReqForumResponse, ReqPostsResponse } from "../../types/api";

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
  const limit = 10;
  const [forum, setForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { forumid, tab } = useParams<{ forumid?: string; tab?: string }>();

  const [searchParams] = useSearchParams();
  const currPage = Number(searchParams.get("p") || 1);

  const isRankForum =
    forumid === "6979d19e7302ac81bff9a61b" || forumid === "6979d1a87302ac81bff9a61c";

  useEffect(() => {
    if (!tab && forumid) {
      axios
        .get<ReqForumResponse>("/api/reqForum", { params: { forumid } })
        .then((res) => setForum(res.data.forum))
        .catch(console.log);
    }
  }, [forumid, tab]);

  useEffect(() => {
    setLoading(true);

    if (tab) {
      axios
        .get<ReqPostsResponse>("/api/reqUserActivity", {
          params: { tab, currPage, limit },
        })
        .then((res) => {
          setPosts(res.data.posts);
          setPostCount(res.data.totalPostsCount);
        })
        .catch(console.log)
        .finally(() => setLoading(false));
    } else if (forumid === "6979d19e7302ac81bff9a61b") {
      axios
        .get<ReqPostsResponse>("/api/reqHotPosts", {
          params: { currPage, limit },
        })
        .then((res) => {
          setPosts(res.data.posts);
          setPostCount(res.data.totalPostsCount);
        })
        .catch(console.log)
        .finally(() => setLoading(false));
    } else if (forumid === "6979d1a87302ac81bff9a61c") {
      axios
        .get<ReqPostsResponse>("/api/reqBestPosts", {
          params: { currPage, limit },
        })
        .then((res) => {
          setPosts(res.data.posts);
          setPostCount(res.data.totalPostsCount);
        })
        .catch(console.log)
        .finally(() => setLoading(false));
    } else {
      axios
        .get<ReqPostsResponse>("/api/reqPosts", {
          params: { forumid, currPage, limit },
        })
        .then((res) => {
          setPosts(res.data.posts);
          setPostCount(res.data.totalPostsCount);
        })
        .catch(console.log)
        .finally(() => setLoading(false));
    }
  }, [forumid, currPage, tab]);

  const authUserId = useAppSelector((state) => state.auth.user?._id);
  const isLoggedIn = !!authUserId;

  const getTabTitle = () => {
    switch (tab) {
      case "posts":
        return "내가 쓴 글";
      case "comments":
        return "댓글 단 글";
      case "scraps":
        return "내 스크랩";
      default:
        return "";
    }
  };

  if (loading) return <div style={{ padding: "0 15px" }}>로딩중...</div>;

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
            gridColumn: isLoggedIn ? "5 / span 8" : "3 / span 10",
          }}
        >
          <div id="container" className={styles.article}>
            {tab ? (
              <div className={`wrap ${styles.tabHeader}`}>
                <h2>{getTabTitle()}</h2>
              </div>
            ) : (
              <ForumTitle
                forumid={forumid}
                forumtitle={forum?.title}
                isLoggedIn={isLoggedIn}
                isRankForum={isRankForum}
              />
            )}
            {postCount === 0 && (
              <div className="wrap" style={emptyStyle}>
                <h2 style={emptyTextStyle}>게시글을 찾을 수 없습니다.</h2>
              </div>
            )}
            <div className={styles.postsWrap}>
              {posts.map((post) => {
                return <Post key={post._id} post={post} />;
              })}
            </div>
          </div>
        </div>
        <div style={{ gridColumn: "span 4" }}>
          <SidePostsBar />
        </div>
      </div>
      <div className={styles.paginationWrap}>
        <PagiNation postCount={postCount} currPage={currPage} limit={limit} />
      </div>
    </>
  );
}

function timeAgo(wtime: string | number | Date) {
  const diff = (new Date().getTime() - new Date(wtime).getTime()) / 1000;

  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

  return `${Math.floor(diff / 86400)}일 전`;
}

type PostProps = {
  post: PostListItem;
};

function Post({ post }: PostProps) {
  const hasImage = Array.isArray(post.images) && post.images.length > 0;
  const voteCount = post.voteCount ?? 0;
  const commentCount = post.commentCount ?? 0;
  const scrapCount = post.scrapCount ?? 0;
  const isFirst = voteCount + commentCount + scrapCount === 0;
  const contentText = post.content ?? "";

  return (
    <div className={styles.postCard}>
      <Card.Link as={Link} to={`/forum/${post.parent_id}/${post._id}`} className={styles.postLink}>
        <div className={styles.postBody}>
          <div className={styles.postLeft}>
            {post.forum && <h2 className={styles.postForumTitle}>{post.forum.title}</h2>}
            <h2 className={styles.postTitle}>{post.title}</h2>
            <div className={styles.postContent}>
              {contentText.replace(/\r\n|\r|\n/g, "\n").replace(/\n+/g, "\n").trim()}
            </div>

            <div className={`${styles.postMeta} ${isFirst ? styles.noDivider : ""}`}>
              <ul className={styles.detailStatus}>
                {voteCount > 0 && (
                  <li title="공감" className={styles.vote}>
                    {voteCount}
                  </li>
                )}
                {commentCount > 0 && (
                  <li title="댓글" className={styles.comment}>
                    {commentCount}
                  </li>
                )}
                {scrapCount > 0 && (
                  <li title="스크랩" className={styles.scrap}>
                    {scrapCount}
                  </li>
                )}
              </ul>
              <time className={`${styles.postTime} ${isFirst ? styles.noDivider : ""}`}>
                {timeAgo(post.wtime)}
              </time>
              <h3 className={styles.postUser}>{post.written?.username}</h3>
            </div>
          </div>

          {hasImage && (
            <Image src={post.images?.[0].img_URL} className={styles.postThumb} alt="post thumbnail" />
          )}
        </div>
      </Card.Link>
    </div>
  );
}

type PagiNationProps = {
  postCount: number;
  currPage: number;
  limit: number;
};

function PagiNation({ postCount, currPage, limit }: PagiNationProps) {
  const navigate = useNavigate();

  const totalPages = Math.max(1, Math.ceil(postCount / limit));
  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === currPage) return;
    navigate(`?p=${p}`);
  };

  return (
    <Pagination>
      <Pagination.First disabled={currPage === 1} onClick={() => go(1)} />
      <Pagination.Prev disabled={currPage === 1} onClick={() => go(currPage - 1)} />

      {currPage > 3 && <Pagination.Ellipsis disabled />}
      {currPage > 2 && <Pagination.Item onClick={() => go(currPage - 2)}>{currPage - 2}</Pagination.Item>}
      {currPage > 1 && <Pagination.Item onClick={() => go(currPage - 1)}>{currPage - 1}</Pagination.Item>}
      <Pagination.Item active>{currPage}</Pagination.Item>
      {currPage < totalPages && <Pagination.Item onClick={() => go(currPage + 1)}>{currPage + 1}</Pagination.Item>}
      {currPage < totalPages - 1 && (
        <Pagination.Item onClick={() => go(currPage + 2)}>{currPage + 2}</Pagination.Item>
      )}
      {currPage < totalPages - 2 && <Pagination.Ellipsis disabled />}

      <Pagination.Next disabled={currPage === totalPages} onClick={() => go(currPage + 1)} />
      <Pagination.Last disabled={currPage === totalPages} onClick={() => go(totalPages)} />
    </Pagination>
  );
}

export default ForumPosts;
