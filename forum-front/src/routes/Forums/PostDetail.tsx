import { useEffect, useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Image, Card, Form, InputGroup, Button } from "react-bootstrap";
import axios from "axios";
import ForumTitle from "./ForumTitle";
import SidePostsBar from "./sideMenu/SidePostsBar";
import styles from "./PostDetail.module.css";
import accountImg from "../../assets/6e119ef1-b710-47a4-ba3e-181439671110.png";
import { useAppSelector } from "../../store/Hooks";
import type { Comment, PostDetail as PostDetailType, ReqCommentsResponse, ReqForumResponse, ReqPostResponse } from "../../types/api";

export default function PostDetail() {
  const navigate = useNavigate();
  const { forumid, postid } = useParams<{ forumid?: string; postid?: string }>();
  const authUserId = useAppSelector((s) => s.auth.user?._id);
  const isLoggedIn = !!authUserId;

  const [forum, setForum] = useState<{ title?: string } | null>(null);
  const [post, setPost] = useState<PostDetailType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [isScrapped, setIsScrapped] = useState(false);

  const [loading, setLoading] = useState(true);
  const [deleteloading, setDeleteloading] = useState(false);

  const refetch = useCallback(() => setRefresh((v) => !v), []);

  useEffect(() => {
    if (!postid || !forumid) return;
    setLoading(true);

    Promise.all([
      axios.get<ReqForumResponse>("/api/reqForum", { params: { forumid } }),
      axios.get<ReqPostResponse>("/api/reqPost", { params: { postid } }),
      axios.get<ReqCommentsResponse>("/api/reqComments", { params: { postid } }),
    ])
      .then(([forumRes, postRes, commentsRes]) => {
        const postData = postRes.data.post as PostDetailType;

        if (postData?.isDeleted) {
          alert("삭제된 글입니다.");
          navigate(`/forum/${forumid}`, { replace: true });
          return;
        }

        setForum(forumRes.data.forum || {});
        setPost(postData || {});
        setIsScrapped(postRes.data.isScrapped);
        setComments(commentsRes.data.comments || []);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [forumid, postid, refresh, navigate]);

  const [voting, setVoting] = useState(false);
  const handlePostVoteInc = () => {
    if (voting) return;

    const ok = window.confirm("이 글을 공감하시겠습니까?");
    if (!ok) return;

    setVoting(true);
    axios
      .post("/api/postVoteInc", { forum_id: forumid, post_id: postid })
      .then(() => {
        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            voteCount: (prev.voteCount || 0) + 1,
          };
        });
      })
      .catch((err) => {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        if (err.response?.status === 401) navigate("/login");
      })
      .finally(() => setVoting(false));
  };

  const [scraping, setScraping] = useState(false);
  const handleAddPostScrap = () => {
    if (scraping) return;

    const ok = window.confirm("이 글을 스크랩하시겠습니까?");
    if (!ok) return;

    setScraping(true);
    axios
      .post("/api/addPostScrap", { post_id: postid })
      .then(() => {
        setIsScrapped(true);
        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            scrapCount: (prev.scrapCount || 0) + 1,
          };
        });
      })
      .catch((err) => {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        if (err.response?.status === 401) navigate("/login");
      })
      .finally(() => setScraping(false));
  };
  const handleDelPostScrap = () => {
    if (scraping) return;

    const ok = window.confirm("스크랩을 취소하시겠습니까?");
    if (!ok) return;

    setScraping(true);
    axios
      .post("/api/delPostScrap", { post_id: postid })
      .then(() => {
        setIsScrapped(false);
        setPost((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            scrapCount: (prev.scrapCount || 0) - 1,
          };
        });
      })
      .catch((err) => {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        if (err.response?.status === 401) navigate("/login");
      })
      .finally(() => setScraping(false));
  };

  if (loading) return <div className={styles.loadingOverlay}>로딩 중...</div>;
  if (deleteloading) return <div className={styles.loadingOverlay}>삭제 중...</div>;
  return (
    <>
      <div className={styles.grid18}>
        <div style={{ gridColumn: "3 / span 10" }}>
          <div className={styles.postdetailWrap}>
            <ForumTitle forumid={forumid} forumtitle={forum?.title} isLoggedIn={isLoggedIn} />

            <div className={styles.postCard}>
              <PostHeader
                post={post}
                forumid={forumid}
                postid={postid}
                setDeleteloading={setDeleteloading}
              />
              <h1 className={styles.postTitle}>{post?.title}</h1>
              <div className={styles.postdetailContent}>{post?.content}</div>
              {post?.images?.length ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {post.images.map((img, idx) => (
                    <Image
                      key={img?.img_key || img?.img_URL || idx}
                      src={img.img_URL}
                      style={{ width: "100%", objectFit: "contain", cursor: "pointer" }}
                    />
                  ))}
                </div>
              ) : null}
              <ul className={styles.detailStatus}>
                <li title="공감" className={styles.vote}>
                  {post?.voteCount ?? 0}
                </li>
                <li title="댓글" className={styles.comment}>
                  {post?.commentCount ?? 0}
                </li>
                <li title="스크랩" className={styles.scrap}>
                  {post?.scrapCount ?? 0}
                </li>
              </ul>
              {isLoggedIn && (
                <div className={styles.spanBtns}>
                  <span className={styles.voteSpan} onClick={handlePostVoteInc}>
                    공감
                  </span>
                  {isScrapped ? (
                    <span className={styles.scrapSpanO} onClick={handleDelPostScrap}>
                      스크랩 취소
                    </span>
                  ) : (
                    <span className={styles.scrapSpanX} onClick={handleAddPostScrap}>
                      스크랩
                    </span>
                  )}
                </div>
              )}
            </div>

            <hr />

            <div>
              {comments.map((c) => (
                <CommentItem
                  key={c._id}
                  comment={c}
                  postid={postid}
                  refetch={refetch}
                  setDeleteloading={setDeleteloading}
                />
              ))}

              {isLoggedIn && <CommentWrite postid={postid} refetch={refetch} />}
            </div>
          </div>
        </div>

        <div style={{ gridColumn: "span 4" }}>
          <SidePostsBar />
        </div>
      </div>
    </>
  );
}

type PostHeaderProps = {
  post: PostDetailType | null;
  forumid?: string;
  postid?: string;
  setDeleteloading: Dispatch<SetStateAction<boolean>>;
};

function PostHeader({ post, forumid, postid, setDeleteloading }: PostHeaderProps) {
  const navigate = useNavigate();
  const authUserId = useAppSelector((s) => s.auth.user?._id);
  const isLoggedIn = !!authUserId;

  const isOwn = String(authUserId) === String(post?.wby);

  const wby = post?.written?.username ?? "알 수 없음";
  const wbyimg = post?.written?.profileImg?.img_URL;
  const wtime = post?.wtime ? timeAgo(post.wtime) : "";

  return (
    <div className={styles.postdetailHeader}>
      <div className={styles.postdetailProfile}>
        <div className={styles.postdetailProfileImgBox}>
          <img className={styles.postdetailProfileImg} src={wbyimg} alt="profile" />
        </div>
        <div className={styles.postdetailProfileText}>
          <h4>{wby}</h4>
          <time>{wtime}</time>
        </div>
      </div>

      <div className={styles.postdetailRightActions}>
        {isOwn && isLoggedIn && (
          <>
            <button className={styles.postdetailBtn} onClick={() => navigate("edit")}>수정</button>

            <button
              className={styles.postdetailBtn}
              onClick={() => {
                const ok = window.confirm("이 글을 삭제하시겠습니까?");
                if (!ok) return;

                setDeleteloading(true);

                axios
                  .delete("/api/post", { params: { post_id: postid } })
                  .then(() => navigate(`/forum/${forumid}`))
                  .catch((err) => alert(err.response?.data?.message || "삭제 실패"))
                  .finally(() => setDeleteloading(false));
              }}
            >
              삭제
            </button>
          </>
        )}

        {!isOwn && isLoggedIn && (
          <button
            className={styles.postdetailBtn}
            onClick={() => {
              axios
                .post("/api/threads", { post_id: postid })
                .then((res) => navigate(`/message/${res.data.threadId}`))
                .catch((err) => alert(err.response?.data?.message || "쪽지 전송 실패"));
            }}
          >
            쪽지
          </button>
        )}
      </div>
    </div>
  );
}

type CommentItemProps = {
  comment: Comment;
  postid?: string;
  refetch: () => void;
  setDeleteloading: Dispatch<SetStateAction<boolean>>;
};

function CommentItem({ comment, postid, refetch, setDeleteloading }: CommentItemProps) {
  const authUserId = useAppSelector((s) => s.auth.user?._id);
  const isLoggedIn = !!authUserId;
  const isOwn = String(authUserId) === String(comment?.wby);

  const wby = comment?.written?.username ?? "알 수 없음";
  const wbyimg = comment?.isDeleted ? accountImg : comment?.written?.profileImg?.img_URL || accountImg;
  const wtime = comment?.wtime ? timeAgo(comment.wtime) : "";

  return (
    <Card style={{ maxWidth: "2000px", width: "100%", margin: "0 auto", borderRadius: 0 }}>
      <Card.Body>
        {comment.isDeleted ? (
          <>
            <div className={styles.postdetailCommentHeader}>
              <div className={styles.postdetailCommentProfile}>
                <img src={wbyimg} className={styles.postdetailCommentPicture} alt="profile" />
                <h3 className={styles.postdetailCommentText}>(삭제)</h3>
              </div>
            </div>
            <div className={styles.postdetailCommentMainText}>삭제된 댓글입니다.</div>
          </>
        ) : (
          <>
            <div className={styles.postdetailCommentHeader}>
              <div className={styles.postdetailCommentProfile}>
                <img src={wbyimg} className={styles.postdetailCommentPicture} alt="profile" />
                <h3 className={styles.postdetailCommentText}>{wby}</h3>
              </div>

              <div className={styles.postdetailRightActions}>
                {isOwn && isLoggedIn && (
                  <button
                    className={`${styles.postdetailBtn} ${styles.postdetailBtnSm}`}
                    onClick={() => {
                      const ok = window.confirm("이 댓글을 삭제하시겠습니까?");
                      if (!ok) return;

                      setDeleteloading(true);

                      axios
                        .delete("/api/comment", {
                          params: { comment_id: comment._id, postid },
                        })
                        .then(() => refetch())
                        .catch((err) => alert(err.response?.data?.message || "삭제 실패"))
                        .finally(() => setDeleteloading(false));
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
            <div className={styles.postdetailCommentMainText}>{comment?.comment}</div>
            <time className={styles.postdetailCommentText}>{wtime}</time>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

type CommentWriteProps = {
  postid?: string;
  refetch: () => void;
};

function CommentWrite({ postid, refetch }: CommentWriteProps) {
  const navigate = useNavigate();
  const [comment, setComment] = useState("");

  const handleCommentSubmit = () => {
    if (!postid) return alert("잘못된 접근입니다.");
    const value = comment.trim();
    if (!value) return alert("내용을 입력하세요.");

    axios
      .post("/api/writeComment", { parent_id: postid, comment: value })
      .then(() => {
        setComment("");
        refetch();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        if (err.response?.status === 401) navigate("/login");
      });
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
  );
}

function timeAgo(wtime: string | number | Date) {
  const diff = (new Date().getTime() - new Date(wtime).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
