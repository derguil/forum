import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, Outlet, Navigate } from 'react-router-dom'
import { Button, Container, Nav, Navbar, Row, Col, ListGroup, NavDropdown, Modal, InputGroup, Form  }  from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from "react-redux";
import styles from "./SidePostsBar.module.css";

export default function SidePostsBar(){

  const [trendPosts, setTrendPosts] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currPage = 1;
  const limit = 4;

  useEffect(() => {
    setLoading(true);

    Promise.all([
      axios.get("/api/reqHotPosts", {
        params: { currPage, limit }
      }),
      axios.get("/api/reqTrendPosts")
    ])
      .then(([hotRes, trendRes]) => {
        setHotPosts(hotRes.data.posts);
        setTrendPosts(trendRes.data.trendposts);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  return(
    <div className={styles.HotboardWrap}>
      <div className={styles.Hotboard}>
        <h3 className={styles.article}>
          <div className={styles.titleNoCur}>
            실시간 인기 글(공감 10개 이상 + 실시간 좋아요 증가량(1시간미다 집계))
          </div>
        </h3>
        {
          trendPosts.map((post)=>{  
            return(
              <BigList key={post._id} post={post}/>
            )
          })
        }
      </div>
      <div className={styles.Hotboard}>
        <Link to="/forum/6979d19e7302ac81bff9a61b" className={styles.article}>
          <h3 className={styles.title}>
            HOT 게시물 (공감 10개 이상, 1주일 저장)
          </h3>
          <span>더 보기</span>
        </Link>
        {
          hotPosts.slice(0, 4).map((post)=>{  
            return(
              <List key={post._id} post={post}/>
            )
          })
        }
      </div>

      <div className={styles.Hotboard}>
        <Link to={`/forum/6979d1a87302ac81bff9a61c`} className={styles.article}>
          <h3 className={styles.title}>
            BEST 게시판(공감 100개 이상, 영구 저장)
          </h3>
          <span>더 보기</span>
        </Link>
      </div>
    </div>
  )
}

function List({post}){
  return(
    <a className={styles.listlink} href={`/forum/${post.parent_id}/${post._id}`}>
      <p className={styles.title}>{post.title}</p>
      <time>{formatMMDD_HHMM(post.wtime)}</time>
    </a>
  )
}

function BigList({post}){
  return(
    <a className={styles.biglistlink} href={`/forum/${post.parent_id}/${post._id}`}>
      <p className={styles.title}>{post.title}</p>
      <p className={styles.small}>{post.content.replace(/\r\n|\r|\n/g, '\n').replace(/\n+/g, '\n').trim()}</p>
      <div className={styles.biglistmeta}>
        <h4>{post.forum.title}</h4>

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
      </div>
    </a>
  )
}

function formatMMDD_HHMM(date) {
  const d = new Date(date);

  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${MM}/${DD} ${HH}:${mm}`;
}