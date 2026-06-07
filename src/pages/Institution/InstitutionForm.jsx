import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { TabPanel, TabView } from "primereact/tabview";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CNPJInput from "../../components/CNPJInput";
import EmailInput from "../../components/Email/EmailInput";
import PhoneInput from "../../components/PhoneInput";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import { getErrorMessage } from "../../utils/errorHandler";

export default function InstitutionForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.institution, {});
  const id = routeContext.id;
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
    is_active: true,
    priority: 1,
    region_ids: [],
  });
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRegions();
    if (id) loadInstitution();
  }, [id]);

  const loadRegions = async () => {
    try {
      const { data } = await repository.regions.get();
      const items = data?.items || data || [];
      setRegions(Array.isArray(items) ? items : []);
    } catch (e) {
      setRegions([]);
    }
  };

  const loadInstitution = async () => {
    try {
      console.log("Carregando instituição com ID:", id, "Tipo:", typeof id);
      const { data } = await repository.institutions.getById(id);
      console.log("Resposta da API:", data);
      
      const normalized = {
        name: data?.name ?? "",
        cnpj: data?.cnpj ?? "",
        address: data?.address ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        is_active: data?.is_active ?? true,
        priority: data?.priority ?? 1,
        region_ids: (data?.regions || []).map((region) => region.id),
      };

      setForm(normalized);
    } catch (e) {
      console.error("Erro ao carregar instituição:", e);
      setError("Erro ao carregar instituição");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (id) await repository.institutions.put(id, form);
      else await repository.institutions.post(form);
      navigate("/institutions");
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao salvar"));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">
        {id ? "Editar" : "Nova"} Instituição
      </h2>

      {error && <Message severity="error" text={error} className="mb-3" />}

      <form onSubmit={handleSubmit}>
        <TabView
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        >
          <TabPanel header="Dados Gerais">
            <div className="field mb-3">
              <label>Nome *</label>
              <InputText
                value={form.name}
                onChange={updateField("name")}
                className="w-full"
                required
              />
            </div>

            <CNPJInput
              value={form.cnpj}
              onChange={updateField("cnpj")}
              label="CNPJ"
            />

            <div className="field mb-3">
              <label>Endereço</label>
              <InputText
                value={form.address}
                onChange={updateField("address")}
                className="w-full"
              />
            </div>

            <PhoneInput
              value={form.phone}
              onChange={updateField("phone")}
              label="Telefone"
            />

            <EmailInput
              label="Email"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
            />

            <div className="field mb-3 flex align-items-center gap-2">
              <Checkbox
                inputId="institution-status"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.checked })}
              />
              <label htmlFor="institution-status" className="cursor-pointer">
                Instituição ativa
              </label>
            </div>

            <div className="field mb-3">
              <label>Prioridade</label>
              <Dropdown
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.value })}
                options={[
                  { label: "Prioritário", value: 0 },
                  { label: "Não prioritário", value: 1 },
                ]}
                className="w-full"
              />
            </div>
          </TabPanel>

          <TabPanel header="Regiões">
            <div className="field mb-3">
              <label>Regiões vinculadas</label>
              <MultiSelect
                value={form.region_ids}
                options={regions}
                optionLabel="name"
                optionValue="id"
                onChange={(e) =>
                  setForm({ ...form, region_ids: e.value || [] })
                }
                placeholder="Selecione uma ou mais regiões"
                className="w-full"
                display="chip"
                filter
              />
            </div>
          </TabPanel>
        </TabView>

        <div className="flex gap-2">
          <Button type="submit" label="Salvar" loading={loading} />
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/institutions")}
          />
        </div>
      </form>
    </div>
  );
}
