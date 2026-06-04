import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import { repository } from "../../services/repository";

type FormState = {
  name: string;
};

export default function DisciplinesForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.discipline, undefined);
  const id = routeContext?.id;
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) loadDiscipline();
  }, [id, isEdit]);

  const loadDiscipline = async () => {
    if (!id) return;
    
    try {
      const { data } = await repository.disciplines.getById(id as string);
      setForm({
        name: data.name || "",
      });
    } catch (e) {
      setError("Erro ao carregar o disciplina");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: form.name,
      };

      if (isEdit) {
        await repository.disciplines.put(id as string, payload);
      } else {
        await repository.disciplines.post(payload);
      }
      navigate("/disciplines");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao salvar o disciplina");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-3xl">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold">
          {isEdit ? "Editar Disciplina" : "Novo Disciplina"}
        </h2>
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() => navigate("/disciplines")}
        />
      </div>

      {error && <Message severity="error" text={error} className="mb-3" />}

      <form onSubmit={handleSubmit} className="grid">
        <div className="field col-12 md:col-6">
          <label className="block text-900 font-medium mb-2">Nome *</label>
          <InputText
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/disciplines")}
          />
          <Button type="submit" label="Salvar" loading={loading} />
        </div>
      </form>
    </div>
  );
}
