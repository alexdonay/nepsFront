import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import { getErrorMessage } from "../../utils/errorHandler";

export default function ServiceRoomForm() {
  const serviceRoomContext = getRouteContext(ROUTE_CONTEXT_KEYS.serviceRoom, {});
  const serviceContext = getRouteContext(ROUTE_CONTEXT_KEYS.service, {});
  const id = serviceRoomContext.id;
  const serviceId = serviceRoomContext.serviceId || serviceContext.id || null;
  const isEdit = !!id;
  const [form, setForm] = useState({
    name: "",
    capacity: 0,
    internship_id: serviceId || null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit)
      repository.serviceRooms
        .getById(id)
        .then((r) => setForm(r.data))
        .catch(() => {});
  }, [id]);

  const save = async () => {
    try {
      setError("");
      setLoading(true);
      if (isEdit) await repository.serviceRooms.put(id, form);
      else await repository.serviceRooms.post(form);
      navigate(serviceId ? "/internships/rooms" : "/service-rooms/edit");
    } catch (e) {
      setError(getErrorMessage(e, "Erro ao salvar sala"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>
        {isEdit
          ? "Editar Sala do Campo de Estágio"
          : "Nova Sala do Campo de Estágio"}
      </h2>
      {error && <Message severity="error" text={error} className="mb-3" />}
      <div className="field mb-3">
        <label>Nome</label>
        <InputText
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full"
          disabled={loading}
        />
      </div>
      <Button label="Salvar" onClick={save} loading={loading} />
    </div>
  );
}
