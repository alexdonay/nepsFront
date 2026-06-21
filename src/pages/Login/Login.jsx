import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailInput from "../../components/Email/EmailInput";
import { getCurrentUser, login } from "../../services/auth";
import { normalizePermission } from "../../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await login(email.trim(), password);
      localStorage.setItem("token", data.access_token);

      // Primeiro tenta obter permissão detalhada do endpoint /users/me
      try {
        const token = localStorage.getItem("token");
        const me = await getCurrentUser();
        const user = me.data;
        try {
          // Removed storing user object in localStorage
        } catch {}
        const candidates = [
          user.permission,
          user.perfil,
          user.role,
          user.userType,
          user.type,
        ];

        if (Array.isArray(user.roles)) candidates.push(...user.roles);

        const permission = candidates.map(normalizePermission).find(Boolean);
        if (permission) localStorage.setItem("permission", permission);
        else localStorage.removeItem("permission");
      } catch (err) {
        console.error("/users/me error:", err.response ?? err.message ?? err);
        // fallback para quando /users/me não estiver disponível no login

        // Tentar extrair do token JWT
        let tokenPermission = null;
        try {
          const tokenParts = data.access_token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const tokenCandidates = [
              payload.permission,
              payload.perfil,
              payload.role,
              payload.userType,
              payload.type,
            ];
            if (Array.isArray(payload.roles))
              tokenCandidates.push(...payload.roles);
            tokenPermission = tokenCandidates
              .map(normalizePermission)
              .find(Boolean);
          }
        } catch (e) {}

        const candidates = [
          data.permission,
          data.perfil,
          data.role,
          data.userType,
          data.type,
        ];

        if (Array.isArray(data.roles)) candidates.push(...data.roles);

        const permission =
          tokenPermission || candidates.map(normalizePermission).find(Boolean);
      }

      navigate("/");
    } catch (err) {
      setError("Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-logo">
            <span className="pi pi-chart-bar mr-2" />
            e-NEPS
          </div>
          <div className="auth-sub">Sistema de Gerenciamento de Estágios</div>
          <p style={{ marginTop: "1.25rem", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            Plataforma para gestão de instituições, alunos, campos de estágio e períodos de alocação.
          </p>
          <div style={{ marginTop: "auto", paddingTop: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {["Gestão de períodos", "Alocação por região", "Acompanhamento em tempo real"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)" }}>
                <span className="pi pi-check-circle" style={{ color: "#6ee7b7" }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-form">
          <div className="mb-5">
            <h1 className="text-900 font-semibold text-2xl m-0">Bem-vindo de volta</h1>
            <span className="text-500 text-sm">Acesse sua conta para continuar</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-column gap-4">
            <div className="field m-0">
              <EmailInput value={email} onChange={setEmail} required />
            </div>

            <div className="field m-0">
              <label htmlFor="password" className="block font-medium text-800 mb-2">
                Senha
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                inputClassName="w-full"
                feedback={false}
                toggleMask
                placeholder="Digite sua senha"
              />
            </div>

            {error && <Message severity="error" text={error} className="w-full" />}

            <Button
              type="submit"
              label="Entrar"
              icon="pi pi-sign-in"
              className="w-full"
              loading={loading}
            />

            <div className="text-center">
              <Button
                type="button"
                label="Esqueci minha senha"
                className="p-button-text text-sm"
                onClick={() => navigate("/forgot-password")}
              />
            </div>
          </form>

          <div className="auth-footnote">
            Não tem conta? Contate o administrador.
          </div>
        </div>
      </div>
    </div>
  );
}
