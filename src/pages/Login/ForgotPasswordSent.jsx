import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordSent() {
  const navigate = useNavigate();
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-logo">Verifique seu e-mail</div>
          <div className="auth-sub">Confira o link enviado para continuar.</div>
        </div>

        <div className="auth-form text-center">
          <h2 className="text-900">Verifique seu e-mail</h2>
          <p className="text-500">Se um usuário com esse e-mail existir, enviamos instruções para redefinir a senha.</p>
          <div className="mt-4">
            <Button label="Ir para login" onClick={() => navigate('/login')} className="p-button-outlined" />
          </div>
        </div>
      </div>
    </div>
  );
}
