import "./InternshipsSchedulesList.css";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const DAY_LABELS = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const DAY_ABBR = {
  MONDAY: "Seg",
  TUESDAY: "Ter",
  WEDNESDAY: "Qua",
  THURSDAY: "Qui",
  FRIDAY: "Sex",
  SATURDAY: "Sáb",
  SUNDAY: "Dom",
};

const PERIOD_ORDER = ["MORNING", "AFTERNOON", "EVENING"];

const PERIODS = {
  MORNING:   { label: "Manhã",    icon: "pi-sun",   color: "info" },
  AFTERNOON: { label: "Tarde",    icon: "pi-cloud", color: "warning" },
  EVENING:   { label: "Noite",    icon: "pi-moon",  color: "secondary" },
};

export default function ServiceSchedulesList() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoomContext = location.pathname.startsWith("/rooms/");
  const roomContext = getRouteContext(
    isRoomContext ? ROUTE_CONTEXT_KEYS.room : ROUTE_CONTEXT_KEYS.serviceRoom,
    {},
  );
  const roomId = roomContext.id;

  const [room, setRoom] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Dialog de vínculo ──────────────────────────────────────────────────────
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);   // "MONDAY"
  const [selectedPeriod, setSelectedPeriod] = useState(null); // "MORNING"

  const [students, setStudents] = useState([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsFirst, setStudentsFirst] = useState(0);
  const [studentsRows] = useState(10);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [dialogLoading, setDialogLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");
  const [dialogMsgSev, setDialogMsgSev] = useState("info");
  const [disciplines, setDisciplines] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  // filtros da tabela de alunos disponíveis
  const [filterName, setFilterName] = useState("");
  const [filterCpf, setFilterCpf] = useState("");
  const [filterInstitution, setFilterInstitution] = useState(null);
  const [filterDiscipline, setFilterDiscipline] = useState(null);
  const searchTimer = useRef(null);

  // ── Carrega agenda ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadRoom(), loadSchedule()]);
    } finally {
      setLoading(false);
    }
  }, [roomId, isRoomContext]);

  const loadRoom = async () => {
    try {
      if (!roomId) return setRoom(null);
      const { data } = isRoomContext
        ? await repository.rooms.getById(roomId)
        : await repository.serviceRooms.getById(roomId);
      setRoom(data);
    } catch { setRoom(null); }
  };

  const loadSchedule = async () => {
    try {
      const { data } = await repository.roomSchedules.get(roomId);
      setSchedule(data);
    } catch { setSchedule(null); }
  };

  useEffect(() => { loadData(); }, [loadData]);

  // ── Dados para o Dialog ────────────────────────────────────────────────────
  const loadDialogData = useCallback(async (day, period, page = 0, filters = {}) => {
    if (!roomId || !day || !period) return;
    try {
      setDialogLoading(true);
      setDialogMsg("");

      const pageNum = Math.floor(page / studentsRows) + 1;
      const studentParams = { page: pageNum, per_page: studentsRows };
      if (filters.name)           studentParams.name           = filters.name;
      if (filters.cpf)            studentParams.cpf            = filters.cpf;
      if (filters.institution_id) studentParams.institution_id = filters.institution_id;
      if (filters.discipline_id)  studentParams.discipline_id  = filters.discipline_id;

      const [scheduleRes, studentsRes, discRes, instRes] = await Promise.all([
        repository.roomSchedules.get(roomId),
        repository.students.get(studentParams),
        repository.disciplines.get(),
        repository.institutions.get(),
      ]);

      const updatedSchedule = scheduleRes.data;
      setSchedule(updatedSchedule);

      const days = updatedSchedule?.days || [];
      const dayData = days.find((d) => d.dayOfWeek === day);
      const periodData = dayData?.periods?.find((p) => p.period === period);
      const linkedIds = periodData?.studentIds || [];

      if (linkedIds.length > 0) {
        const results = await Promise.all(linkedIds.map((id) => repository.students.getById(id)));
        setLinkedStudents(results.map((r) => r.data));
      } else {
        setLinkedStudents([]);
      }

      const discList = Array.isArray(discRes.data) ? discRes.data : (discRes.data.items || []);
      const instList = Array.isArray(instRes.data) ? instRes.data : (instRes.data.items || []);
      setDisciplines(discList);
      setInstitutions(instList);

      const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data.items || []);
      setStudents(allStudents.filter((s) => !linkedIds.includes(s.id)));
      setStudentsTotal(studentsRes.data.pagination?.total || 0);
    } catch {
      setDialogMsg("Não foi possível carregar os dados.");
      setDialogMsgSev("error");
    } finally {
      setDialogLoading(false);
    }
  }, [roomId, studentsRows]);

  const openDialog = (day, period) => {
    setSelectedDay(day);
    setSelectedPeriod(period);
    setSelectedStudents([]);
    setDialogMsg("");
    setFilterName("");
    setFilterCpf("");
    setFilterInstitution(null);
    setFilterDiscipline(null);
    setStudentsFirst(0);
    setDialogVisible(true);
    loadDialogData(day, period, 0, {});
  };

  const currentFilters = useCallback(() => ({
    name: filterName || undefined,
    cpf: filterCpf || undefined,
    institution_id: filterInstitution || undefined,
    discipline_id: filterDiscipline || undefined,
  }), [filterName, filterCpf, filterInstitution, filterDiscipline]);

  const triggerSearch = (overrides = {}) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setStudentsFirst(0);
      loadDialogData(selectedDay, selectedPeriod, 0, { ...currentFilters(), ...overrides });
    }, 350);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setSelectedDay(null);
    setSelectedPeriod(null);
    setSelectedStudents([]);
    loadSchedule();
  };

  // ── Períodos do dia selecionado ────────────────────────────────────────────
  const currentPeriodData = useMemo(() => {
    if (!selectedDay || !selectedPeriod || !schedule) return { studentIds: [] };
    const day = (schedule.days || []).find((d) => d.dayOfWeek === selectedDay);
    return day?.periods?.find((p) => p.period === selectedPeriod) || { studentIds: [] };
  }, [schedule, selectedDay, selectedPeriod]);

  const roomCapacity = Number(room?.room_capacity ?? room?.capacity ?? 0);
  const linkedCount = (currentPeriodData.studentIds || []).length;
  const remaining = roomCapacity > 0 ? Math.max(roomCapacity - linkedCount, 0) : Infinity;
  const currentPeriodId = currentPeriodData?.id || currentPeriodData?.period_id;

  const handleLink = async () => {
    if (!selectedStudents.length) return;
    if (selectedStudents.length > remaining) {
      setDialogMsgSev("warn");
      setDialogMsg(`Selecione no máximo ${remaining} aluno(s).`);
      return;
    }
    try {
      setSaving(true);
      if (!currentPeriodId) throw new Error("period_id indisponível");
      for (const student of selectedStudents) {
        await repository.roomSchedules.addStudent(roomId, selectedDay, selectedPeriod, currentPeriodId, student.id);
      }
      setDialogMsgSev("success");
      setDialogMsg("Alunos vinculados com sucesso.");
      setSelectedStudents([]);
      await loadDialogData(selectedDay, selectedPeriod, studentsFirst);
    } catch {
      setDialogMsgSev("error");
      setDialogMsg("Não foi possível vincular os alunos.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async (studentId) => {
    try {
      setUnlinking(true);
      if (!currentPeriodId) throw new Error("period_id indisponível");
      await repository.roomSchedules.removeStudent(roomId, selectedDay, selectedPeriod, currentPeriodId, studentId);
      setDialogMsgSev("success");
      setDialogMsg("Aluno desvinculado.");
      await loadDialogData(selectedDay, selectedPeriod, studentsFirst);
    } catch {
      setDialogMsgSev("error");
      setDialogMsg("Não foi possível desvincular.");
    } finally {
      setUnlinking(false);
    }
  };

  // ── Grid de dias ───────────────────────────────────────────────────────────
  const days = useMemo(() => {
    const apiDays = schedule?.days || [];
    const normalized = new Map(apiDays.map((day) => [day.dayOfWeek, day]));
    return DAY_ORDER.map((dayOfWeek) => {
      const day = normalized.get(dayOfWeek);
      const periods = PERIOD_ORDER.map((periodKey) => {
        const period = day?.periods?.find((item) => item.period === periodKey) || {
          period: periodKey,
          studentIds: [],
        };
        return { ...period, periodLabel: PERIODS[periodKey].label, icon: PERIODS[periodKey].icon, color: PERIODS[periodKey].color };
      });
      return { dayOfWeek, dayLabel: DAY_LABELS[dayOfWeek], dayAbbr: DAY_ABBR[dayOfWeek], periods };
    });
  }, [schedule]);

  const disciplineLabel = (id) => disciplines.find((d) => d.id === id)?.name || "-";
  const institutionLabel = (id) => institutions.find((i) => i.id === id)?.name || "-";

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div>
          <h1 className="schedule-title">Agenda da Sala</h1>
          {room && (
            <p className="schedule-subtitle">
              Sala: <strong>{room.name}</strong> • Capacidade: <strong>{roomCapacity || "-"}</strong> alunos
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button label="Atualizar" icon="pi pi-refresh" outlined onClick={loadData} />
          <Button
            label="Voltar"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            onClick={() => navigate(isRoomContext ? "/rooms" : "/rooms")}
          />
        </div>
      </div>

      {loading ? (
        <div className="schedule-loading">
          <ProgressSpinner />
          <p>Carregando agenda...</p>
        </div>
      ) : (
        <div className="week-schedule-grid">
          {days.map((day) => (
            <div key={day.dayOfWeek} className="day-card surface-card">
              <div className="day-card-header">
                <h3 className="day-name">{day.dayLabel}</h3>
                <span className="day-abbr">{day.dayAbbr}</span>
              </div>

              <div className="shifts-container">
                {day.periods.map((period) => {
                  const studentCount = period.studentIds?.length || 0;
                  const vacancies = roomCapacity > 0 ? Math.max(roomCapacity - studentCount, 0) : null;
                  const isFilled = studentCount > 0;

                  return (
                    <div
                      key={`${day.dayOfWeek}-${period.period}`}
                      className={`shift-card p-3 border-round cursor-pointer transition shift-${isFilled ? "filled" : "empty"} shift-${period.color}`}
                      onClick={() => openDialog(day.dayOfWeek, period.period)}
                      title="Clique para gerenciar alunos neste turno"
                    >
                      <div className="shift-header flex align-items-center gap-2 mb-2">
                        <i className={`pi ${period.icon}`}></i>
                        <span className="shift-label font-semibold text-sm">{period.periodLabel}</span>
                      </div>

                      <div className="shift-student">
                        <div className="student-status font-medium text-color text-sm">
                          {isFilled ? (
                            <>
                              <i className="pi pi-check-circle text-green-500 mr-2"></i>
                              {studentCount} aluno{studentCount > 1 ? "s" : ""} vinculado{studentCount > 1 ? "s" : ""}
                            </>
                          ) : (
                            <>
                              <i className="pi pi-user-plus text-blue-400 mr-2"></i>
                              Clique para vincular
                            </>
                          )}
                        </div>
                        {roomCapacity > 0 && (
                          <div className="student-meta text-xs text-color-secondary mt-2">
                            {studentCount}/{roomCapacity} ocupados • {vacancies} vaga{vacancies !== 1 ? "s" : ""} livre{vacancies !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Drawer: Gerenciar alunos do turno ────────────────────────────── */}
      <Sidebar
        visible={dialogVisible}
        onHide={closeDialog}
        fullScreen
        header={
          <div className="flex align-items-center gap-3">
            <span className="font-bold text-lg">
              {selectedDay && selectedPeriod
                ? `${DAY_LABELS[selectedDay]} — ${PERIODS[selectedPeriod]?.label}`
                : "Gerenciar alunos"}
            </span>
            {room && (
              <span className="text-color-secondary text-sm">
                Sala: {room.name}
              </span>
            )}
          </div>
        }
      >
        {dialogMsg && <Message severity={dialogMsgSev} text={dialogMsg} className="mb-3 w-full" />}

        {dialogLoading ? (
          <div className="flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
            <ProgressSpinner />
          </div>
        ) : (
          <div className="grid">
            {/* Coluna: alunos disponíveis */}
            <div className="col-12 md:col-7">
              <div className="surface-card border-round p-3">
                <div className="flex justify-content-between align-items-center mb-3">
                  <h3 className="m-0 text-base font-semibold">Alunos disponíveis</h3>
                  <span className="text-sm text-color-secondary">{studentsTotal} encontrados</span>
                </div>

                {/* Filtros */}
                <div className="grid mb-3">
                  <div className="col-12 md:col-6">
                    <span className="p-input-icon-left w-full">
                      <i className="pi pi-search" />
                      <InputText
                        value={filterName}
                        onChange={(e) => { setFilterName(e.target.value); triggerSearch({ name: e.target.value }); }}
                        placeholder="Buscar por nome..."
                        className="w-full"
                      />
                    </span>
                  </div>
                  <div className="col-12 md:col-6">
                    <InputText
                      value={filterCpf}
                      onChange={(e) => { setFilterCpf(e.target.value); triggerSearch({ cpf: e.target.value }); }}
                      placeholder="CPF..."
                      className="w-full"
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <Dropdown
                      value={filterInstitution}
                      options={institutions.map((i) => ({ label: i.name, value: i.id }))}
                      onChange={(e) => { setFilterInstitution(e.value); triggerSearch({ institution_id: e.value }); }}
                      placeholder="Instituição"
                      className="w-full"
                      showClear
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <Dropdown
                      value={filterDiscipline}
                      options={disciplines.map((d) => ({ label: d.name, value: d.id }))}
                      onChange={(e) => { setFilterDiscipline(e.value); triggerSearch({ discipline_id: e.value }); }}
                      placeholder="Disciplina"
                      className="w-full"
                      showClear
                    />
                  </div>
                </div>

                <DataTable
                  value={students}
                  dataKey="id"
                  paginator
                  first={studentsFirst}
                  rows={studentsRows}
                  totalRecords={studentsTotal}
                  lazy
                  onPage={(e) => { setStudentsFirst(e.first); loadDialogData(selectedDay, selectedPeriod, e.first, currentFilters()); }}
                  selection={selectedStudents}
                  onSelectionChange={(e) => {
                    if (e.value.length > remaining) {
                      setDialogMsgSev("warn");
                      setDialogMsg(`Máximo de ${remaining} aluno(s) permitido.`);
                      return;
                    }
                    setDialogMsg("");
                    setSelectedStudents(e.value);
                  }}
                  loading={dialogLoading}
                  emptyMessage="Nenhum aluno disponível"
                  size="small"
                >
                  <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                  <Column
                    header="Nome"
                    body={(r) => (
                      <div>
                        <strong>{r.name}</strong>
                        <div className="text-xs text-color-secondary">{r.cpf || "-"}</div>
                      </div>
                    )}
                  />
                  <Column header="Disciplina" body={(r) => disciplineLabel(r.discipline_id)} />
                  {!isInternship && <Column header="Instituição" body={(r) => institutionLabel(r.institution_id)} />}
                  <Column field="semester" header="Semestre" style={{ width: "6rem" }} />
                </DataTable>

                <div className="flex gap-2 mt-3">
                  <Button
                    label={`Vincular${selectedStudents.length ? ` (${selectedStudents.length})` : ""}`}
                    icon="pi pi-check"
                    loading={saving}
                    disabled={!selectedStudents.length || selectedStudents.length > remaining}
                    onClick={handleLink}
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

            {/* Coluna: resumo e vinculados */}
            <div className="col-12 md:col-5">
              <div className="surface-card border-round p-3">
                {/* Resumo */}
                <div className="grid mb-3">
                  <div className="col-4 text-center">
                    <div className="text-2xl font-bold text-primary">{linkedCount}</div>
                    <div className="text-xs text-color-secondary">Vinculados</div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {remaining === Infinity ? "∞" : remaining}
                    </div>
                    <div className="text-xs text-color-secondary">Vagas livres</div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">{selectedStudents.length}</div>
                    <div className="text-xs text-color-secondary">Selecionados</div>
                  </div>
                </div>

                <h3 className="text-base font-semibold mb-2">Alunos vinculados</h3>
                {linkedStudents.length === 0 ? (
                  <p className="text-sm text-color-secondary">Nenhum aluno vinculado neste turno.</p>
                ) : (
                  <div className="flex flex-column gap-2">
                    {linkedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex align-items-center justify-content-between p-2 border-1 border-round surface-border"
                      >
                        <div>
                          <div className="font-medium text-sm">{student.name}</div>
                          <div className="text-xs text-color-secondary">{student.cpf || "-"}</div>
                        </div>
                        <Button
                          icon="pi pi-trash"
                          text
                          severity="danger"
                          tooltip="Desvincular"
                          tooltipOptions={{ position: "left" }}
                          loading={unlinking}
                          onClick={() => handleUnlink(student.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  );
}
