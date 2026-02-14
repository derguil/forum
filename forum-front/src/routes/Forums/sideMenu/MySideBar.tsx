import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { socket } from "../../../socket";
import axios from "axios";
import styles from "./MySideBar.module.css";
import { useAppSelector } from "../../../store/Hooks";

export default function MySideBar() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    axios
      .post("/api/auth/logout")
      .then((res) => {
        socket.disconnect();
        console.log("msg:", res.data);
        alert("로그아웃 성공");
        navigate("/login");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  if (!user) return null;

  return (
    <aside className={styles.wrap}>
      <div className={styles.profileCard}>
        <div className={styles.avatarBox}>
          <div className={styles.smImgBox}>
            <img className={styles.smImg} src={user.profileImg?.img_URL} alt="profile" />
          </div>
        </div>

        <div className={styles.profileText}>
          <div className={styles.nick}>{user.username}</div>
          <div className={styles.handle}>{user.email}</div>
        </div>

        <div className={styles.profileActions}>
          <Button
            variant="light"
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              navigate("/mypage");
            }}
          >
            내 정보
          </Button>

          <Button
            variant="light"
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
          >
            로그아웃
          </Button>
        </div>
      </div>

      <nav className={styles.menu}>
        <Link className={styles.menuItem} to="/forum/my/posts">
          <span className={`${styles.icon} ${styles.iconList}`} aria-hidden />
          <span className={styles.menuText}>내가 쓴 글</span>
        </Link>

        <Link className={styles.menuItem} to="/forum/my/comments">
          <span className={`${styles.icon} ${styles.iconChat}`} aria-hidden />
          <span className={styles.menuText}>댓글 단 글</span>
        </Link>

        <Link className={styles.menuItem} to="/forum/my/scraps">
          <span className={`${styles.icon} ${styles.iconStar}`} aria-hidden />
          <span className={styles.menuText}>내 스크랩</span>
        </Link>
      </nav>
    </aside>
  );
}
