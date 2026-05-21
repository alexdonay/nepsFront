import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailInput from "../../components/Email/EmailInput";
import { resetPassword } from "../../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword(email.trim());
      navigate("/forgot-password/sent");
    } catch (err) {
      console.error("Erro ao enviar solicitação de recuperação:", err);
      setError("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-logo">Recuperação de senha</div>
          <div className="auth-sub">
            Receba um link para redefinir sua senha.
          </div>
        </div>

        <div className="auth-form">
          <div className="text-center mb-4">
            <h1 className="text-900 font-medium text-2xl">Recuperar senha</h1>
            <span className="text-500">
              Informe seu e-mail para receber instruções.
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <EmailInput value={email} onChange={setEmail} required />

            <Button
              type="submit"
              label="Enviar instruções"
              className="w-full mt-3"
              loading={loading}
            />
          </form>

          {error && <Message severity="error" text={error} className="mt-3" />}

          <div className="mt-4 text-center">
            <Button
              type="button"
              label="Voltar ao login"
              className="p-button-text"
              onClick={() => navigate("/login")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
