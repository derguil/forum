import { ListGroup, Badge } from "react-bootstrap";

function timeAgo(wtime) {
  const diff = (new Date() - new Date(wtime)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function MessageInbox({ threads, activeId, onSelect }) {
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
          {threads.map((t) => {
            const active = String(t._id) === String(activeId);

            return (
              <ListGroup.Item
                key={String(t._id)}
                action
                onClick={() => onSelect(t._id)}
                className={`inbox-item ${active ? "active" : ""}`}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="me-2 w-100">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="inbox-name">
                        {t.otherUser.username ?? "알 수 없음"}
                      </div>
                      <div className="inbox-time">
                        {timeAgo(t.updatedAt)}
                      </div>
                    </div>

                    <div className="inbox-last">
                      {t.lastMessage ?? "대화를 시작해보세요"}
                    </div>
                  </div>
                
                  {(t.myUnreadCount) > 0 && (
                    <Badge bg="danger" pill>
                      {t.myUnreadCount}
                    </Badge>
                  )}
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
}
