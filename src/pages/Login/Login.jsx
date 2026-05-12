import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";

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
    <div className="flex align-items-center justify-content-center min-h-screen">
      <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
        <div className="text-center mb-4">
          <h1 className="text-900 font-medium text-3xl">e-NEPS</h1>
          <span className="text-500">Gerenciamento de Estágios</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field mb-3">
            <label htmlFor="email" className="block text-900 font-medium mb-2">
              Email
            </label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="field mb-3">
            <label
              htmlFor="password"
              className="block text-900 font-medium mb-2"
            >
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

          <Button
            type="submit"
            label="Entrar"
            className="w-full"
            loading={loading}
          />
        </form>

        {error && <Message severity="error" text={error} className="mt-3" />}
      </div>
    </div>
  );
}
