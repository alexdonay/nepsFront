import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { getCurrentInstitutionId } from "../../utils/auth";

export default function EnrollmentManageInstitution() {
  const { periodId } = useParams();
  const navigate = useNavigate();
  const institutionId = getCurrentInstitutionId();

  const [period, setPeriod] = useState(null);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [linkingStudent, setLinkingStudent] = useState(false);
  const [unlinkingStudentId, setUnlinkingStudentId] = useState(null);

  // Estados para modal de cadastro
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    course_id: null,
    semester: null,
    institution_id: institutionId,
  });

  const loadData = useCallback(async () => {
    if (!periodId || !institutionId) return;

    try {
      setLoading(true);

      // Carregar dados do período
      const periodRes = await repository.periods.getById(periodId, {
        include: "students",
      });
      setPeriod(periodRes.data);

      // Carregar alunos da instituição
      const studentsRes = await repository.students.byInstitute(institutionId, {
        include: "course,institution",
      });
      const instituteStudents = Array.isArray(studentsRes.data)
        ? studentsRes.data
        : studentsRes.data.items || [];

      // Separar alunos vinculados e disponíveis
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

  useEffect(() => {
    loadData();
    loadCourses();
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

  const loadCourses = async () => {
    try {
      const { data } = await api.get(API_ROUTES.CADASTROS.COURSES);
      const coursesList = Array.isArray(data) ? data : data.items || [];
      setCourses(coursesList);
    } catch (e) {
      console.error("Erro ao carregar disciplinas:", e);
    }
  };

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

      // Cadastrar aluno
      const { data: newStudent } = await api.post(API_ROUTES.GESTAO.STUDENTS, {
        ...registerForm,
        document_url: documentUrl,
      });
      const studentId = newStudent.id;

      // Vincular ao período
      await repository.periods.addStudent(periodId, studentId);

      // Resetar formulário e fechar modal
      setRegisterForm({
        name: "",
        cpf: "",
        email: "",
        phone: "",
        course_id: null,
        semester: null,
        institution_id: institutionId,
      });
      setDocumentFile(null);
      setShowRegisterModal(false);

      // Recarregar dados
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
          {/* Coluna esquerda: Alunos já vinculados */}
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
                    field="course"
                    header="Disciplina"
                    body={(row) => row.course?.name || row.course_name || "-"}
                  />
                  <Column
                    header="Ação"
                    body={(row) => (
                      <Button
                        icon="pi pi-trash"
                        rounded
                        text
                        severity="danger"
                        size="small"
                        loading={unlinkingStudentId === row.id}
                        onClick={() => handleRemoveStudent(row.id)}
                        title="Desvincular aluno"
                      />
                    )}
                  />
                </DataTable>
              )}
            </div>
          </div>

          {/* Coluna direita: Vincular novo aluno ou cadastrar */}
          <div className="col-12 lg:col-6">
            <div className="surface-50 p-4 border-round h-full">
              <h3 className="text-lg font-bold mb-3">Vincular Novo Aluno</h3>

              <div className="mb-4">
                <label className="block mb-2 font-medium">
                  Selecione um aluno cadastrado
                </label>
                <Dropdown
                  value={selectedStudentId}
                  options={availableStudents.map((student) => ({
                    label: `${student.name} • ${student.cpf || ""}`,
                    value: student.id,
                  }))}
                  onChange={(e) => setSelectedStudentId(e.value)}
                  placeholder={
                    availableStudents.length === 0
                      ? "Nenhum aluno disponível"
                      : "Escolha um aluno"
                  }
                  className="w-full"
                  filter
                  showClear
                  disabled={availableStudents.length === 0}
                />
              </div>

              <Button
                label="Vincular Aluno"
                icon="pi pi-link"
                className="w-full mb-3"
                disabled={!selectedStudentId}
                loading={linkingStudent}
                onClick={handleLinkStudent}
              />

              <div className="border-top-1 surface-border pt-3">
                <label className="block mb-2 font-medium">
                  Ou cadastre um novo aluno
                </label>
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

      {/* Modal para cadastrar novo aluno */}
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

          <div className="field mb-4">
            <label className="font-medium mb-2 block">PDF do documento *</label>
            <input
              type="file"
              accept="application/pdf"
              className="w-full"
              required
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) {
                  setDocumentFile(null);
                  return;
                }

                const validationError = validatePdfFile(file);
                if (validationError) {
                  setRegisterError(validationError);
                  setDocumentFile(null);
                  e.target.value = "";
                  return;
                }

                setRegisterError("");
                setDocumentFile(file);
              }}
            />
            <small className="text-600 block mt-1">
              PDF obrigatório, máximo 5MB.
            </small>
            {documentFile && (
              <small className="block mt-2 text-green-700">
                Arquivo selecionado: {documentFile.name}
              </small>
            )}
          </div>

          {registerError && (
            <div className="mb-3 text-red-500 text-sm">{registerError}</div>
          )}

          <div className="field mb-4">
            <label className="font-medium mb-2 block">Disciplina *</label>
            <Dropdown
              value={registerForm.course_id}
              options={courses.map((course) => ({
                label: course.name,
                value: course.id,
              }))}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, course_id: e.value })
              }
              placeholder="Selecione um disciplina"
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
