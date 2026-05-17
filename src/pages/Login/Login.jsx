import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import EmailInput from "../../components/Email/EmailInput";

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
          <div className="auth-logo">e-NEPS</div>
          <div className="auth-sub">Gerenciamento de Estágios e Acompanhamento</div>
          <p style={{ marginTop: 12, lineHeight: 1.4 }}>
            Painel administrativo para gestão de instituições, alunos e estágios.
          </p>
        </div>

        <div className="auth-form">
          <div className="text-center mb-4">
            <h1 className="text-900 font-medium text-2xl">Entrar</h1>
            <span className="text-500">Acesse sua conta para continuar</span>
          </div>

          <form onSubmit={handleSubmit}>
            <EmailInput value={email} onChange={setEmail} required />

            <div className="field mb-3">
              <label htmlFor="password" className="block text-900 font-medium mb-2">
                Senha
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                feedback={false}
                toggleMask
              />
            </div>

            <Button type="submit" label="Entrar" className="w-full mb-3" loading={loading} />

            <div className="flex align-items-center justify-content-center mb-3">
              <Button type="button" label="Recuperar senha" className="p-button-text" onClick={() => navigate("/forgot-password")} />
            </div>
          </form>

          {error && <Message severity="error" text={error} className="mt-3" />}

          <div className="auth-footnote">Não tem conta? Contate o administrador para criação de usuário.</div>
        </div>
      </div>
    </div>
  );
}
