import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import { getErrorMessage } from "../../utils/errorHandler";

function DateRangeField({ label, startValue, endValue, onStartChange, onEndChange, disabled }) {
  return (
    <div className="field mb-4">
      <label className="block text-900 font-medium mb-2">{label}</label>
      <div className="flex align-items-center gap-2">
        <Calendar
          value={startValue}
          onChange={(e) => onStartChange(e.value)}
          dateFormat="dd/mm/yy"
          placeholder="Início"
          className="flex-1"
          inputClassName="w-full"
          disabled={disabled}
          showIcon
          showButtonBar
          showOnFocus
          maxDate={endValue || undefined}
        />
        <span className="text-500 font-medium">→</span>
        <Calendar
          value={endValue}
          onChange={(e) => onEndChange(e.value)}
          dateFormat="dd/mm/yy"
          placeholder="Fim"
          className="flex-1"
          inputClassName="w-full"
          disabled={disabled}
          showIcon
          showButtonBar
          showOnFocus
          minDate={startValue || undefined}
        />
      </div>
    </div>
  );
}

export default function EnrollmentPeriodsForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.period, {});
  const { id } = routeContext;
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

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [datePart] = dateStr.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const toLocalDate = (date) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    if (isEdit) loadPeriod();
  }, [id]);

  const loadPeriod = async () => {
    try {
      setLoading(true);
      const { data } = await repository.periods.getById(id);
      setForm({
        name: data.name || "",
        priority_start_date: parseDate(data.priority_start_date),
        priority_end_date: parseDate(data.priority_end_date),
        start_date: parseDate(data.start_date),
        end_date: parseDate(data.end_date),
      });
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar período"));
    } finally {
      setLoading(false);
    }
  };

  const patch = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = { name: form.name.trim() };
      if (form.priority_start_date) payload.priority_start_date = toLocalDate(form.priority_start_date);
      if (form.priority_end_date)   payload.priority_end_date   = toLocalDate(form.priority_end_date);
      if (form.start_date)          payload.start_date          = toLocalDate(form.start_date);
      if (form.end_date)            payload.end_date             = toLocalDate(form.end_date);

      if (isEdit) {
        await repository.periods.patch(id, payload);
      } else {
        await repository.periods.post(payload);
      }

      navigate("/periods");
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao salvar período"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">
        {isEdit ? "Editar Período de Inscrição" : "Novo Período de Inscrição"}
      </h2>

      {error && <Message severity="error" text={error} className="mb-4 w-full" />}

      <form onSubmit={handleSubmit}>
        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">Nome *</label>
          <InputText
            value={form.name}
            onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setError(""); }}
            className="w-full"
            placeholder="Digite o nome do período"
            disabled={loading}
            required
          />
        </div>

        <DateRangeField
          label="Período Prioritário"
          startValue={form.priority_start_date}
          endValue={form.priority_end_date}
          onStartChange={patch("priority_start_date")}
          onEndChange={patch("priority_end_date")}
          disabled={loading}
        />

        <DateRangeField
          label="Período Geral"
          startValue={form.start_date}
          endValue={form.end_date}
          onStartChange={patch("start_date")}
          onEndChange={patch("end_date")}
          disabled={loading}
        />

        <div className="flex gap-2">
          <Button label="Salvar" icon="pi pi-check" type="submit" loading={loading} disabled={loading} />
          <Button label="Cancelar" icon="pi pi-times" type="button" severity="secondary" onClick={() => navigate("/periods")} disabled={loading} />
        </div>
      </form>
    </div>
  );
}
