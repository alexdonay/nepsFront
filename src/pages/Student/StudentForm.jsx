import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CpfInput from "../../components/CpfInput";
import EmailInput from "../../components/Email/EmailInput";
import PhoneInput from "../../components/PhoneInput";
import api from "../../services/api";
import { API_ROUTES } from "../../services/API_routes";
import {
  uploadPdfToCloudinary,
  validatePdfFile,
} from "../../services/cloudinary";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

export default function StudentForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.student, {});
  const { id } = routeContext;
  const [searchParams] = useSearchParams();
  const periodId = searchParams.get("periodId");
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    course_id: null,
    semester: null,
    institution_id: null,
    document_url: "",
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOptions();
    if (id) loadStudent();
  }, []);

  const loadOptions = async () => {
    try {
      const [coursesRes, instRes] = await Promise.all([
        api.get(API_ROUTES.CADASTROS.COURSES),
        api.get(API_ROUTES.CADASTROS.INSTITUTIONS),
      ]);
      setCourses(
        Array.isArray(coursesRes.data)
          ? coursesRes.data
          : coursesRes.data.items || [],
      );
      setInstitutions(
        Array.isArray(instRes.data) ? instRes.data : instRes.data.items || [],
      );
    } catch (e) {
      console.error("Erro ao carregar opções:", e);
      setCourses([]);
      setInstitutions([]);
    }
  };

  const loadStudent = async () => {
    try {
      const { data } = await repository.students.getById(id);
      setForm({
        name: data?.name || "",
        cpf: data?.cpf || "",
        email: data?.email || "",
        phone: data?.phone || "",
        course_id: data?.course_id ?? null,
        semester: data?.semester ?? null,
        institution_id: data?.institution_id ?? null,
        document_url: data?.document_url || "",
      });
    } catch (e) {}
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setDocumentFile(null);
      return;
    }

    const validationError = validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      setDocumentFile(null);
      e.target.value = "";
      return;
    }

    setError("");
    setDocumentFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let documentUrl = form.document_url || "";

      if (!id && !documentFile) {
        throw new Error("Envie o PDF obrigatório do aluno.");
      }

      if (documentFile) {
        documentUrl = await uploadPdfToCloudinary(documentFile);
      }

      const payload = {
        ...form,
        document_url: documentUrl,
      };

      let studentId = id;
      if (id) {
        await repository.students.put(id, payload);
      } else {
        const response = await api.post(API_ROUTES.GESTAO.STUDENTS, payload);
        studentId = response.data?.id;
      }

      // Se tem periodId, vincular o aluno ao período
      if (periodId && studentId) {
        await repository.periods.addStudent(periodId, studentId);
        console.log("✅ Aluno cadastrado e vinculado ao período com sucesso");
      }

      navigate("/students");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">{id ? "Editar" : "Novo"} Aluno</h2>

      {periodId && (
        <Message
          severity="info"
          text="Este aluno será automaticamente vinculado ao período."
          className="mb-3"
        />
      )}

      {error && <Message severity="error" text={error} className="mb-3" />}

      <form onSubmit={handleSubmit}>
        <div className="field mb-3">
          <label>Nome *</label>
          <InputText
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div className="field mb-3">
          <label>CPF</label>
          <CpfInput
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <EmailInput
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            required
          />
        </div>

        <div className="field mb-3">
          <PhoneInput
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="field mb-3">
          <label className="block mb-2">PDF do documento {id ? "" : "*"}</label>
          <input
            type="file"
            accept="application/pdf"
            className="w-full"
            onChange={handleDocumentChange}
            required={!id}
          />
          <small className="text-600 block mt-1">
            PDF obrigatório, máximo 5MB.
          </small>
          {documentFile && (
            <small className="block mt-2 text-green-700">
              Arquivo selecionado: {documentFile.name}
            </small>
          )}
          {id && form.document_url && !documentFile && (
            <small className="block mt-2 text-600">
              Documento atual já salvo no sistema.
            </small>
          )}
        </div>

        <div className="field mb-3">
          <label>Disciplina *</label>
          <Dropdown
            value={form.course_id}
            options={courses}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, course_id: e.value })}
            className="w-full"
            placeholder="Selecione"
            required
          />
        </div>

        <div className="field mb-3">
          <label>Semestre</label>
          <InputNumber
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.value })}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label>Instituição *</label>
          <Dropdown
            value={form.institution_id}
            options={institutions}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, institution_id: e.value })}
            className="w-full"
            placeholder="Selecione"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" label="Salvar" loading={loading} />
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/students")}
          />
        </div>
      </form>
    </div>
  );
}
