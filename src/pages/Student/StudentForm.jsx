import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CpfInput from "../../components/Cpf/CpfInput";
import EmailInput from "../../components/Email/EmailInput";
import PaginatedDropdown from "../../components/PaginatedDropdown";
import PhoneInput from "../../components/Phone/PhoneInput";
import api from "../../services/api";
import { API_ROUTES } from "../../services/API_routes";
import {
  uploadPdfToCloudinary,
  validatePdfFile,
} from "../../services/cloudinary";
import { repository } from "../../services/repository";
import { getErrorMessage } from "../../utils/errorHandler";
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
    discipline_id: null,
    semester: null,
    institution_id: null,
    document_url: "",
    internship_start_date: "",
    internship_expected_end_date: "",
    professor_name: "",
    preceptor_name: "",
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [directorSignedPdfFile, setDirectorSignedPdfFile] = useState(null);
  const [directorSignedPdfUrl, setDirectorSignedPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCourses = useCallback(
    params => api.get(API_ROUTES.COURSES.LIST, { params }),
    [],
  );

  const fetchDisciplines = useCallback(
    params => api.get(API_ROUTES.CADASTROS.DISCIPLINES_LIST, { params }),
    [],
  );

  const fetchInstitutions = useCallback(
    params => api.get(API_ROUTES.CADASTROS.INSTITUTIONS_LIST, { params }),
    [],
  );

  const fetchCourseById = useCallback(
    id => api.post(API_ROUTES.COURSES.DETAIL, { course_id: Number(id) }),
    [],
  );

  const fetchDisciplineById = useCallback(
    id => api.post(API_ROUTES.COURSES.DETAIL, { discipline_id: Number(id) }),
    [],
  );

  const fetchInstitutionById = useCallback(
    id => api.post(API_ROUTES.CADASTROS.INSTITUTIONS_DETAIL, { institute_id: Number(id) }),
    [],
  );

  useEffect(() => {
    if (id) loadStudent();
  }, []);

  const loadStudent = async () => {
    try {
      const { data } = await repository.students.getById(id);
      setForm({
        name: data?.name || "",
        cpf: data?.cpf || "",
        email: data?.email || "",
        phone: data?.phone || "",
        course_id: data?.course_id ?? null,
        discipline_id: data?.discipline_id ?? null,
        semester: data?.semester ?? null,
        institution_id: data?.institution_id ?? null,
        document_url: data?.document_url || "",
        internship_start_date: data?.internship_start_date || "",
        internship_expected_end_date: data?.internship_expected_end_date || "",
        professor_name: data?.professor_name || "",
        preceptor_name: data?.preceptor_name || "",
      });
      setDirectorSignedPdfUrl(data?.director_signed_pdf || "");
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

      if (documentFile) {
        documentUrl = await uploadPdfToCloudinary(documentFile);
      }

      if (directorSignedPdfFile) {
        directorSignedPdf = await uploadPdfToCloudinary(directorSignedPdfFile);
        console.log("Director PDF uploaded to Cloudinary:", directorSignedPdf);
      } else if (id) {
        directorSignedPdf = directorSignedPdfUrl || null;
      }

      console.log("Final directorSignedPdf value:", directorSignedPdf);

      const payload = {
        name: form.name,
        cpf: form.cpf,
        email: form.email,
        phone: form.phone,
        course_id: form.course_id,
        discipline_id: form.discipline_id,
        semester: form.semester,
        institution_id: form.institution_id,
        document_url: documentUrl,
        director_signed_pdf: directorSignedPdf,
        professor_name: form.professor_name || null,
        preceptor_name: form.preceptor_name || null,
      };

      if (!id) {
        payload.internship_start_date = form.internship_start_date || null;
        payload.internship_expected_end_date =
          form.internship_expected_end_date || null;
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
      setError(getErrorMessage(err, "Erro ao salvar"));
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
          <label className="block mb-2">PDF assinado pelo diretor</label>
          <input
            type="file"
            accept="application/pdf"
            className="w-full"
            onChange={handleDirectorSignedPdfChange}
          />
          <small className="text-600 block mt-1">
            PDF opcional, máximo 5MB.
          </small>
          {directorSignedPdfFile && (
            <small className="block mt-2 text-green-700">
              Arquivo selecionado: {directorSignedPdfFile.name}
            </small>
          )}
          {id && directorSignedPdfUrl && !directorSignedPdfFile && (
            <small className="block mt-2 text-600">
              Documento atual já salvo.
            </small>
          )}
        </div>

        {!id && (
          <div className="grid mb-3">
            <div className="col-12 md:col-6">
              <label className="block mb-2">Início do estágio</label>
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
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2">Fim previsto do estágio</label>
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
              />
            </div>
          </div>
        )}

        <div className="field mb-3">
          <label>Curso *</label>
          <PaginatedDropdown
            fetchFn={fetchCourses}
            fetchById={id ? fetchCourseById : undefined}
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.value })}
            optionLabel="name"
            optionValue="id"
            placeholder="Selecione um curso"
            required
          />
        </div>

        <div className="field mb-3">
          <label>Disciplina *</label>
          <PaginatedDropdown
            fetchFn={fetchDisciplines}
            fetchById={id ? fetchDisciplineById : undefined}
            value={form.discipline_id}
            onChange={(e) => setForm({ ...form, discipline_id: e.value })}
            optionLabel="name"
            optionValue="id"
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
          <PaginatedDropdown
            fetchFn={fetchInstitutions}
            fetchById={id ? fetchInstitutionById : undefined}
            value={form.institution_id}
            onChange={(e) => setForm({ ...form, institution_id: e.value })}
            optionLabel="name"
            optionValue="id"
            placeholder="Selecione"
            required
          />
        </div>

        <div className="field mb-3">
          <label>Professor</label>
          <InputText
            value={form.professor_name}
            onChange={(e) => setForm({ ...form, professor_name: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label>Preceptor</label>
          <InputText
            value={form.preceptor_name}
            onChange={(e) => setForm({ ...form, preceptor_name: e.target.value })}
            className="w-full"
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
