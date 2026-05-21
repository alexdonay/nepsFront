import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmailInput from "../components/Email/EmailInput";
import api from "../services/api";
import { normalizeCNPJ } from "../services/utils";

export default function InstitutionForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadInstitution();
  }, [id]);

  const loadInstitution = async () => {
    try {
      const { data } = await api.get(`/cadastros/institutions/${id}`);
      setForm(data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!normalizeCNPJ(form.cnpj)) {
      setError("O CNPJ da instituição é obrigatório.");
      setLoading(false);
      return;
    }
    if (!form.email.trim()) {
      setError("O e-mail da instituição é obrigatório.");
      setLoading(false);
      return;
    }
    try {
      if (id) await api.put(`/cadastros/institutions/${id}`, form);
      else await api.post("/cadastros/institutions", form);
      navigate("/institutions");
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">
        {id ? "Editar" : "Nova"} Instituição
      </h2>

      {error && <Message severity="error" text={error} className="mb-3" />}

      <form onSubmit={handleSubmit}>
        <div className="field mb-3">
          <label>Nome *</label>
          <InputText
            value={form.name}
            onChange={updateField("name")}
            className="w-full"
            required
          />
        </div>

        <div className="field mb-3">
          <label>CNPJ</label>
          <InputText
            value={form.cnpj}
            onChange={updateField("cnpj")}
            className="w-full"
            required
          />
        </div>

        <div className="field mb-3">
          <label>Endereço</label>
          <InputText
            value={form.address}
            onChange={updateField("address")}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label>Telefone</label>
          <InputText
            value={form.phone}
            onChange={updateField("phone")}
            className="w-full"
          />
        </div>

        <EmailInput
          value={form.email}
          onChange={(value) => setForm({ ...form, email: value })}
          required
        />

        <div className="flex gap-2">
          <Button type="submit" label="Salvar" loading={loading} />
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/institutions")}
          />
        </div>
      </form>
    </div>
  );
}
