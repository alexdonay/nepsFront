import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import "./ServiceScheduleAssignment.css";

const DAY_LABELS = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const PERIOD_LABELS = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Vespertino",
};

const STUDENT_FILTERS = [
  {
    label: "Nome",
    key: "name",
    type: "text",
    placeholder: "Buscar por nome...",
  },
  { label: "CPF", key: "cpf", type: "text", placeholder: "Buscar por CPF..." },
  {
    label: "Email",
    key: "email",
    type: "text",
    placeholder: "Buscar por email...",
  },
  { label: "Disciplina", key: "course_id", type: "dropdown", options: [] },
  {
    label: "Instituição",
    key: "institution_id",
    type: "dropdown",
    options: [],
  },
  {
    label: "Semestre",
    key: "semester",
    type: "number",
    placeholder: "Digite o semestre...",
  },
];

export default function ServiceScheduleAssignment() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoomContext = location.pathname.startsWith("/rooms/");
  const scheduleContext = getRouteContext(ROUTE_CONTEXT_KEYS.schedule, {});
  const roomId = scheduleContext.roomId;
  const dayOfWeek = scheduleContext.dayOfWeek;
  const period = scheduleContext.period;
  const basePath = isRoomContext ? "/rooms/schedules" : "/service-rooms/schedules";

  const [searchParams, setSearchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("info");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const filtersArray = useMemo(
    () => Array.from(searchParams.entries()).length,
    [searchParams],
  );
  const roomCapacity = Number(room?.room_capacity ?? room?.capacity ?? 0);
  const selectedStudentIds = selectedStudents.map((student) => student.id);

  const loadReferenceData = useCallback(async () => {
    try {
      const [coursesRes, institutionsRes] = await Promise.all([
        repository.courses.get(),
        repository.institutions.get(),
      ]);

      const coursesList = Array.isArray(coursesRes.data)
        ? coursesRes.data
        : coursesRes.data.items || [];
      const institutionsList = Array.isArray(institutionsRes.data)
        ? institutionsRes.data
        : institutionsRes.data.items || [];

      setCourses(coursesList);
      setInstitutions(institutionsList);

      STUDENT_FILTERS.find((filter) => filter.key === "course_id").options =
        coursesList.map((course) => ({ label: course.name, value: course.id }));
      STUDENT_FILTERS.find(
        (filter) => filter.key === "institution_id",
      ).options = institutionsList.map((institution) => ({
        label: institution.name,
        value: institution.id,
      }));
    } catch (e) {
      console.error("Erro ao carregar referências:", e);
      setCourses([]);
      setInstitutions([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const page = Math.floor(first / rows) + 1;
      const studentParams = { page, per_page: rows };

      searchParams.forEach((value, key) => {
        studentParams[key] = value;
      });

      const [roomRes, scheduleRes, studentsRes] = await Promise.all([
        isRoomContext
          ? repository.rooms.getById(roomId)
          : repository.serviceRooms.getById(roomId),
        repository.roomSchedules.get(roomId),
        repository.students.get(studentParams),
      ]);

      const days = scheduleRes.data?.days || [];
      const day = days.find((d) => d.dayOfWeek === dayOfWeek);
      const linkedIds =
        day?.periods?.find((p) => p.period === period)?.studentIds || [];
      if (linkedIds.length > 0) {
        const linkedRes = await Promise.all(
          linkedIds.map((id) => repository.students.getById(id)),
        );
        setLinkedStudents(linkedRes.map((r) => r.data));
      } else {
        setLinkedStudents([]);
      }

      setRoom(roomRes.data);
      setSchedule(scheduleRes.data);
      setTotalRecords(studentsRes.data.pagination?.total || 0);
      setStudents(
        (Array.isArray(studentsRes.data)
          ? studentsRes.data
          : studentsRes.data.items || []
        ).filter(
          (student) =>
            !(
              (scheduleRes.data?.days || [])
                .flatMap((day) => day.periods || [])
                .find(
                  (item) =>
                    item.dayOfWeek === dayOfWeek && item.period === period,
                )?.studentIds || []
            ).includes(student.id),
        ),
      );
    } catch {
      setRoom(null);
      setSchedule(null);
      setStudents([]);
      setLinkedStudents([]);
      setTotalRecords(0);
      setMessageSeverity("error");
      setMessage("Não foi possível carregar a tela de vinculação.");
    } finally {
      setLoading(false);
    }
  }, [dayOfWeek, first, isRoomContext, period, roomId, rows, searchParams]);

  useEffect(() => {
    const init = async () => {
      await Promise.allSettled([loadReferenceData(), loadData()]);
    };

    init();
  }, [loadData, loadReferenceData]);

  const currentPeriod = useMemo(() => {
    const days = schedule?.days || [];
    const day = days.find((item) => item.dayOfWeek === dayOfWeek);
    return (
      day?.periods?.find((item) => item.period === period) || { studentIds: [] }
    );
  }, [dayOfWeek, period, schedule]);

  const currentPeriodStudentIds = currentPeriod.studentIds || [];
  const currentLinkedCount = currentPeriodStudentIds.length;
  const remainingVacancies = Math.max(roomCapacity - currentLinkedCount, 0);
  const currentPeriodId = currentPeriod?.id || currentPeriod?.period_id;

  const handleApplyFilters = (appliedFilters) => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) params.append(key, value.join(","));
      else if (value !== null && value !== undefined && value !== "")
        params.append(key, value);
    });
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

  const studentTemplate = (rowData) => (
    <div>
      <strong>{rowData.name}</strong>
      <div className="slot-subtext">CPF: {rowData.cpf || "-"}</div>
    </div>
  );

  const courseTemplate = (rowData) => {
    const course = courses.find((item) => item.id === rowData.course_id);
    return course ? course.name : "-";
  };

  const institutionTemplate = (rowData) => {
    const institution = institutions.find(
      (item) => item.id === rowData.institution_id,
    );
    return institution ? institution.name : "-";
  };

  const selectedSummary = useMemo(() => {
    return selectedStudents.map((student) => student.name).join(", ");
  }, [selectedStudents]);

  const handleSelectionChange = (event) => {
    const nextSelection = event.value || [];
    if (nextSelection.length > remainingVacancies) {
      setMessageSeverity("warn");
      setMessage(
        `Selecione no máximo ${remainingVacancies} aluno(s) para este período.`,
      );
      return;
    }

    setMessage("");
    setSelectedStudents(nextSelection);
  };

  const linkSelectedStudents = async () => {
    if (!selectedStudents.length) return;
    if (selectedStudents.length > remainingVacancies) {
      setMessageSeverity("warn");
      setMessage(
        `Selecione no máximo ${remainingVacancies} aluno(s) para este período.`,
      );
      return;
    }

    try {
      setSaving(true);
      if (!currentPeriodId) {
        throw new Error("period_id indisponível para vínculo");
      }
      for (const student of selectedStudents) {
        // eslint-disable-next-line no-await-in-loop
        await repository.roomSchedules.addStudent(
          roomId,
          dayOfWeek,
          period,
          currentPeriodId,
          student.id,
        );
      }
      setMessageSeverity("success");
      setMessage("Alunos vinculados com sucesso.");
      setSelectedStudents([]);
      await loadData();
    } catch {
      setMessageSeverity("error");
      setMessage("Não foi possível vincular os alunos.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      setUnlinking(true);
      if (!currentPeriodId) {
        throw new Error("period_id indisponível para desvínculo");
      }
      await repository.roomSchedules.removeStudent(
        roomId,
        dayOfWeek,
        period,
        currentPeriodId,
        studentId,
      );
      setMessageSeverity("success");
      setMessage("Aluno desvinculado com sucesso.");
      await loadData();
    } catch {
      setMessageSeverity("error");
      setMessage("Não foi possível desvincular o aluno.");
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <div>
          <h1 className="assignment-title">
            {DAY_LABELS[dayOfWeek] || dayOfWeek} •{" "}
            {PERIOD_LABELS[period] || period}
          </h1>
          <p className="assignment-subtitle">
            {room?.name || "Sala"} • {currentLinkedCount}/
            {roomCapacity || currentLinkedCount} ocupados
            {roomCapacity > 0 ? ` • ${remainingVacancies} vagas livres` : ""}
          </p>
        </div>

        <div className="assignment-actions">
          <Button
            label="Histórico"
            icon="pi pi-clock"
            outlined
            onClick={() =>
              navigate(
                isRoomContext
                  ? "/rooms/schedules/history"
                  : "/service-rooms/schedules/history",
              )
            }
          />
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={filtersArray > 0 ? filtersArray : null}
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          <Button
            label="Voltar"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            onClick={() => navigate(basePath)}
          />
        </div>
      </div>

      {message && (
        <Message severity={messageSeverity} text={message} className="mb-3" />
      )}

      {loading ? (
        <div className="assignment-loading">
          <ProgressSpinner />
          <p>Carregando alunos...</p>
        </div>
      ) : (
        <div className="assignment-grid">
          <div className="assignment-panel surface-card p-3">
            <div className="panel-header">
              <h2>Alunos disponíveis</h2>
              <span>{totalRecords} resultados</span>
            </div>

            <DataTable
              value={students}
              dataKey="id"
              paginator
              first={first}
              rows={rows}
              totalRecords={totalRecords}
              rowsPerPageOptions={[10, 20, 50]}
              onPage={handlePaginationChange}
              selection={selectedStudents}
              onSelectionChange={handleSelectionChange}
              loading={saving}
              lazy
              emptyMessage="Nenhum aluno encontrado"
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
              />
              <Column field="id" header="ID" sortable />
              <Column
                field="name"
                header="Nome"
                body={studentTemplate}
                sortable
              />
              <Column field="cpf" header="CPF" />
              <Column header="Disciplina" body={courseTemplate} />
              <Column header="Instituição" body={institutionTemplate} />
              <Column field="semester" header="Semestre" />
            </DataTable>
          </div>

          <div className="assignment-panel surface-card p-3">
            <div className="panel-header">
              <h2>Resumo do período</h2>
            </div>

            <div className="summary-card">
              <div>
                <span>Vinculados</span>
                <strong>{currentLinkedCount}</strong>
              </div>
              <div>
                <span>Vagas livres</span>
                <strong>{remainingVacancies}</strong>
              </div>
              <div>
                <span>Selecionados</span>
                <strong>{selectedStudents.length}</strong>
              </div>
            </div>

            <div className="linked-list">
              <div className="linked-item">
                <div>
                  <strong>Alunos vinculados ({currentLinkedCount})</strong>
                  {currentLinkedCount === 0 ? (
                    <span className="text-sm text-color-secondary">
                      Nenhum aluno vinculado
                    </span>
                  ) : (
                    linkedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex align-items-center justify-content-between mt-2"
                      >
                        <div>
                          <span className="font-medium">{student.name}</span>
                          <div className="text-xs text-color-secondary">
                            CPF: {student.cpf || "-"}
                          </div>
                        </div>
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-text p-button-danger"
                          tooltip="Desvincular"
                          tooltipOptions={{ position: "left" }}
                          loading={unlinking}
                          onClick={() => handleRemoveStudent(student.id)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="linked-item">
                <div>
                  <strong>Selecionados para vincular</strong>
                  <span className="text-sm">
                    {selectedSummary || "Nenhum aluno selecionado"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                label="Vincular selecionados"
                icon="pi pi-check"
                loading={saving}
                disabled={
                  !selectedStudents.length ||
                  selectedStudents.length > remainingVacancies
                }
                onClick={linkSelectedStudents}
              />
              <Button
                label="Limpar seleção"
                icon="pi pi-times"
                severity="secondary"
                outlined
                disabled={!selectedStudents.length}
                onClick={() => setSelectedStudents([])}
              />
            </div>
          </div>
        </div>
      )}

      <FilterDrawer
        visible={filterVisible}
        onHide={() => setFilterVisible(false)}
        filters={STUDENT_FILTERS}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeCount={filtersArray}
      />
    </div>
  );
}
