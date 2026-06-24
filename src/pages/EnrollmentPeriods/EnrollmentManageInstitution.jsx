import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CpfInput from "../../components/Cpf/CpfInput";
import EmailInput from "../../components/Email/EmailInput";
import PaginatedDropdown from "../../components/PaginatedDropdown";
import PdfUpload from "../../components/PdfUpload/PdfUpload";
import PhoneInput from "../../components/Phone/PhoneInput";
import api from "../../services/api";
import { API_ROUTES } from "../../services/API_routes";
import {
  uploadPdfToCloudinary,
  validatePdfFile,
} from "../../services/cloudinary";
import { repository } from "../../services/repository";
import { getCurrentInstitutionId } from "../../utils/auth";
import {
  ROUTE_CONTEXT_KEYS,
  getRouteContext,
  setRouteContext,
} from "../../utils/routeContext";

export default function EnrollmentManageInstitution() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.period, {});
  const periodId = routeContext.id;
  const navigate = useNavigate();
  const institutionId = getCurrentInstitutionId();

  const [period, setPeriod] = useState(null);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [linkingStudent, setLinkingStudent] = useState(false);
  const [unlinkingStudentId, setUnlinkingStudentId] = useState(null);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    course_id: null,
    discipline_id: null,
    semester: null,
    institution_id: institutionId,
    internship_start_date: "",
    internship_expected_end_date: "",
    professor_name: "",
    preceptor_name: "",
  });

  const loadData = useCallback(async () => {
    if (!periodId || !institutionId) return;

    try {
      setLoading(true);

      const periodRes = await repository.periods.getById(periodId, {
        include: "students",
      });
      setPeriod(periodRes.data);

      const studentsRes = await repository.students.byInstitute(institutionId, {
        include: "discipline,institution",
      });
      const instituteStudents = Array.isArray(studentsRes.data)
        ? studentsRes.data
        : studentsRes.data.items || [];

      const periodData = periodRes.data || {};
      const rawLinkedStudents =
        periodData.students ||
        periodData.student_ids ||
        periodData.studentIds ||
        [];

      let linked = [];
      let linkedIds = [];

      if (
        Array.isArray(rawLinkedStudents) &&
        rawLinkedStudents.length > 0 &&
        typeof rawLinkedStudents[0] === "object"
      ) {
        linked = rawLinkedStudents;
        linkedIds = rawLinkedStudents.map((s) => String(s.id)).filter(Boolean);
      } else {
        linkedIds = Array.isArray(rawLinkedStudents)
          ? rawLinkedStudents.map(String).filter(Boolean)
          : [];

        if (linkedIds.length > 0) {
          const linkedResponses = await Promise.all(
            linkedIds.map((studentId) =>
              repository.students.getById(studentId),
            ),
          );
          linked = linkedResponses.map((r) => r.data).filter(Boolean);
        }
      }

      const linkedIdSet = new Set(linkedIds);
      const available = instituteStudents.filter(
        (student) => !linkedIdSet.has(String(student.id)),
      );

      setLinkedStudents(linked);
      setAvailableStudents(available);
      setSelectedStudentId(null);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  }, [periodId, institutionId]);

  const fetchCourses = useCallback(
    (params) => api.get(API_ROUTES.COURSES.LIST, { params }),
    [],
  );

  const fetchDisciplines = useCallback(
    (params) => api.get(API_ROUTES.CADASTROS.DISCIPLINES_LIST, { params }),
    [],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLinkStudent = async () => {
    if (!periodId || !selectedStudentId) return;

    try {
      setLinkingStudent(true);
      await repository.periods.addStudent(periodId, selectedStudentId);
      setSelectedStudentId(null);
      await loadData();
    } catch (e) {
      console.error("Erro ao vincular aluno:", e);
    } finally {
      setLinkingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!periodId) return;

    try {
      setUnlinkingStudentId(studentId);
      await repository.periods.removeStudent(periodId, studentId);
      await loadData();
    } catch (e) {
      console.error("Erro ao desvincular aluno:", e);
    } finally {
      setUnlinkingStudentId(null);
    }
  };

  const fetchCourseById = useCallback(
    (id) => api.post(API_ROUTES.COURSES.DETAIL, { course_id: Number(id) }),
    [],
  );

  const fetchDisciplineById = useCallback(
    (id) =>
      api.post(API_ROUTES.CADASTROS.DISCIPLINES_DETAIL, {
        discipline_id: Number(id),
      }),
    [],
  );

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!periodId) return;

    try {
      setRegisterError("");
      if (!documentFile) {
        throw new Error("Envie o PDF obrigatório do aluno.");
      }

      setRegistering(true);
      const documentUrl = await uploadPdfToCloudinary(documentFile);

      const { data: newStudent } = await api.post(API_ROUTES.GESTAO.STUDENTS, {
        ...registerForm,
        course_id: registerForm.course_id,
        document_url: documentUrl,
        internship_start_date: registerForm.internship_start_date || null,
        internship_expected_end_date:
          registerForm.internship_expected_end_date || null,
      });
      const studentId = newStudent.id;

      await repository.periods.addStudent(periodId, studentId);

      setRegisterForm({
        name: "",
        cpf: "",
        email: "",
        phone: "",
        course_id: null,
        discipline_id: null,
        semester: null,
        institution_id: institutionId,
        internship_start_date: "",
        internship_expected_end_date: "",
        professor_name: "",
        preceptor_name: "",
      });
      setDocumentFile(null);
      setShowRegisterModal(false);

      await loadData();
    } catch (e) {
      setRegisterError(
        e.response?.data?.detail ||
          e.message ||
          "Erro ao cadastrar e vincular aluno",
      );
      console.error("Erro ao cadastrar e vincular aluno:", e);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-xl font-bold m-0">Gerenciar Inscrições</h2>
          {period && (
            <small className="text-600">
              Período: {period.name} •{" "}
              {new Date(period.start_date).toLocaleDateString()} -{" "}
              {new Date(period.end_date).toLocaleDateString()}
            </small>
          )}
        </div>
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={() => navigate("/periods")}
        />
      </div>

      {loading ? (
        <div className="text-center p-4">Carregando...</div>
      ) : (
        <div className="grid">
          <div className="col-12 lg:col-6">
            <div className="surface-50 p-4 border-round h-full">
              <h3 className="text-lg font-bold mb-3">
                Alunos Vinculados ({linkedStudents.length})
              </h3>

              {linkedStudents.length === 0 ? (
                <div className="text-center text-color-secondary p-4">
                  Nenhum aluno vinculado ainda
                </div>
              ) : (
                <DataTable
                  value={linkedStudents}
                  size="small"
                  emptyMessage="Nenhum aluno vinculado"
                >
                  <Column field="name" header="Nome" />
                  <Column field="cpf" header="CPF" />
                  <Column
                    field="discipline"
                    header="Disciplina"
                    body={(row) =>
                      row.discipline?.name || row.discipline_name || "-"
                    }
                  />
                  <Column
                    header="Ação"
                    body={(row) => (
                      <div className="flex gap-1">
                        <Button
                          icon="pi pi-eye"
                          rounded
                          text
                          severity="info"
                          size="small"
                          onClick={() => {
                            setRouteContext(ROUTE_CONTEXT_KEYS.student, {
                              id: row.id,
                            });
                            navigate("/students/details");
                          }}
                          title="Visualizar aluno"
                        />
                        <Button
                          icon="pi pi-pencil"
                          rounded
                          text
                          severity="warning"
                          size="small"
                          onClick={() => {
                            setRouteContext(ROUTE_CONTEXT_KEYS.student, {
                              id: row.id,
                            });
                            navigate(`/students/${row.id}`);
                          }}
                          title="Editar aluno"
                        />
                      </div>
                    )}
                  />
                </DataTable>
              )}
            </div>
          </div>

          <div className="col-12 lg:col-6">
            <div className="surface-50 p-4 border-round h-full">
              <h3 className="text-lg font-bold mb-3">Vincular Novo Aluno</h3>
              <div className="border-top-1 surface-border pt-3">
                <Button
                  label="Cadastrar e Vincular"
                  icon="pi pi-user-plus"
                  className="w-full"
                  severity="success"
                  onClick={() => setShowRegisterModal(true)}
                />
              </div>

              {availableStudents.length === 0 && (
                <div className="mt-3 p-3 bg-orange-50 border-round text-orange-700 text-sm">
                  💡 Todos os alunos da sua instituição já estão vinculados a
                  este período. Cadastre um novo para vincular.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog
        visible={showRegisterModal}
        onHide={() => {
          setShowRegisterModal(false);
          setRegisterError("");
          setDocumentFile(null);
        }}
        header="Cadastrar Novo Aluno"
        modal
        style={{ width: "90vw", maxWidth: "600px" }}
      >
        <form onSubmit={handleRegisterStudent} className="p-fluid">
          <div className="field mb-4">
            <label className="font-medium mb-2 block">Nome *</label>
            <InputText
              value={registerForm.name}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, name: e.target.value })
              }
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="field mb-4">
            <label className="font-medium mb-2 block">CPF *</label>
            <CpfInput
              value={registerForm.cpf}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, cpf: e.target.value })
              }
              required
            />
          </div>

          <div className="field mb-4">
            <EmailInput
              value={registerForm.email}
              onChange={(value) =>
                setRegisterForm({ ...registerForm, email: value })
              }
            />
          </div>

          <div className="field mb-4">
            <PhoneInput
              value={registerForm.phone}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, phone: e.target.value })
              }
            />
          </div>

          <PdfUpload
            label="PDF do documento *"
            required
            value={documentFile}
            onChange={(file) => {
              if (file) {
                const validationError = validatePdfFile(file);
                if (validationError) {
                  setRegisterError(validationError);
                  return;
                }
                setRegisterError("");
              }
              setDocumentFile(file);
            }}
          />

          {registerError && (
            <div className="mb-3 text-red-500 text-sm">{registerError}</div>
          )}

          <div className="field mb-4">
            <label className="font-medium mb-2 block">Curso *</label>
            <PaginatedDropdown
              fetchFn={fetchCourses}
              fetchById={fetchCourseById}
              value={registerForm.course_id}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, course_id: e.value })
              }
              optionLabel="name"
              optionValue="id"
              placeholder="Selecione um curso"
              required
            />
          </div>

          <div className="field mb-4">
            <label className="font-medium mb-2 block">Disciplina *</label>
            <PaginatedDropdown
              fetchFn={fetchDisciplines}
              fetchById={fetchDisciplineById}
              value={registerForm.discipline_id}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, discipline_id: e.value })
              }
              optionLabel="name"
              optionValue="id"
              placeholder="Selecione uma disciplina"
              required
            />
          </div>

          <div className="field mb-4">
            <label className="font-medium mb-2 block">Semestre</label>
            <InputNumber
              value={registerForm.semester}
              onValueChange={(e) =>
                setRegisterForm({ ...registerForm, semester: e.value })
              }
              placeholder="Semestre"
              min={1}
              max={12}
            />
          </div>

          <div className="grid mb-4">
            <div className="col-12 md:col-6 field">
              <label className="font-medium mb-2 block">
                Início do estágio
              </label>
              <input
                type="date"
                className="w-full p-inputtext p-component"
                value={registerForm.internship_start_date}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    internship_start_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-12 md:col-6 field">
              <label className="font-medium mb-2 block">
                Fim previsto do estágio
              </label>
              <input
                type="date"
                className="w-full p-inputtext p-component"
                value={registerForm.internship_expected_end_date}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    internship_expected_end_date: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="field mb-4">
            <label className="font-medium mb-2 block">Professor</label>
            <InputText
              value={registerForm.professor_name}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  professor_name: e.target.value,
                })
              }
              placeholder="Nome do professor"
              className="w-full"
            />
          </div>

          <div className="field mb-4">
            <label className="font-medium mb-2 block">Preceptor</label>
            <InputText
              value={registerForm.preceptor_name}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  preceptor_name: e.target.value,
                })
              }
              placeholder="Nome do preceptor"
              className="w-full"
            />
          </div>

          <div className="flex gap-2 justify-content-end">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={() => setShowRegisterModal(false)}
            />
            <Button
              type="submit"
              label="Cadastrar e Vincular"
              icon="pi pi-check"
              loading={registering}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
