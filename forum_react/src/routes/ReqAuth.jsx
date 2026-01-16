import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ReqAuth({ children }) {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true; //AbortController()

    axios.get("/api/auth/me")
    .then(() => {
      if (!alive) return;
      setOk(true);
    })
    .catch((err) => {
      if (!alive) return;
      if (err.response?.status === 401) {
        alert(err.response?.data?.message || "작성 중 오류 발생");
        navigate("/login", { replace: true });
        return;
      }
      navigate("/login", { replace: true });
    });
    return () => {
      alive = false;
    };
  }, [navigate]);

  if (!ok) return null;

  return children;
}
