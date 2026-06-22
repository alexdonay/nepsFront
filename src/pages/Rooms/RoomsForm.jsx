import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import api from "../../services/api";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import { getErrorMessage } from "../../utils/errorHandler";
import { getCurrentPermission, getCurrentUser } from "../../utils/auth";

export default function RoomsForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.room, {});
  const id = routeContext.id;
  const isEdit = !!id;
  const navigate = useNavigate();

  const user = getCurrentUser();
  const isAdmin = getCurrentPermission() === PERMISSIONS.ADMIN;
  const defaultInternshipId = user?.internship_id || user?.education_institute_id || null;

  const [form, setForm] = useState({
    name: "",
    internships_id: defaultInternshipId,
    room_capacity: null,
    has_gurney: false,
    is_active: true,
  });
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      repository.internships.get({ per_page: 500 }).then(({ data }) => {
        const items = data?.items || data || [];
        setInternships(items);
      }).catch(() => {});
    }
    if (isEdit) loadRoom();
  }, [id]);

  const loadRoom = async () => {
    try {
      const { data } = await repository.rooms.getById(id);
      setForm({
        name: data.name || "",
        internships_id: data.internships_id || defaultInternshipId,
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

    const payload = {
      name: form.name,
      // Use internship_id from JWT if available, otherwise from form
      internship_id: form.internships_id ?? user?.internship_id ?? null,
      room_capacity: form.room_capacity,
      has_gurney: form.has_gurney,
      is_active: form.is_active,
    };

    try {
      if (isEdit) {
        // Atualiza usando repository (envia JSON)
        await repository.rooms.put(id, payload);
      } else {
        // Cria usando instância Axios para garantir JSON
        await api.post("/v1/rooms", payload);
      }

      navigate("/rooms");
    } catch (err) {
      // Exibir mensagem detalhada se disponível
      const detail = err?.response?.data?.detail || err?.message;
      setError(detail ? `Erro ao salvar a sala: ${detail}` : getErrorMessage(err, "Erro ao salvar a sala"));
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

        {isAdmin && (
          <div className="field col-12 md:col-6">
            <label className="block text-900 font-medium mb-2">Campo de Estágio *</label>
            <Dropdown
              value={form.internships_id}
              options={internships.map((i) => ({ label: i.name, value: i.id }))}
              onChange={(e) => setForm({ ...form, internships_id: e.value })}
              placeholder="Selecione um campo de estágio"
              className="w-full"
              filter
              required
            />
          </div>
        )}

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
