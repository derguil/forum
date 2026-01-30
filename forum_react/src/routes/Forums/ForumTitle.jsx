import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const titleStyle = {
  width: "100%",
  height: "60px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#fff",

  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  padding: "12px 16px",
  marginBottom: "12px",
  cursor: "pointer",
};

const titleTextStyle = {
  fontSize: "22px",
  fontWeight: 600,
  margin: 0,
};

function ForumTitle({ forumid, forumtitle, isLoggedIn, isRankForum }) {
  const navigate = useNavigate();

  return (
    <div className="wrap" style={titleStyle} onClick={() => navigate(`/forum/${forumid}`)}>
      <h2 style={titleTextStyle}>{forumtitle}</h2>
      {isLoggedIn && !isRankForum && (
        <Button onClick={(e) => {e.stopPropagation(); navigate(`/forum/${forumid}/write`);}}>글 작성</Button>
      )}
    </div>
  );
}

export default ForumTitle;
