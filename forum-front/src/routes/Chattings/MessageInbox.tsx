import { ListGroup } from "react-bootstrap";
import type { ThreadPreview } from "../../types/api";
import "./MessageInbox.css";

type MessageInboxProps = {
  threads: ThreadPreview[];
  activeThreadId?: string;
  onSelect: (threadId: string) => void;
};

function formatMMDD_HHMM(date: string | number | Date) {
  const d = new Date(date);

  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${MM}/${DD} ${HH}:${mm}`;
}

export default function MessageInbox({ threads, activeThreadId, onSelect }: MessageInboxProps) {
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
            );
          })}
        </ListGroup>
      )}
    </div>
  );
}
