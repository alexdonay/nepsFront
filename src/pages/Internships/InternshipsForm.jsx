import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { getErrorMessage } from "../../utils/errorHandler";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

export default function ServiceForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.service, {});
  const id = routeContext.id;
  const isEdit = !!id;
  const [form, setForm] = useState({
    name: "",
    region_id: null,
    is_active: true,
    user_email: "",
  });
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadRegions();
    if (isEdit) {
      setDataLoading(true);
      repository.internships
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
        .catch((e) => {
          setError(getErrorMessage(e, "Erro ao carregar campo de estágio"));
        })
        .finally(() => setDataLoading(false));
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
    setError("");
    try {
      const payload = {
        name: form.name,
        region_id: form.region_id,
        is_active: form.is_active,
        user_email: form.user_email || null,
      };
      if (isEdit) {
        await repository.internships.put(id, payload);
      } else {
        await repository.internships.post(payload);
      }
      navigate("/internships");
    } catch (e) {
      setError(getErrorMessage(e, "Erro ao salvar campo de estágio"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "Editar Campo de Estágio" : "Novo Campo de Estágio"}
      </h2>

      {error && <Message severity="error" text={error} className="mb-4" />}

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
          <label className="block text-900 font-medium mb-2">Território</label>
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
            onClick={() => navigate("/internships")}
          />
        </div>
      </form>
    </div>
  );
}
