import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState({
    name: "",
    region_id: null,
    is_active: true,
    user_email: "",
  });
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRegions();
    if (isEdit) {
      repository.services
        .getById(id)
        .then((r) => {
          const data = r.data;
          setForm({
            name: data.name || "",
            region_id: data.region_id || null,
            is_active: data.is_active ?? true,
            user_email: data.email || data.user_email || "",
          });
        })
        .catch(() => {});
    }
  }, [id]);

  const loadRegions = async () => {
    try {
      const { data } = await repository.regions.get();
      const regionsList = data.items || data;
      setRegions(regionsList.map((r) => ({ label: r.name, value: r.id })));
    } catch (e) {
      setRegions([]);
    }
  };

  const save = async () => {
    if (!form.name) {
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        region_id: form.region_id,
        is_active: form.is_active,
        user_email: form.user_email || null,
      };
      if (isEdit) {
        await repository.services.put(id, payload);
      } else {
        await repository.services.post(payload);
      }
      navigate("/services");
    } catch (e) {
      const msg = e.response?.data?.detail || "Erro ao salvar";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "Editar Serviço" : "Novo Serviço"}
      </h2>

      <form
        autoComplete="new-password"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="field mb-3">
          <label className="block text-900 font-medium mb-2">Nome *</label>
          <InputText
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
            autoComplete="new-password"
            name="service_name"
          />
        </div>

        <div className="field mb-3">
          <label className="block text-900 font-medium mb-2">Região</label>
          <Dropdown
            value={form.region_id}
            options={regions}
            onChange={(e) => setForm({ ...form, region_id: e.value })}
            placeholder="Selecione uma região"
            className="w-full"
            showClear
          />
        </div>

        <div className="field mb-3">
          <label className="block text-900 font-medium mb-2">
            Email do Responsável
          </label>
          <InputText
            value={form.user_email}
            onChange={(e) => setForm({ ...form, user_email: e.target.value })}
            className="w-full"
            placeholder="email@exemplo.com"
            autoComplete="new-password"
            name="service_user_email"
          />
        </div>

        <div className="field mb-3">
          <label className="flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Ativo
          </label>
        </div>

        <div className="flex gap-2">
          <Button label="Salvar" type="submit" loading={loading} />
          <Button
            label="Cancelar"
            type="button"
            className="p-button-secondary"
            onClick={() => navigate("/services")}
          />
        </div>
      </form>
    </div>
  );
}
