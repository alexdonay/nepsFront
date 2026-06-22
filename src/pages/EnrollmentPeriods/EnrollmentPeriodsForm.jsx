import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import { getErrorMessage } from "../../utils/errorHandler";

export default function EnrollmentPeriodsForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.period, {});
  const { id } = routeContext;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [priorityRange, setPriorityRange] = useState([null, null]);
  const [generalRange, setGeneralRange] = useState([null, null]);

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
      setName(data.name || "");
      setPriorityRange([
        parseDate(data.priority_start_date),
        parseDate(data.priority_end_date),
      ]);
      setGeneralRange([
        parseDate(data.start_date),
        parseDate(data.end_date),
      ]);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar período"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = { name: name.trim() };

      if (priorityRange[0]) payload.priority_start_date = toLocalDate(priorityRange[0]);
      if (priorityRange[1]) payload.priority_end_date   = toLocalDate(priorityRange[1]);
      if (generalRange[0])  payload.start_date          = toLocalDate(generalRange[0]);
      if (generalRange[1])  payload.end_date             = toLocalDate(generalRange[1]);

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
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            className="w-full"
            placeholder="Digite o nome do período"
            disabled={loading}
            required
          />
        </div>

        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">
            Período Prioritário (início — fim)
          </label>
          <Calendar
            value={priorityRange}
            onChange={(e) => setPriorityRange(e.value ?? [null, null])}
            selectionMode="range"
            dateFormat="dd/mm/yy"
            className="w-full"
            inputClassName="w-full"
            disabled={loading}
            showIcon
            showButtonBar
            placeholder="DD/MM/AAAA — DD/MM/AAAA"
            numberOfMonths={2}
          />
        </div>

        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">
            Período Geral (início — fim)
          </label>
          <Calendar
            value={generalRange}
            onChange={(e) => setGeneralRange(e.value ?? [null, null])}
            selectionMode="range"
            dateFormat="dd/mm/yy"
            className="w-full"
            inputClassName="w-full"
            disabled={loading}
            showIcon
            showButtonBar
            placeholder="DD/MM/AAAA — DD/MM/AAAA"
            numberOfMonths={2}
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
