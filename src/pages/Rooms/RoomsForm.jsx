import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

export default function RoomsForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    service_id: null,
    room_capacity: null,
    has_gurney: false,
    is_active: true,
  });
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
    if (isEdit) loadRoom();
  }, [id]);

  const loadServices = async () => {
    try {
      const { data } = await repository.services.get();
      const list = data.items || data || [];
      setServices(
        list.map((service) => ({ label: service.name, value: service.id })),
      );
    } catch (e) {
      setServices([]);
    }
  };

  const loadRoom = async () => {
    try {
      const { data } = await repository.rooms.getById(id);
      setForm({
        name: data.name || "",
        service_id: data.service_id || null,
        room_capacity: data.room_capacity ?? null,
        has_gurney: data.has_gurney ?? false,
        is_active: data.is_active ?? true,
      });
    } catch (e) {
      setError("Erro ao carregar a sala");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        service_id: form.service_id,
        room_capacity: form.room_capacity,
        has_gurney: form.has_gurney,
        is_active: form.is_active,
      };

      if (isEdit) {
        await repository.rooms.put(id, payload);
      } else {
        await repository.rooms.post(payload);
      }

      navigate("/rooms");
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao salvar a sala");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-3xl">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold">
          {isEdit ? "Editar Sala" : "Nova Sala"}
        </h2>
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() => navigate("/rooms")}
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

        <div className="field col-12 md:col-6">
          <label className="block text-900 font-medium mb-2">
            Campo de Estágio *
          </label>
          <Dropdown
            value={form.service_id}
            options={services}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setForm({ ...form, service_id: e.value })}
            placeholder="Selecione um campo de estágio"
            className="w-full"
            required
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="block text-900 font-medium mb-2">
            Capacidade *
          </label>
          <InputNumber
            value={form.room_capacity}
            onValueChange={(e) => setForm({ ...form, room_capacity: e.value })}
            className="w-full"
            min={1}
          />
        </div>

        <div className="field col-12 md:col-6 flex align-items-center gap-4 pt-4">
          <label className="flex align-items-center gap-2 mb-0">
            <Checkbox
              checked={form.has_gurney}
              onChange={(e) => setForm({ ...form, has_gurney: e.checked })}
            />
            Possui maca
          </label>

          <label className="flex align-items-center gap-2 mb-0">
            <Checkbox
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.checked })}
            />
            Ativo
          </label>
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/rooms")}
          />
          <Button type="submit" label="Salvar" loading={loading} />
        </div>
      </form>
    </div>
  );
}
