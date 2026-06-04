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
  fileToBase64,
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
    discipline_id: null,
    semester: null,
    institution_id: null,
    document_url: "",
    internship_start_date: "",
    internship_expected_end_date: "",
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [directorSignedPdfFile, setDirectorSignedPdfFile] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
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
      const [disciplinesRes, instRes] = await Promise.all([
        api.get(API_ROUTES.CADASTROS.COURSES),
        api.get(API_ROUTES.CADASTROS.INSTITUTIONS),
      ]);
      setDisciplines(
        Array.isArray(disciplinesRes.data)
          ? disciplinesRes.data
          : disciplinesRes.data.items || [],
      );
      setInstitutions(
        Array.isArray(instRes.data) ? instRes.data : instRes.data.items || [],
      );
    } catch (e) {
      console.error("Erro ao carregar opções:", e);
      setDisciplines([]);
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
        discipline_id: data?.discipline_id ?? null,
        semester: data?.semester ?? null,
        institution_id: data?.institution_id ?? null,
        document_url: data?.document_url || "",
        internship_start_date: data?.internship_start_date || "",
        internship_expected_end_date: data?.internship_expected_end_date || "",
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

  const handleDirectorSignedPdfChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setDirectorSignedPdfFile(null);
      return;
    }

    const validationError = validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      setDirectorSignedPdfFile(null);
      e.target.value = "";
      return;
    }

    setError("");
    setDirectorSignedPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let documentUrl = form.document_url || "";
      let directorSignedPdf = null;

      if (!id && !documentFile) {
        throw new Error("Envie o PDF obrigatório do aluno.");
      }

      if (!id && !directorSignedPdfFile) {
        throw new Error("Envie o PDF assinado pelo diretor.");
      }

      if (!id && !form.internship_start_date) {
        throw new Error("Informe a data de início do estágio.");
      }

      if (!id && !form.internship_expected_end_date) {
        throw new Error("Informe a data prevista de término do estágio.");
      }

      if (documentFile) {
        documentUrl = await uploadPdfToCloudinary(documentFile);
      }

      if (!id && directorSignedPdfFile) {
        directorSignedPdf = await fileToBase64(directorSignedPdfFile);
      }

      const payload = {
        name: form.name,
        cpf: form.cpf,
        email: form.email,
        phone: form.phone,
        discipline_id: form.discipline_id,
        semester: form.semester,
        institution_id: form.institution_id,
        document_url: documentUrl,
      };

      if (!id) {
        payload.director_signed_pdf = directorSignedPdf;
        payload.internship_start_date = form.internship_start_date;
        payload.internship_expected_end_date =
          form.internship_expected_end_date;
      }

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

        {!id && (
          <>
            <div className="field mb-3">
              <label className="block mb-2">PDF assinado pelo diretor *</label>
              <input
                type="file"
                accept="application/pdf"
                className="w-full"
                onChange={handleDirectorSignedPdfChange}
                required
              />
              <small className="text-600 block mt-1">
                PDF obrigatório, máximo 5MB.
              </small>
              {directorSignedPdfFile && (
                <small className="block mt-2 text-green-700">
                  Arquivo selecionado: {directorSignedPdfFile.name}
                </small>
              )}
            </div>

            <div className="grid mb-3">
              <div className="col-12 md:col-6">
                <label className="block mb-2">Início do estágio *</label>
                <input
                  type="date"
                  value={form.internship_start_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      internship_start_date: e.target.value,
                    })
                  }
                  className="w-full p-inputtext p-component"
                  required
                />
              </div>

              <div className="col-12 md:col-6">
                <label className="block mb-2">Fim previsto do estágio *</label>
                <input
                  type="date"
                  value={form.internship_expected_end_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      internship_expected_end_date: e.target.value,
                    })
                  }
                  className="w-full p-inputtext p-component"
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="field mb-3">
          <label>Disciplina *</label>
          <Dropdown
            value={form.discipline_id}
            options={disciplines}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, discipline_id: e.value })}
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
