import { ListGroup, Badge } from "react-bootstrap";
import './MessageInbox.css'

function formatMMDD_HHMM(date) {
  const d = new Date(date);

  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${MM}/${DD} ${HH}:${mm}`;
}

export default function MessageInbox({ threads, activeThreadId, onSelect }) {
  const isEmpty = !threads || threads.length === 0;
  return (
    <div className="inbox-wrap">
      {isEmpty ? (
        <div className="p-4 text-center text-muted">
          아직 대화가 없습니다.<br />
          게시글에서 쪽지를 보내보세요.
        </div>
      ) : (
        <ListGroup variant="flush">
          {threads.map((t, idx) => {
            const active = String(t._id) === String(activeThreadId);

            return (
              // <ListGroup.Item
              //   key={idx}
              //   action
              //   onClick={() => onSelect(t._id)}
              //   // className={`inbox-item ${active ? "active" : ""}`}
              // >
              <div className={`thread ${active ? "active" : ""}`} key={idx} onClick={() => onSelect(t._id)}>
                <div className="thread-main">
                  <div className="thread-top">
                    <div className="thread-name">{t.otherUser.username}</div>
                    <div className="thread-time">{formatMMDD_HHMM(t.updatedAt)}</div>
                  </div>
                  <div className="thread-last">{t.lastMessage ?? "대화를 시작해보세요"}</div>
                </div>
                {t.myUnreadCount > 0 && <div className="badge">{t.myUnreadCount}</div>}
              </div>
              // </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
}
