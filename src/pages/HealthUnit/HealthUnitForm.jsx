import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PhoneInput from "../../components/PhoneInput";
import { repository } from "../../services/repository";

export default function HealthUnitForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    cnes: "",
    address: "",
    phone: "",
    responsible_name: "",
    responsible_contact: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadUnit();
  }, [id]);

  const loadUnit = async () => {
    try {
      const { data } = await repository.healthUnits.getById(id);
      setForm(data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (id) await repository.healthUnits.put(id, form);
      else await repository.healthUnits.post(form);
      navigate("/units");
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
        {id ? "Editar" : "Nova"} Serviço
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
          <label>CNES</label>
          <InputText
            value={form.cnes}
            onChange={updateField("cnes")}
            className="w-full"
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

        <PhoneInput
          value={form.phone}
          onChange={updateField("phone")}
          label="Telefone"
        />

        <div className="field mb-3">
          <label>Responsável</label>
          <InputText
            value={form.responsible_name}
            onChange={updateField("responsible_name")}
            className="w-full"
          />
        </div>

        <PhoneInput
          value={form.responsible_contact}
          onChange={updateField("responsible_contact")}
          label="Contato Responsável"
        />

        <div className="flex gap-2">
          <Button type="submit" label="Salvar" loading={loading} />
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/units")}
          />
        </div>
      </form>
    </div>
  );
}
