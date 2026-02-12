import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type ReqAuthProps = {
  children: ReactNode;
};

type MeResponse = {
  success: boolean;
  message: string;
};

export default function ReqAuth({ children }: ReqAuthProps) {
  const navigate = useNavigate();
  const [ok, setOk] = useState<boolean>(false);

  useEffect(() => {
    let alive = true; // AbortController()

    const checkAuth = async (): Promise<void> => {
      try {
        const res = await axios.get<MeResponse>("/api/auth/me");
        if (!alive) return;

        if (res.data.success === false) {
          alert(res.data.message || "인증 실패");
          navigate("/login", { replace: true });
          return;
        }

        setOk(true);
      } catch (err: unknown) {
        if (!alive) return;

        if (axios.isAxiosError(err)) {
          const message =
            typeof err.response?.data?.message === "string"
              ? err.response.data.message
              : "인증 실패";
          alert(message);
        } else {
          alert("인증 실패");
        }

        navigate("/login", { replace: true });
      }
    };

    void checkAuth();

    return () => {
      alive = false;
    };
  }, [navigate]);

  if (!ok) return null;

  return children;
}
