import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { confirmReset } from "../../services/auth";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const params = useParams();
  const hash = params.hash || query.get("hash") || query.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!hash) {
      setError("Link inválido. Verifique o e-mail de recuperação.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await confirmReset(hash, password);
      navigate("/login", { replace: true });
    } catch (err) {
      setError("Erro ao redefinir a senha. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-logo">Redefinir senha</div>
          <div className="auth-sub">Defina uma nova senha segura para sua conta.</div>
        </div>

        <div className="auth-form">
          <div className="text-center mb-4">
            <h1 className="text-900 font-medium text-2xl">Redefinir senha</h1>
            <span className="text-500">Informe a nova senha e confirme abaixo.</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field mb-3">
              <label className="block text-900 font-medium mb-2">Nova senha</label>
              <Password value={password} onChange={(e) => setPassword(e.target.value)} toggleMask feedback={false} className="w-full" />
            </div>

            <div className="field mb-3">
              <label className="block text-900 font-medium mb-2">Confirmar senha</label>
              <Password value={confirm} onChange={(e) => setConfirm(e.target.value)} toggleMask feedback={false} className="w-full" />
            </div>

            <Button type="submit" label="Redefinir senha" className="w-full" loading={loading} />
          </form>

          {error && <Message severity="error" text={error} className="mt-3" />}
        </div>
      </div>
    </div>
  );
}
