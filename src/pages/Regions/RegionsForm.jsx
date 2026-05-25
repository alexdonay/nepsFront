import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

export default function RegionsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", is_active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!id && id !== "new";

  useEffect(() => {
    if (isEdit) {
      loadRegion();
    }
  }, [id]);

  const loadRegion = async () => {
    try {
      setLoading(true);
      const { data } = await repository.regions.getById(id);
      setForm({ name: data.name, is_active: data.is_active ?? true });
    } catch (err) {
      setError("Erro ao carregar região");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      const payload = { name: form.name, is_active: form.is_active };

      if (isEdit) {
        await repository.regions.put(id, payload);
      } else {
        await repository.regions.post(payload);
      }

      navigate("/regions");
    } catch (err) {
      setError("Erro ao salvar região");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">
        {isEdit ? "Editar Região" : "Nova Região"}
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 border-round">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">Nome *</label>
          <InputText
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              setError("");
            }}
            className="w-full"
            placeholder="Digite o nome da região"
            disabled={loading}
          />
        </div>

        <div className="field mb-4">
          <label className="flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              disabled={loading}
            />
            Ativo
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            label="Salvar"
            icon="pi pi-check"
            type="submit"
            loading={loading}
            disabled={loading}
          />
          <Button
            label="Cancelar"
            icon="pi pi-times"
            type="button"
            severity="secondary"
            onClick={() => navigate("/regions")}
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
}
