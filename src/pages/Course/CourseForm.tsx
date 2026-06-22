import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import { getCurrentPermission } from "../../utils/auth";
import { getErrorMessage } from "../../utils/errorHandler";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

type FormState = {
  name: string;
  area: string;
  workload: number | null;
  semester: number | null;
  is_active: boolean;
  education_institute_id: number | null;
};

export default function CoursesForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.course, undefined);
  const id = routeContext?.id;
  const isEdit = !!id;
  const navigate = useNavigate();

  const isAdmin = getCurrentPermission() === PERMISSIONS.ADMIN;

  const [form, setForm] = useState<FormState>({
    name: "",
    area: "",
    workload: null,
    semester: null,
    is_active: true,
    education_institute_id: null,
  });
  const [institutions, setInstitutions] = useState<{ label: string; value: number }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      repository.institutions.get({ per_page: 100 })
        .then(({ data }: any) => {
          const items = data?.items || data || [];
          setInstitutions(items.map((i: any) => ({ label: i.name, value: i.id })));
        })
        .catch(() => setInstitutions([]));
    }
    if (isEdit && id) loadCourse();
  }, [id, isEdit]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      const { data } = await repository.courses.getById(id as string);
      setForm({
        name: data.name || "",
        area: data.area || "",
        workload: data.workload ?? null,
        semester: data.semester ?? null,
        is_active: data.is_active ?? true,
        education_institute_id: data.education_institute_id ?? null,
      });
    } catch (e) {
      setError("Erro ao carregar o curso");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        const payload: any = {
          course_id: id,
          name: form.name,
        };
        if (isAdmin) payload.education_institute_id = form.education_institute_id;
        await repository.courses.put(id as string, payload);
      } else {
        const payload: any = {
          name: form.name,
          area: form.area || undefined,
          workload: form.workload ?? undefined,
          semester: form.semester ?? undefined,
          is_active: form.is_active,
          disciplines: [],
        };
        if (isAdmin) payload.education_institute_id = form.education_institute_id;
        await repository.courses.post(payload);
      }
      navigate("/courses");
    } catch (err: any) {
      setError(getErrorMessage(err, "Erro ao salvar o curso"));
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

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid">
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
            <label className="block text-900 font-medium mb-2">Instituição *</label>
            <Dropdown
              value={form.education_institute_id}
              options={institutions}
              onChange={(e) => setForm({ ...form, education_institute_id: e.value })}
              placeholder="Selecione uma instituição"
              className="w-full"
              filter
              required
            />
          </div>
        )}

        {!isEdit && (
          <div className="field col-12 md:col-6 flex align-items-center gap-2 pt-4">
            <Checkbox
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: !!e.checked })}
            />
            <label className="mb-0">Ativo</label>
          </div>
        )}

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
