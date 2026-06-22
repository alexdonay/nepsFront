import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import PdfUpload from "../../components/PdfUpload/PdfUpload";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CpfInput from "../../components/Cpf/CpfInput";
import EmailInput from "../../components/Email/EmailInput";
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
import { getCurrentPermission, getCurrentInstitutionId } from "../../utils/auth";
import { PERMISSIONS } from "../../constants/permissions";

export default function StudentForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.student, {});
  const { id } = routeContext;
  const [searchParams] = useSearchParams();
  const periodId = searchParams.get("periodId");
  const isInstitution = getCurrentPermission() === PERMISSIONS.INSTITUICAO_ENSINO;
  const ownInstitutionId = isInstitution ? getCurrentInstitutionId() : null;
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    course_id: null,
    discipline_id: null,
    semester: null,
    institution_id: ownInstitutionId,
    institution_document_url: "",
    internship_start_date: "",
    internship_expected_end_date: "",
    professor_name: "",
    preceptor_name: "",
  });
  const [documentFile, setDocumentFile] = useState(null);
  const documentFileRef = useRef(null);
  const [directorSignedPdfFile, setDirectorSignedPdfFile] = useState(null);
  const directorSignedPdfFileRef = useRef(null);
  const [directorSignedPdfUrl, setDirectorSignedPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // listas em cascata
  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);

  useEffect(() => {
    if (isInstitution) {
      if (ownInstitutionId) loadCourses(ownInstitutionId);
      return;
    }
    repository.institutions.get({ per_page: 100 })
      .then(({ data }) => {
        const items = data?.items || data || [];
        setInstitutions(items.map((i) => ({ label: i.name, value: i.id })));
      })
      .catch(() => setInstitutions([]));
  }, []);

  const loadCourses = async (institutionId) => {
    setCourses([]);
    setDisciplines([]);
    if (!institutionId) return;
    try {
      const { data } = await repository.institutions.getById(institutionId);
      const items = data?.courses || [];
      setCourses(items.map((c) => ({ label: c.name, value: c.id })));
    } catch { setCourses([]); }
  };

  const loadDisciplines = async (courseId) => {
    setDisciplines([]);
    if (!courseId) return;
    try {
      const { data } = await repository.courses.getById(courseId);
      console.log("[loadDisciplines] courseId:", courseId, "response data:", data);
      const items = data?.disciplines || [];
      console.log("[loadDisciplines] disciplines found:", JSON.stringify(items));
      setDisciplines(items.map((d) => ({ label: d.name, value: d.id })));
    } catch (e) {
      console.error("[loadDisciplines] erro:", e);
      setDisciplines([]);
    }
  };

  useEffect(() => {
    if (id) loadStudent();
  }, [id]);

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
        institution_document_url: data?.document_url || data?.institution_document_url || "",
        internship_start_date: data?.internship_start_date || "",
        internship_expected_end_date: data?.internship_expected_end_date || "",
        professor_name: data?.professor_name || "",
        preceptor_name: data?.preceptor_name || "",
      });
      setDirectorSignedPdfUrl(data?.director_signed_pdf || "");
      // pré-carrega cascata
      if (data?.institution_id) await loadCourses(data.institution_id);
      if (data?.course_id) await loadDisciplines(data.course_id);
    } catch (e) {}
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0] || null;
    console.log("handleDocumentChange - selected file:", file);

    if (!file) {
      setDocumentFile(null);
      documentFileRef.current = null;
      return;
    }

    const validationError = validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      setDocumentFile(null);
      documentFileRef.current = null;
      e.target.value = "";
      return;
    }

    setError("");
    setDocumentFile(file);
    documentFileRef.current = file;
    console.log("handleDocumentChange - set documentFile state:", file.name);
  };

  const handleDirectorSignedPdfChange = (e) => {
    const file = e.target.files?.[0] || null;
    console.log("handleDirectorSignedPdfChange - selected file:", file);

    if (!file) {
      setDirectorSignedPdfFile(null);
      directorSignedPdfFileRef.current = null;
      return;
    }

    const validationError = validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      setDirectorSignedPdfFile(null);
      directorSignedPdfFileRef.current = null;
      e.target.value = "";
      return;
    }

    setError("");
    setDirectorSignedPdfFile(file);
    directorSignedPdfFileRef.current = file;
    console.log("handleDirectorSignedPdfChange - set directorSignedPdfFile state:", file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const currentDocumentFile = documentFileRef.current;
      const currentDirectorFile = directorSignedPdfFileRef.current;

      if (!id && !currentDocumentFile) {
        throw new Error("Envie o PDF obrigatório do aluno.");
      }

      let documentUrl = form.institution_document_url;
      let directorSignedPdf = directorSignedPdfUrl;

      if (currentDocumentFile) {
        documentUrl = await uploadPdfToCloudinary(currentDocumentFile);
        console.log("Cloudinary document URL:", documentUrl);
        setForm((prev) => ({ ...prev, institution_document_url: documentUrl }));
      }

      if (currentDirectorFile) {
        directorSignedPdf = await uploadPdfToCloudinary(
          currentDirectorFile,
        );
        console.log("Director PDF uploaded to Cloudinary:", directorSignedPdf);
        setDirectorSignedPdfUrl(directorSignedPdf);
      } else if (!id) {
        directorSignedPdf = null;
      }

      const payload = {
        name: form.name,
        cpf: form.cpf,
        email: form.email,
        phone: form.phone,
        course_id: form.course_id,
        discipline_id: form.discipline_id,
        semester: form.semester,
        institution_id: form.institution_id,
        professor_name: form.professor_name || null,
        preceptor_name: form.preceptor_name || null,
      };

      if (documentUrl) {
        payload.document_url = documentUrl;
      }

      if (directorSignedPdf) {
        payload.director_signed_pdf = directorSignedPdf;
      }

      if (!id) {
        payload.internship_start_date = form.internship_start_date || null;
        payload.internship_expected_end_date =
          form.internship_expected_end_date || null;
      }

      console.log("StudentForm Payload:", payload);

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

        <PdfUpload
          label={`PDF do documento${id ? "" : " *"}`}
          required={!id}
          value={documentFile}
          onChange={(file) => { setDocumentFile(file); documentFileRef.current = file; }}
          existingUrl={id ? form.institution_document_url : null}
        />

        {!isInstitution && (
          <PdfUpload
            label="PDF assinado pelo diretor"
            value={directorSignedPdfFile}
            onChange={(file) => { setDirectorSignedPdfFile(file); directorSignedPdfFileRef.current = file; }}
            existingUrl={id ? directorSignedPdfUrl : null}
            hint="PDF opcional, máximo 5MB"
          />
        )}

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

        {!isInstitution && (
          <div className="field mb-3">
            <label>Instituição *</label>
            <Dropdown
              value={form.institution_id}
              options={institutions}
              onChange={(e) => {
                setForm({ ...form, institution_id: e.value, course_id: null, discipline_id: null });
                loadCourses(e.value);
              }}
              placeholder="Selecione uma instituição"
              className="w-full"
              filter
              required
            />
          </div>
        )}

        <div className="field mb-3">
          <label>Curso *</label>
          <Dropdown
            value={form.course_id}
            options={courses}
            onChange={(e) => {
              setForm({ ...form, course_id: e.value, discipline_id: null });
              loadDisciplines(e.value);
            }}
            placeholder={form.institution_id ? "Selecione um curso" : "Selecione uma instituição primeiro"}
            className="w-full"
            filter
            disabled={!form.institution_id}
            required
          />
        </div>

        <div className="field mb-3">
          <label>Disciplina *</label>
          <Dropdown
            value={form.discipline_id}
            options={disciplines}
            onChange={(e) => setForm({ ...form, discipline_id: e.value })}
            placeholder={form.course_id ? "Selecione uma disciplina" : "Selecione um curso primeiro"}
            className="w-full"
            filter
            disabled={!form.course_id}
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
