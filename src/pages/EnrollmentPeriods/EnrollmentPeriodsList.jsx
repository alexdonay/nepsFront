import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import {
  getCurrentInstitutionId,
  getCurrentPermission,
  normalizePermission,
} from "../../utils/auth";
import EnrollmentPeriodsFilters from "./EnrollmentPeriodsFilters";

const getStudentCourseName = (student) =>
  student?.course?.name || student?.course_name || "-";

const getStudentInstitutionName = (student) =>
  student?.institution?.name || student?.institution_name || "-";

export default function EnrollmentPeriodsList() {
  const [periods, setPeriods] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [periodManagementLoading, setPeriodManagementLoading] = useState(false);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [linkingStudent, setLinkingStudent] = useState(false);
  const [unlinkingStudentId, setUnlinkingStudentId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const currentPermission = normalizePermission(getCurrentPermission());
  const canCreatePeriod = currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO;
  const institutionId = getCurrentInstitutionId();

  const today = new Date();

  useEffect(() => {
    loadPeriods();
  }, [searchParams, first, rows]);

  useEffect(() => {
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterPeriodsForEducationInstitute = (periodsList) => {
    if (currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO) {
      return periodsList;
    }

    const now = new Date();
    return periodsList.filter((period) => {
      // Verificar se está ativo
      if (!period.is_active) return false;

      // Verificar se está na janela de prioridade
      const priorityStart = period.priority_start_date
        ? new Date(period.priority_start_date)
        : null;
      const priorityEnd = period.priority_end_date
        ? new Date(period.priority_end_date)
        : null;

      // Se não houver datas de prioridade, considerar o período geral
      if (!priorityStart || !priorityEnd) {
        const periodStart = new Date(period.start_date);
        const periodEnd = new Date(period.end_date);
        return now >= periodStart && now <= periodEnd;
      }

      // Verificar se está dentro da janela de prioridade
      return now >= priorityStart && now <= priorityEnd;
    });
  };

  const loadPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      // Diferenciar comportamento por permissão
      if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
        // Instituição de Ensino: apenas períodos ativos
        params.is_active = "1";
        // Se o backend suportar filtro por institution_id, enviar
        if (institutionId) {
          params.institution_id = institutionId;
        }
      }
      // Admin: sem filtros automáticos, vê tudo

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.periods.get(params);
      let periodsList = data.items || data;

      // Filtro no frontend para INSTITUICAO_ENSINO (apenas período prioritário)
      if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
        periodsList = filterPeriodsForEducationInstitute(periodsList);
      }

      setPeriods(periodsList);
      setTotalRecords(periodsList.length);
    } catch (e) {
      if (e.response?.status === 401) {
        console.warn(
          "Sessão expirada ou não autenticado. Faça login novamente.",
        );
      }
      setPeriods([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, first, rows, currentPermission, institutionId]);

  const handleApplyFilters = (appliedFilters) => {
    const params = new URLSearchParams();

    if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
      // Para instituições de ensino, apenas permitir filtro por nome
      const filteredFilters = Object.entries(appliedFilters).filter(([key]) => {
        return key.includes("name");
      });
      filteredFilters.forEach(([key, value]) => {
        if (Array.isArray(value)) params.append(key, value.join(","));
        else params.append(key, value);
      });
    } else {
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) params.append(key, value.join(","));
        else params.append(key, value);
      });
    }

    setSearchParams(params);
    setFirst(0);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setFirst(0);
    setFilterVisible(false);
  };

  const handlePaginationChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const activeFilterCount = Array.from(searchParams.entries()).length;

  const dateTemplate = (rowData) =>
    new Date(rowData.start_date).toLocaleDateString();

  const currentPeriod = periods.find((p) => {
    if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
      // Para instituições de ensino, buscar período em janela de prioridade
      const priorityStart = p.priority_start_date
        ? new Date(p.priority_start_date)
        : null;
      const priorityEnd = p.priority_end_date
        ? new Date(p.priority_end_date)
        : null;
      return (
        priorityStart &&
        priorityEnd &&
        today >= priorityStart &&
        today <= priorityEnd
      );
    }
    // Para admin, buscar período geral em aberto
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    return start <= today && end >= today;
  });

  const loadPeriodManagement = useCallback(
    async (periodId) => {
      if (
        currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO ||
        !periodId ||
        !institutionId
      ) {
        setLinkedStudents([]);
        setAvailableStudents([]);
        setSelectedStudentId(null);
        return;
      }

      try {
        setPeriodManagementLoading(true);

        const [periodRes, studentsRes] = await Promise.all([
          repository.periods.getById(periodId, { include: "students" }),
          repository.students.byInstitute(institutionId, {
            include: "course,institution",
          }),
        ]);

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
          linkedIds = rawLinkedStudents
            .map((student) => student?.id)
            .filter(Boolean);
        } else {
          linkedIds = Array.isArray(rawLinkedStudents)
            ? rawLinkedStudents.filter(Boolean)
            : [];

          if (linkedIds.length > 0) {
            const linkedResponses = await Promise.all(
              linkedIds.map((studentId) =>
                repository.students.getById(studentId),
              ),
            );
            linked = linkedResponses
              .map((response) => response.data)
              .filter(Boolean);
          }
        }

        const instituteStudents = Array.isArray(studentsRes.data)
          ? studentsRes.data
          : studentsRes.data.items || [];

        const linkedIdSet = new Set(
          linked.map((student) => String(student.id)),
        );
        const filteredAvailableStudents = instituteStudents.filter(
          (student) => !linkedIdSet.has(String(student.id)),
        );

        setLinkedStudents(linked);
        setAvailableStudents(filteredAvailableStudents);
        setSelectedStudentId((currentSelected) => {
          if (
            currentSelected &&
            filteredAvailableStudents.some(
              (student) => String(student.id) === String(currentSelected),
            )
          ) {
            return currentSelected;
          }
          return null;
        });
      } catch (e) {
        console.error("Erro ao carregar alunos do período:", e);
        setLinkedStudents([]);
        setAvailableStudents([]);
        setSelectedStudentId(null);
      } finally {
        setPeriodManagementLoading(false);
      }
    },
    [currentPermission, institutionId],
  );

  useEffect(() => {
    if (
      currentPermission === PERMISSIONS.INSTITUICAO_ENSINO &&
      currentPeriod?.id
    ) {
      loadPeriodManagement(currentPeriod.id);
    } else {
      setLinkedStudents([]);
      setAvailableStudents([]);
      setSelectedStudentId(null);
    }
  }, [currentPermission, currentPeriod?.id, loadPeriodManagement]);

  const handleLinkStudent = async () => {
    if (!currentPeriod?.id || !selectedStudentId) return;

    try {
      setLinkingStudent(true);
      await repository.periods.addStudent(currentPeriod.id, selectedStudentId);
      setSelectedStudentId(null);
      await loadPeriodManagement(currentPeriod.id);
    } catch (e) {
      console.error("Erro ao vincular aluno ao período:", e);
    } finally {
      setLinkingStudent(false);
    }
  };

  const handleRemoveLinkedStudent = async (studentId) => {
    if (!currentPeriod?.id) return;

    try {
      setUnlinkingStudentId(studentId);
      await repository.periods.removeStudent(currentPeriod.id, studentId);
      await loadPeriodManagement(currentPeriod.id);
    } catch (e) {
      console.error("Erro ao desvincular aluno do período:", e);
    } finally {
      setUnlinkingStudentId(null);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Períodos de Inscrição</h2>
        <div className="flex gap-2">
          {currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO && (
            <Button
              label="Filtros"
              icon="pi pi-filter"
              badge={activeFilterCount > 0 ? activeFilterCount : null}
              badgeClassName="p-badge-info"
              onClick={() => setFilterVisible(true)}
            />
          )}
          {canCreatePeriod && (
            <Button
              label="Novo Período"
              icon="pi pi-plus"
              onClick={() => (window.location.href = "/periods/new")}
            />
          )}
        </div>
      </div>
      {currentPermission === PERMISSIONS.INSTITUICAO_ENSINO && (
        <div className="surface-highlight p-3 border-round mb-3 border-left-4 border-primary">
          <strong>
            📌 Você está visualizando períodos abertos para sua instituição
          </strong>
          <br />
          <small className="text-600">
            Apenas períodos em janela de prioridade prioritária são exibidos.
          </small>
        </div>
      )}
      {currentPeriod && (
        <div className="surface-100 p-3 border-round mb-3">
          <strong>Período Ativo:</strong> {currentPeriod.name} (
          {dateTemplate(currentPeriod)} -{" "}
          {new Date(currentPeriod.end_date).toLocaleDateString()})
        </div>
      )}

      {currentPermission === PERMISSIONS.INSTITUICAO_ENSINO &&
        currentPeriod && (
          <div className="surface-card p-3 border-round mb-3">
            <div className="flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="text-lg font-bold m-0">
                  Gestão de alunos do período
                </h3>
                <small className="text-600">
                  Vincule alunos diretamente ao período ativo da sua
                  instituição.
                </small>
              </div>
              <span className="text-sm text-600">
                {linkedStudents.length} vinculados • {availableStudents.length}{" "}
                disponíveis
              </span>
            </div>

            {periodManagementLoading ? (
              <div className="surface-50 p-3 border-round">
                Carregando alunos do período...
              </div>
            ) : (
              <div className="grid">
                <div className="col-12 lg:col-7">
                  <div className="surface-50 p-3 border-round h-full">
                    <strong className="block mb-3">
                      Alunos já vinculados ({linkedStudents.length})
                    </strong>

                    {linkedStudents.length === 0 ? (
                      <span className="text-sm text-color-secondary">
                        Nenhum aluno vinculado.
                      </span>
                    ) : (
                      linkedStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border"
                        >
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-color-secondary">
                              CPF: {student.cpf || "-"}
                            </div>
                            <div className="text-xs text-color-secondary">
                              Curso: {getStudentCourseName(student)} •
                              Instituição: {getStudentInstitutionName(student)}
                            </div>
                          </div>

                          <Button
                            icon="pi pi-trash"
                            rounded
                            text
                            severity="danger"
                            loading={unlinkingStudentId === student.id}
                            onClick={() =>
                              handleRemoveLinkedStudent(student.id)
                            }
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="col-12 lg:col-5">
                  <div className="surface-50 p-3 border-round h-full">
                    <strong className="block mb-3">
                      Cadastrar e vincular aluno
                    </strong>

                    <Dropdown
                      value={selectedStudentId}
                      options={availableStudents.map((student) => ({
                        label: `${student.name}${student.cpf ? ` • ${student.cpf}` : ""}`,
                        value: student.id,
                      }))}
                      onChange={(e) => setSelectedStudentId(e.value)}
                      placeholder="Selecione um aluno"
                      className="w-full mb-3"
                      showClear
                      filter
                      emptyMessage="Nenhum aluno disponível"
                    />

                    <Button
                      label="Vincular aluno"
                      icon="pi pi-user-plus"
                      className="w-full"
                      loading={linkingStudent}
                      disabled={!selectedStudentId}
                      onClick={handleLinkStudent}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      <DataTable
        value={periods}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        loading={loading}
        lazy
        emptyMessage="Nenhum período encontrado"
      >
        <Column field="name" header="Nome" />
        <Column
          field="start_date"
          header={
            currentPermission === PERMISSIONS.INSTITUICAO_ENSINO
              ? "Período de Inscrição Prioritária"
              : "Início"
          }
          body={(row) => {
            if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
              return `${new Date(row.priority_start_date).toLocaleDateString()} - ${new Date(row.priority_end_date).toLocaleDateString()}`;
            }
            return new Date(row.start_date).toLocaleDateString();
          }}
        />
        {currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO && (
          <Column
            field="end_date"
            header="Fim"
            body={(row) => new Date(row.end_date).toLocaleDateString()}
          />
        )}
        {currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO && (
          <Column
            field="is_active"
            header="Status"
            body={(row) => (row.is_active ? "Ativo" : "Encerrado")}
          />
        )}
        <Column
          header="Ações"
          body={(row) => (
            <div className="flex gap-2">
              {currentPermission === PERMISSIONS.ADMIN && (
                <Button
                  icon="pi pi-users"
                  rounded
                  text
                  size="small"
                  title="Gerir alunos do período"
                  onClick={() =>
                    (window.location.href = `/periods/${row.id}/manage`)
                  }
                />
              )}
              {canCreatePeriod && (
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  onClick={() => (window.location.href = `/periods/${row.id}`)}
                />
              )}
            </div>
          )}
        />
      </DataTable>

      <EnrollmentPeriodsFilters
        visible={filterVisible}
        onHide={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeCount={activeFilterCount}
      />
    </div>
  );
}
