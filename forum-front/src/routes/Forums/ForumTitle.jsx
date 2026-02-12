import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const titleStyle = {
  width: "100%",
  // height: "60px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#fff",

  // display: "flex",
  // justifyContent: "space-between",
  // alignItems: "center",

  padding: "12px 16px",
  marginBottom: "12px",
  cursor: "pointer",
};

const titleMainStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  // padding: "12px 16px",
  // marginBottom: "12px",
  // cursor: "pointer",
}

const titleTextStyle = {
  fontSize: "22px",
  fontWeight: 600,
  margin: 0,
};

const titleSmallTextStyle = {
  fontSize: "12px",
  margin: 0,
};

function ForumTitle({ forumid, forumtitle, isLoggedIn, isRankForum }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="wrap" style={titleStyle} onClick={() => navigate(`/forum/${forumid}`)}>
        <div style={titleMainStyle}>
          <h2 style={titleTextStyle}>{forumtitle}</h2>
          {isLoggedIn && !isRankForum && (
            <Button onClick={(e) => {e.stopPropagation(); navigate(`/forum/${forumid}/write`);}}>글 작성</Button>
          )}
        </div>
        {isRankForum && (
            forumid === "6979d19e7302ac81bff9a61b" ?
            <p style={titleSmallTextStyle}>공감 10개를 받으면 HOT 게시물로 자동 선정됩니다.</p> :
            <p style={titleSmallTextStyle}>공감을 100개 이상 받은 게시물 랭킹입니다.</p>
          )
        }
      </div>
    </>
  );
}

export default ForumTitle;