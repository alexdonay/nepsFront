import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import { getErrorMessage } from "../../utils/errorHandler";

const DAYS = [
  { label: "Domingo", value: 0 },
  { label: "Segunda", value: 1 },
  { label: "Terça", value: 2 },
  { label: "Quarta", value: 3 },
  { label: "Quinta", value: 4 },
  { label: "Sexta", value: 5 },
  { label: "Sábado", value: 6 },
];

export default function ServiceScheduleForm() {
  const location = useLocation();
  const scheduleContext = getRouteContext(ROUTE_CONTEXT_KEYS.schedule, {});
  const id = scheduleContext.id;
  const roomId = scheduleContext.roomId;
  const isEdit = !!id;
  const isRoomContext = location.pathname.startsWith("/rooms/");
  const [form, setForm] = useState({
    week_day: 1,
    start: "09:00",
    end: "17:00",
    room_id: roomId || null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit)
      repository.serviceSchedules
        .getById(id)
        .then((r) => setForm(r.data))
        .catch(() => {});
  }, [id]);

  const save = async () => {
    try {
      setError("");
      setLoading(true);
      if (isEdit) await repository.serviceSchedules.put(id, form);
      else await repository.serviceSchedules.post(form);
      navigate(isRoomContext ? "/rooms/schedules" : "/service-rooms/schedules");
    } catch (e) {
      setError(getErrorMessage(e, "Erro ao salvar horário"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>
        {isEdit
          ? "Editar Horário do Campo de Estágio"
          : "Novo Horário do Campo de Estágio"}
      </h2>
      {error && <Message severity="error" text={error} className="mb-3" />}
      <div className="field mb-3">
        <label>Dia</label>
        <Dropdown
          value={form.week_day}
          options={DAYS}
          optionLabel="label"
          optionValue="value"
          onChange={(e) => setForm({ ...form, week_day: e.value })}
          disabled={loading}
        />
      </div>
      <div className="field mb-3">
        <label>Início</label>
        <InputText
          value={form.start}
          onChange={(e) => setForm({ ...form, start: e.target.value })}
          disabled={loading}
        />
      </div>
      <div className="field mb-3">
        <label>Fim</label>
        <InputText
          value={form.end}
          onChange={(e) => setForm({ ...form, end: e.target.value })}
          disabled={loading}
        />
      </div>
      <Button label="Salvar" onClick={save} loading={loading} />
    </div>
  );
}
