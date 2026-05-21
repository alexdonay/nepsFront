import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { TabPanel, TabView } from "primereact/tabview";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CNPJInput from "../../components/CNPJInput";
import EmailInput from "../../components/Email/EmailInput";
import PhoneInput from "../../components/PhoneInput";
import { repository } from "../../services/repository";
import { normalizeCNPJ } from "../../services/utils";

export default function InstitutionForm() {
  const { id } = useParams();
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
      setRegions(data.items || data || []);
    } catch (e) {
      setRegions([]);
    }
  };

  const loadInstitution = async () => {
    try {
      const { data } = await repository.institutions.getById(id);
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

      const hasMissingFields =
        !data?.cnpj ||
        data?.address == null ||
        data?.phone == null ||
        data?.email == null ||
        data?.priority == null;

      if (hasMissingFields) {
        const { data: listData } = await repository.institutions.get();
        const fromList = (listData || []).find(
          (institution) => institution.id === Number(id),
        );

        if (fromList) {
          setForm({
            ...normalized,
            cnpj: fromList.cnpj ?? normalized.cnpj,
            address: fromList.address ?? normalized.address,
            phone: fromList.phone ?? normalized.phone,
            email: fromList.email ?? normalized.email,
            is_active: fromList.is_active ?? normalized.is_active,
            priority: fromList.priority ?? normalized.priority,
            region_ids: (fromList.regions || normalized.region_ids || []).map(
              (region) => (typeof region === "number" ? region : region.id),
            ),
          });
          return;
        }
      }

      setForm(normalized);
    } catch (e) {
      setError("Erro ao carregar instituição");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!normalizeCNPJ(form.cnpj)) {
      setError("O CNPJ da instituição é obrigatório.");
      setLoading(false);
      return;
    }

    if (!form.email.trim()) {
      setError("O e-mail da instituição é obrigatório.");
      setLoading(false);
      return;
    }

    try {
      if (id) await repository.institutions.put(id, form);
      else await repository.institutions.post(form);
      navigate("/institutions");
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao salvar");
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
              required
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
              required
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
