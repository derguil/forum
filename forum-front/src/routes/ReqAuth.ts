import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type ReqAuthProps = {
  children: ReactNode;
};

export default function ReqAuth({ children }: ReqAuthProps) {
  const navigate = useNavigate();
  const [ok, setOk] = useState<boolean>(false);

  useEffect(() => {
    let alive:boolean = true; // AbortController()

    axios.get("/api/auth/me")
    .then(() => {
      if (!alive) return;
      setOk(true);
    })
    .catch((err: unknown) => {
      if (!alive) return;
      if (axios.isAxiosError(err) && err.response?.status === 401) {
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
