import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

type FormState = {
  name: string;
  code: string;
  region_id: number | null;
};

type Region = {
  id: number;
  name: string;
};

export default function CoursesForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: "",
    code: "",
    region_id: null,
  });
  const [regions, setRegions] = useState<Region[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRegions();
    if (isEdit) loadCourse();
  }, [id]);

  const loadRegions = async () => {
    try {
      const { data } = await repository.regions.get();
      setRegions(data.items || data || []);
    } catch (e) {
      setRegions([]);
    }
  };

  const loadCourse = async () => {
    try {
      const { data } = await repository.courses.getById(id as string);
      setForm({
        name: data.name || "",
        code: data.code || "",
        region_id: data.region_id ?? null,
      });
    } catch (e) {
      setError("Erro ao carregar o curso");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        code: form.code,
        region_id: form.region_id,
      };

      if (isEdit) {
        await repository.courses.put(id as string, payload);
      } else {
        await repository.courses.post(payload);
      }
      navigate("/courses");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao salvar o curso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-3xl">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold">
          {isEdit ? "Editar Curso" : "Novo Curso"}
        </h2>
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() => navigate("/courses")}
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
          <label className="block text-900 font-medium mb-2">Código *</label>
          <InputText
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="block text-900 font-medium mb-2">Região</label>
          <Dropdown
            value={form.region_id}
            options={regions}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, region_id: e.value })}
            className="w-full"
            placeholder="Selecione"
            showClear
          />
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/courses")}
          />
          <Button type="submit" label="Salvar" loading={loading} />
        </div>
      </form>
    </div>
  );
}
