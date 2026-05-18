import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

export default function ServiceRoomForm() {
  const { id, serviceId } = useParams();
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
      navigate(serviceId ? `/services/${serviceId}/rooms` : "/service-rooms");
    } catch (e) {}
  };

  return (
    <div className="p-4">
      <h2>{isEdit ? "Editar Sala" : "Nova Sala"}</h2>
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
