import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

export default function ServiceRoomForm() {
  const serviceRoomContext = getRouteContext(ROUTE_CONTEXT_KEYS.serviceRoom, {});
  const serviceContext = getRouteContext(ROUTE_CONTEXT_KEYS.service, {});
  const id = serviceRoomContext.id;
  const serviceId = serviceRoomContext.serviceId || serviceContext.id || null;
  const isEdit = !!id;
  const [form, setForm] = useState({
    name: "",
    capacity: 0,
    service_id: serviceId || null,
  });
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
      if (isEdit) await repository.serviceRooms.put(id, form);
      else await repository.serviceRooms.post(form);
      navigate(serviceId ? "/services/rooms" : "/service-rooms/edit");
    } catch (e) {}
  };

  return (
    <div className="p-4">
      <h2>
        {isEdit
          ? "Editar Sala do Campo de Estágio"
          : "Nova Sala do Campo de Estágio"}
      </h2>
      <div className="field mb-3">
        <label>Nome</label>
        <InputText
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full"
        />
      </div>
      <Button label="Salvar" onClick={save} />
    </div>
  );
}
