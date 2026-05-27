import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

export default function EnrollmentPeriodsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    priority_start_date: null,
    priority_end_date: null,
    start_date: null,
    end_date: null,
  });

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadPeriod();
    }
  }, [id]);

  const loadPeriod = async () => {
    try {
      setLoading(true);
      const { data } = await repository.periods.getById(id);
      setForm({
        name: data.name || "",
        priority_start_date: data.priority_start_date ? new Date(data.priority_start_date) : null,
        priority_end_date: data.priority_end_date ? new Date(data.priority_end_date) : null,
        start_date: data.start_date ? new Date(data.start_date) : null,
        end_date: data.end_date ? new Date(data.end_date) : null,
      });
    } catch (err) {
      setError("Erro ao carregar período");
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
      const payload = {
        name: form.name,
        priority_start_date: form.priority_start_date
          ?.toISOString()
          .split("T")[0],
        priority_end_date: form.priority_end_date?.toISOString().split("T")[0],
        start_date: form.start_date?.toISOString().split("T")[0],
        end_date: form.end_date?.toISOString().split("T")[0],
      };

      if (isEdit) {
        await repository.periods.patch(id, payload);
      } else {
        await repository.periods.post(payload);
      }

      navigate("/periods");
    } catch (err) {
      setError("Erro ao salvar período");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">
        {isEdit ? "Editar Período de Inscrição" : "Novo Período de Inscrição"}
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 border-round">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">Nome *</label>
          <input
            type="text"
            value={form.name || ""}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              setError("");
            }}
            className="w-full p-2 border-1 surface-border border-round"
            placeholder="Digite o nome do período"
            disabled={loading}
            required
          />
        </div>

        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">Data Início Entidades Prioritárias</label>
          <Calendar
            value={form.priority_start_date}
            onChange={(e) => setForm({ ...form, priority_start_date: e.value })}
            dateFormat="dd/mm/yy"
            className="w-full"
            disabled={loading}
            showIcon
          />
        </div>

        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">Data Fim Entidades Prioritárias</label>
          <Calendar
            value={form.priority_end_date}
            onChange={(e) => setForm({ ...form, priority_end_date: e.value })}
            dateFormat="dd/mm/yy"
            className="w-full"
            disabled={loading}
            showIcon
          />
        </div>

        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">Data Início Demais Entidades</label>
          <Calendar
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.value })}
            dateFormat="dd/mm/yy"
            className="w-full"
            disabled={loading}
            showIcon
          />
        </div>

        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">Data Fim Demais Entidades</label>
          <Calendar
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.value })}
            dateFormat="dd/mm/yy"
            className="w-full"
            disabled={loading}
            showIcon
          />
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
            onClick={() => navigate("/periods")}
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
}