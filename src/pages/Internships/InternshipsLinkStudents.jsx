import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { API_ROUTES } from "../../services/API_routes";
import { repository } from "../../services/repository";

export default function InternshipsLinkStudents() {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linkingStudent, setLinkingStudent] = useState(false);
  const [unlinkingStudentId, setUnlinkingStudentId] = useState(null);

  const loadInternships = useCallback(async () => {
    try {
      const res = await repository.internships.get({ per_page: 100 });
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setInternships(items);
    } catch (e) {
      console.error("Erro ao carregar campos de estágio:", e);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    if (!selectedInternshipId) return;

    try {
      setLoading(true);

      const [linkedRes, availableRes] = await Promise.all([
        repository.students.get({
          internship_id: selectedInternshipId,
          include: "discipline,institution",
          per_page: 100,
        }),
        repository.students.get({
          internship_id_null: true,
          include: "discipline,institution",
          per_page: 100,
        }),
      ]);

      const linked = Array.isArray(linkedRes.data)
        ? linkedRes.data
        : linkedRes.data.items || [];
      const available = Array.isArray(availableRes.data)
        ? availableRes.data
        : availableRes.data.items || [];

      setLinkedStudents(linked);
      setAvailableStudents(available);
    } catch (e) {
      console.error("Erro ao carregar alunos:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedInternshipId]);

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  useEffect(() => {
    if (selectedInternshipId) {
      loadStudents();
      const internship = internships.find((i) => i.id === selectedInternshipId);
      setSelectedInternship(internship);
    } else {
      setLinkedStudents([]);
      setAvailableStudents([]);
      setSelectedInternship(null);
    }
  }, [selectedInternshipId]);

  const handleLinkStudent = async (studentId) => {
    if (!selectedInternshipId || !studentId) return;

    try {
      setLinkingStudent(true);
      await repository.students.linkToInternship(studentId, selectedInternshipId);
      await loadStudents();
    } catch (e) {
      console.error("Erro ao vincular aluno:", e);
    } finally {
      setLinkingStudent(false);
    }
  };

  const handleUnlinkStudent = async (studentId) => {
    if (!studentId) return;

    try {
      setUnlinkingStudentId(studentId);
      await repository.students.unlinkFromInternship(studentId);
      await loadStudents();
    } catch (e) {
      console.error("Erro ao desvincular aluno:", e);
    } finally {
      setUnlinkingStudentId(null);
    }
  };

  const internshipSelectOptions = internships.map((i) => ({
    label: i.name,
    value: i.id,
  }));

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-xl font-bold m-0">
            Vincular Alunos a Campos de Estágio
          </h2>
          {selectedInternship && (
            <small className="text-600">
              Campo: {selectedInternship.name}
            </small>
          )}
        </div>
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={() => navigate("/students")}
        />
      </div>

      <div className="mb-4">
        <label className="font-medium mb-2 block">
          Selecione o Campo de Estágio
        </label>
        <Dropdown
          value={selectedInternshipId}
          options={internshipSelectOptions}
          onChange={(e) => setSelectedInternshipId(e.value)}
          placeholder="Selecione um campo de estágio"
          filter
          showClear
          className="w-full md:w-20rem"
        />
      </div>

      {selectedInternshipId && (
        <div className="grid">
          <div className="col-12 lg:col-6">
            <div className="surface-50 p-4 border-round h-full">
              <h3 className="text-lg font-bold mb-3">
                Alunos Vinculados ({linkedStudents.length})
              </h3>

              {loading ? (
                <div className="text-center p-4">Carregando...</div>
              ) : linkedStudents.length === 0 ? (
                <div className="text-center text-color-secondary p-4">
                  Nenhum aluno vinculado a este campo
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
                      <Button
                        icon="pi pi-trash"
                        rounded
                        text
                        severity="danger"
                        size="small"
                        loading={unlinkingStudentId === row.id}
                        onClick={() => handleUnlinkStudent(row.id)}
                        title="Desvincular aluno"
                      />
                    )}
                  />
                </DataTable>
              )}
            </div>
          </div>

          <div className="col-12 lg:col-6">
            <div className="surface-50 p-4 border-round h-full">
              <h3 className="text-lg font-bold mb-3">
                Alunos Disponíveis ({availableStudents.length})
              </h3>

              {loading ? (
                <div className="text-center p-4">Carregando...</div>
              ) : availableStudents.length === 0 ? (
                <div className="text-center text-color-secondary p-4">
                  Nenhum aluno disponível para vincular
                </div>
              ) : (
                <DataTable
                  value={availableStudents}
                  size="small"
                  emptyMessage="Nenhum aluno disponível"
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
                    field="institution"
                    header="Instituição"
                    body={(row) =>
                      row.institution?.name || row.institution_name || "-"
                    }
                  />
                  <Column
                    header="Ação"
                    body={(row) => (
                      <Button
                        icon="pi pi-link"
                        rounded
                        text
                        severity="info"
                        size="small"
                        loading={linkingStudent}
                        onClick={() => handleLinkStudent(row.id)}
                        title="Vincular aluno"
                      />
                    )}
                  />
                </DataTable>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
