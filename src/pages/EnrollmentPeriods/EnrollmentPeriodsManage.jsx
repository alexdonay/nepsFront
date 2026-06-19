import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Sidebar } from "primereact/sidebar";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import { repository } from "../../services/repository";
import { uploadPdfToCloudinary, validatePdfFile, openPdf } from "../../services/cloudinary";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

const getStudentDisciplineName = (student) =>
  student?.discipline?.name || student?.discipline_name || "-";

const getStudentInstitutionName = (student) =>
  student?.institution?.name || student?.institution_name || "-";

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

const normalizeScheduleValue = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

const getDayLabel = (value) => {
  const normalized = normalizeScheduleValue(value);
  return DAY_LABELS[normalized] || value || "-";
};

const getPeriodLabel = (value) => {
  const normalized = normalizeScheduleValue(value);
  return PERIOD_LABELS[normalized] || value || "-";
};

const FILTER_DEFAULTS = {
  slot_link: "without",
  name: "",
};

const FILTER_CONFIG = [
  {
    label: "Nome",
    key: "name",
    type: "text",
    placeholder: "Buscar por nome...",
  },
  {
    label: "Vínculo",
    key: "slot_link",
    type: "dropdown",
    options: [
      { label: "Sem vínculo", value: "without" },
      { label: "Com vínculo", value: "with" },
      { label: "Todos", value: "all" },
    ],
  },
];

const hasStudentSlotLink = (student) => {
  const directSignals = [
    student?.slot,
    student?.slots,
    student?.schedule,
    student?.schedules,
    student?.room_schedule,
    student?.room_schedules,
    student?.linked_slot,
    student?.linked_slots,
    student?.assigned_slot,
    student?.assigned_slots,
    student?.assignment,
    student?.assignments,
  ];

  if (student?.has_slot != null) return Boolean(student.has_slot);
  if (student?.has_schedule != null) return Boolean(student.has_schedule);
  if (student?.room_schedule_id != null) return true;
  if (student?.schedule_id != null) return true;
  if (student?.slot_id != null) return true;

  return directSignals.some((value) => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return Boolean(value);
  });
};

export default function EnrollmentPeriodsManage() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.period, {});
  const { id } = routeContext;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(null);
  const [students, setStudents] = useState([]);
  const [managingStudent, setManagingStudent] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [assignedSlots, setAssignedSlots] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [linkDialogVisible, setLinkDialogVisible] = useState(false);
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [selectedSlotForLink, setSelectedSlotForLink] = useState(null);
  const [studentDetailsVisible, setStudentDetailsVisible] = useState(false);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [linkForm, setLinkForm] = useState({
    directorFile: null,
    internship_start_date: "",
    internship_expected_end_date: "",
  });
  const [slotFilters, setSlotFilters] = useState({
    room_id: "",
    day_of_week: "",
    period: "",
    onlyWithVacancies: true,
  });
  const [roomMap, setRoomMap] = useState({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [studentFilters, setStudentFilters] = useState(FILTER_DEFAULTS);
  const [error, setError] = useState("");

  const loadPeriodStudents = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const { data } = await repository.periods.getById(id, {
        include: "students",
      });

      setPeriod(data || null);

      const rawStudents =
        data?.students || data?.student_ids || data?.studentIds || [];

      if (Array.isArray(rawStudents) && rawStudents.length > 0) {
        if (typeof rawStudents[0] === "object") {
          setStudents(rawStudents);
          return;
        }

        const studentResponses = await Promise.all(
          rawStudents.map((studentId) =>
            repository.students.getById(studentId),
          ),
        );
        setStudents(
          studentResponses.map((response) => response.data).filter(Boolean),
        );
        return;
      }

      setStudents([]);
    } catch (e) {
      console.error("Erro ao carregar alunos vinculados ao período:", e);
      setPeriod(null);
      setStudents([]);
      setError(
        "Não foi possível carregar os alunos vinculados a este período.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPeriodStudents();
  }, [loadPeriodStudents]);

  const buildRoomMap = useCallback(async () => {
    try {
      const { data } = await repository.rooms.get();
      const loadedRooms = data?.items || data || [];
      const mapped = loadedRooms.reduce((acc, room) => {
        acc[String(room.id)] = room;
        return acc;
      }, {});
      setRooms(loadedRooms);
      setRoomMap(mapped);
    } catch (e) {
      console.error("Erro ao carregar salas:", e);
      setRooms([]);
      setRoomMap({});
    }
  }, []);

  useEffect(() => {
    buildRoomMap();
  }, [buildRoomMap]);

  const openManageForStudent = async (student) => {
    setAssignedSlots([]);
    setSlotFilters({
      room_id: "",
      day_of_week: "",
      period: "",
      onlyWithVacancies: true,
    });

    let targetStudent = student;

    const extractSlots = (obj) => {
      if (obj?.slot) return Array.isArray(obj.slot) ? obj.slot : [obj.slot];
      if (Array.isArray(obj?.slots) && obj.slots.length > 0) return obj.slots;
      const slotKeys = [
        "schedule",
        "schedules",
        "room_schedule",
        "room_schedules",
        "linked_slot",
        "linked_slots",
        "assigned_slot",
        "assigned_slots",
      ];
      for (const key of slotKeys) {
        if (obj?.[key]) {
          const val = obj[key];
          return Array.isArray(val) ? val : [val];
        }
      }
      const roomId = obj?.room_id ?? obj?.roomId;
      const dayOfWeek = obj?.day_of_week ?? obj?.dayOfWeek;
      if (roomId && dayOfWeek && obj?.period) {
        return [
          { room_id: roomId, day_of_week: dayOfWeek, period: obj.period },
        ];
      }
      return [];
    };

    let studentSlots = extractSlots(student);

    if (studentSlots.length === 0) {
      try {
        const { data } = await repository.students.getById(student.id);
        targetStudent = data || student;
        studentSlots = extractSlots(targetStudent);
      } catch (e) {
        console.error("Erro ao carregar dados do aluno:", e);
      }
    }

    setManagingStudent(targetStudent);

    if (studentSlots.length > 0) {
      setAssignedSlots(studentSlots);
      const a0 = studentSlots[0];
      setSlotFilters({
        room_id: a0.room_id ?? a0.roomId ?? a0.room ?? "",
        day_of_week: a0.day_of_week || a0.dayOfWeek || "",
        period: a0.period || "",
        onlyWithVacancies: false,
      });
    }

    await loadAvailableSlots(targetStudent);

    if (studentSlots.length > 0) {
      setAvailableSlots((prev) => {
        const merged = [...prev];
        for (const as of studentSlots) {
          const exists = prev.some(
            (s) =>
              Number(s.room_id ?? s.roomId ?? s.room) ===
                Number(as.room_id ?? as.roomId ?? as.room) &&
              (s.day_of_week || s.dayOfWeek) ===
                (as.day_of_week || as.dayOfWeek) &&
              s.period === as.period,
          );
          if (!exists) {
            merged.push({
              id:
                as.id ??
                `assigned-${as.room_id}-${as.day_of_week}-${as.period}`,
              room_id: as.room_id ?? as.roomId ?? as.room,
              day_of_week: as.day_of_week || as.dayOfWeek,
              period: as.period,
              capacity: as.capacity ?? 0,
              occupied: as.occupied ?? 0,
              room_name: as.room_name || undefined,
              _isCurrentSlot: true,
            });
          }
        }
        return merged;
      });
    }
  };

  const clearManage = () => {
    setManagingStudent(null);
    setAvailableSlots([]);
    setAssignedSlots([]);
    setSlotFilters({
      room_id: "",
      day_of_week: "",
      period: "",
      onlyWithVacancies: true,
    });
  };

  const loadAvailableSlots = async (student) => {
    if (!student) return;

    setSlotsLoading(true);
    try {
      const { data } = await repository.rooms.getAvailableSlots({
        student_id: student.id,
      });

      const slots = data?.items || data || [];
      setAvailableSlots(slots);
    } catch (e) {
      console.error("Erro ao carregar horários disponíveis:", e);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleAssignStudentToSlot = async (slot) => {
    if (!managingStudent || !slot) return;
    try {
      const periodId = period?.id || id;
      if (!periodId) {
        console.error("periodId não definido");
        return;
      }
      await repository.roomSchedules.addStudent(
        slot.room_id,
        slot.day_of_week || slot.dayOfWeek,
        slot.period,
        periodId,
        managingStudent.id,
      );

      await loadPeriodStudents();
      clearManage();
      navigate("/periods/manage");
    } catch (e) {
      console.error("Erro ao vincular aluno ao horário:", e);
    }
  };

  const openLinkDialog = (slot) => {
    setSelectedSlotForLink(slot);
    setLinkForm({ directorFile: null, internship_start_date: "", internship_expected_end_date: "" });
    setLinkDialogVisible(true);
  };

  const closeLinkDialog = () => {
    setSelectedSlotForLink(null);
    setLinkForm({ directorFile: null, internship_start_date: "", internship_expected_end_date: "" });
    setLinkDialogVisible(false);
    setLinkSubmitting(false);
  };

  const handleLinkFormChange = (patch) => {
    setLinkForm((p) => ({ ...p, ...patch }));
  };

  const handleLinkSubmit = async () => {
    if (!managingStudent || !selectedSlotForLink) return;
    const validation = validatePdfFile(linkForm.directorFile);
    if (validation) {
      alert(validation);
      return;
    }

    try {
      setLinkSubmitting(true);

      const directorSignedPdfUrl = linkForm.directorFile
        ? await uploadPdfToCloudinary(linkForm.directorFile)
        : null;

      const updatePayload = {
        director_signed_pdf: directorSignedPdfUrl,
        internship_start_date: linkForm.internship_start_date || null,
        internship_expected_end_date:
          linkForm.internship_expected_end_date || null,
      };

      await repository.students.put(managingStudent.id, updatePayload);

      const periodId = period?.id || id;
      await repository.roomSchedules.addStudent(
        selectedSlotForLink.room_id,
        selectedSlotForLink.day_of_week || selectedSlotForLink.dayOfWeek,
        selectedSlotForLink.period,
        periodId,
        managingStudent.id,
      );

      await loadPeriodStudents();
      closeLinkDialog();
      clearManage();
      navigate("/periods/manage");
    } catch (e) {
      console.error("Erro ao vincular com dados do diretor:", e);
      alert("Erro ao vincular aluno. Veja o console para mais detalhes.");
      setLinkSubmitting(false);
    }
  };

  const openStudentDetails = async (student) => {
    if (!student?.id) return;
    setStudentDetailsVisible(true);
    setStudentDetailsLoading(true);

    try {
      const { data } = await repository.students.getById(student.id);
      setSelectedStudentDetails(data || student);
    } catch (e) {
      console.error("Erro ao carregar detalhes do aluno:", e);
      setSelectedStudentDetails(student);
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  const closeStudentDetails = () => {
    setStudentDetailsVisible(false);
    setSelectedStudentDetails(null);
    setStudentDetailsLoading(false);
  };

  const resolveStudentDocumentUrl = (student) =>
    getPdfDownloadUrl(
      student?.document_url ||
      student?.institution_document_url ||
      student?.documentUrl ||
      ""
    );

  const handleDownloadInstitutionDocument = async () => {
    const url = resolveStudentDocumentUrl(selectedStudentDetails);
    if (!url) return;
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = "documento-instituicao.pdf";
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleRemoveStudentFromSlot = async (slot) => {
    if (isRemoving) {
      return;
    }
    if (!managingStudent) {
      return;
    }
    const periodId = period?.id || id;
    if (!periodId) {
      console.error("periodId não definido");
      return;
    }
    if (!slot) {
      console.error("slot não definido para desvinculação");
      return;
    }

    setIsRemoving(true);
    try {
      await repository.roomSchedules.removeStudent(
        slot.room_id,
        slot.day_of_week || slot.dayOfWeek,
        slot.period,
        periodId,
        managingStudent.id,
      );
      await loadPeriodStudents();
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === managingStudent.id
            ? {
                ...student,
                slot: null,
                slots: [],
                schedule: null,
                schedules: [],
                room_schedule: null,
                room_schedules: [],
                linked_slot: null,
                linked_slots: [],
                assigned_slot: null,
                assigned_slots: [],
                assignment: null,
                assignments: [],
              }
            : student,
        ),
      );
      clearManage();
      window.location.replace("/periods/manage");
    } catch (e) {
      console.error("❌ Erro ao desvincular:", e);
      console.error("Status:", e.response?.status);
      console.error("Dados:", e.response?.data);
      setIsRemoving(false);
    }
  };

  const isSlotAssignedToStudent = (slot) => {
    // Checa assignedSlots primeiro
    if (Array.isArray(assignedSlots) && assignedSlots.length > 0) {
      return assignedSlots.some((as) => {
        const asRoom = as.room_id ?? as.roomId ?? as.room;
        const matchRoom = Number(slot.room_id) === Number(asRoom);
        const asDay = as.day_of_week || as.dayOfWeek;
        const matchDay = (slot.day_of_week || slot.dayOfWeek) === asDay;
        const asPeriod = as.period || as.period;
        const matchPeriod = slot.period === asPeriod;
        return matchRoom && matchDay && matchPeriod;
      });
    }

    // Fallback para `managingStudent.slot` quando não houver assignedSlots
    if (!managingStudent?.slot) return false;
    const matchRoom =
      Number(slot.room_id) === Number(managingStudent.slot.room_id);
    const matchDay =
      (slot.day_of_week || slot.dayOfWeek) ===
      (managingStudent.slot.day_of_week || managingStudent.slot.dayOfWeek);
    const matchPeriod = slot.period === managingStudent.slot.period;
    return matchRoom && matchDay && matchPeriod;
  };

  const filteredStudents = useMemo(() => {
    const nameQuery = (studentFilters.name || "").trim().toLowerCase();

    return students.filter((student) => {
      if (nameQuery) {
        const searchable = [
          student?.name,
          student?.cpf,
          getStudentDisciplineName(student),
          getStudentInstitutionName(student),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(nameQuery)) return false;
      }

      const hasSlotLink = hasStudentSlotLink(student);

      if (studentFilters.slot_link === "without") return !hasSlotLink;
      if (studentFilters.slot_link === "with") return hasSlotLink;
      return true;
    });
  }, [students, studentFilters]);

  const activeStudentFilterCount = useMemo(() => {
    let count = 0;
    if (studentFilters.slot_link === "without") count += 1;
    if (studentFilters.name?.trim()) count += 1;
    return count;
  }, [studentFilters]);

  const periodLabel = useMemo(() => {
    if (!period) return "";
    return `${period.name || "Período"} • ${period.start_date ? new Date(period.start_date).toLocaleDateString() : "-"} - ${period.end_date ? new Date(period.end_date).toLocaleDateString() : "-"}`;
  }, [period]);

  const formatDateValue = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString();
  };

  const renderSlotRoomName = (slot) =>
    slot.room_name ||
    roomMap[String(slot.room_id)]?.name ||
    slot.room_id ||
    "-";

  const renderVacancies = (slot) => {
    const capacity = Number(slot.capacity ?? 0);
    const occupied = Number(slot.occupied ?? 0);
    return Math.max(capacity - occupied, 0);
  };

  const filteredAvailableSlots = useMemo(() => {
    return (availableSlots || []).filter((slot) => {
      if (slotFilters.room_id) {
        if (String(slot.room_id) !== String(slotFilters.room_id)) return false;
      }

      if (slotFilters.day_of_week) {
        const slotDay = normalizeScheduleValue(
          slot.day_of_week || slot.dayOfWeek,
        );
        if (slotDay !== normalizeScheduleValue(slotFilters.day_of_week))
          return false;
      }

      if (slotFilters.period) {
        const slotPeriod = normalizeScheduleValue(slot.period);
        if (slotPeriod !== normalizeScheduleValue(slotFilters.period))
          return false;
      }

      if (slotFilters.onlyWithVacancies) {
        if (renderVacancies(slot) <= 0) return false;
      }

      return true;
    });
  }, [availableSlots, slotFilters]);

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="text-xl font-bold m-0">Gestão do Período</h2>
          <small className="text-600">{periodLabel}</small>
        </div>
        <div className="flex gap-2">
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={
              activeStudentFilterCount > 0 ? activeStudentFilterCount : null
            }
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          <Button
            label="Voltar"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            onClick={() => navigate("/periods")}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 mb-3 bg-red-100 text-red-700 border-round">
          {error}
        </div>
      )}

      <div className="surface-100 p-3 border-round mb-3">
        <strong>Alunos exibidos:</strong> {filteredStudents.length} de{" "}
        {students.length}
      </div>

      <div className="surface-100 p-3 border-round mb-3">
        <strong>Salas carregadas:</strong> {rooms.length}
        <div className="mt-2 flex flex-wrap gap-2">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <span key={room.id} className="surface-0 border-round px-3 py-2">
                {room.name} • {room.room_capacity} vagas
              </span>
            ))
          ) : (
            <span className="text-600">Nenhuma sala retornada pela API.</span>
          )}
        </div>
      </div>

      <DataTable
        value={filteredStudents}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage="Nenhum aluno encontrado com o filtro atual"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="cpf" header="CPF" />
        <Column header="Disciplina" body={getStudentDisciplineName} />
        <Column header="Instituição" body={getStudentInstitutionName} />
        <Column field="semester" header="Semestre" />
        <Column
          header="Ações"
          body={(rowData) => (
            <div className="flex gap-2 flex-wrap">
              <Button
                icon="pi pi-eye"
                onClick={() => openStudentDetails(rowData)}
                severity="info"
                className="p-button-text"
                tooltip="Visualizar dados do aluno"
                tooltipOptions={{ position: "top" }}
              />
              <Button
                icon="pi pi-calendar-plus"
                onClick={() => openManageForStudent(rowData)}
                severity="secondary"
                className="p-button-text"
                tooltip="Gerir horário"
                tooltipOptions={{ position: "top" }}
              />
            </div>
          )}
        />
      </DataTable>

      <Sidebar
        visible={!!managingStudent}
        onHide={clearManage}
        fullScreen
        showCloseIcon
        dismissable={false}
        blockScroll
        className="p-sidebar-full"
      >
        <div className="p-4 h-full flex flex-column">
          <div className="flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="m-0">Horários disponíveis</h3>
              <small className="text-600">
                {managingStudent
                  ? `${managingStudent.name} • ${getStudentInstitutionName(managingStudent)}`
                  : "Selecione um aluno para carregar os horários disponíveis."}
              </small>
            </div>

            {managingStudent && (
              <Button
                label="Limpar seleção"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={clearManage}
              />
            )}
          </div>

          <div className="surface-100 p-3 border-round mb-3">
            <strong>Horários disponíveis:</strong> {availableSlots.length}
          </div>

          <div className="p-fluid grid grid-nogutter gap-2 mb-3">
            <div className="col-12 md:col-4">
              <label className="p-mr-2">Sala</label>
              <Dropdown
                value={slotFilters.room_id}
                options={Object.values(roomMap).map((r) => ({
                  label: r.name || r.room_name || r.id,
                  value: r.id,
                }))}
                onChange={(e) =>
                  setSlotFilters((p) => ({ ...p, room_id: e.value }))
                }
                placeholder="Todas"
                showClear
              />
            </div>

            <div className="col-6 md:col-3">
              <label className="p-mr-2">Dia</label>
              <Dropdown
                value={slotFilters.day_of_week}
                options={Object.keys(DAY_LABELS).map((k) => ({
                  label: DAY_LABELS[k],
                  value: k,
                }))}
                onChange={(e) =>
                  setSlotFilters((p) => ({ ...p, day_of_week: e.value }))
                }
                placeholder="Todos"
                showClear
              />
            </div>

            <div className="col-6 md:col-3">
              <label className="p-mr-2">Período</label>
              <Dropdown
                value={slotFilters.period}
                options={Object.keys(PERIOD_LABELS).map((k) => ({
                  label: PERIOD_LABELS[k],
                  value: k,
                }))}
                onChange={(e) =>
                  setSlotFilters((p) => ({ ...p, period: e.value }))
                }
                placeholder="Todos"
                showClear
              />
            </div>

            <div className="col-12 md:col-2 flex align-items-center">
              <div className="mr-2">Apenas com vagas</div>
              <InputSwitch
                checked={slotFilters.onlyWithVacancies}
                onChange={(e) =>
                  setSlotFilters((p) => ({ ...p, onlyWithVacancies: e.value }))
                }
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <DataTable
              value={filteredAvailableSlots}
              loading={slotsLoading}
              paginator
              rows={8}
              emptyMessage={
                managingStudent
                  ? "Nenhum horário disponível para este aluno."
                  : "Selecione um aluno."
              }
            >
              <Column header="Sala" body={renderSlotRoomName} />
              <Column
                header="Dia"
                body={(slot) => getDayLabel(slot.day_of_week)}
              />
              <Column
                header="Período"
                body={(slot) => getPeriodLabel(slot.period)}
              />
              <Column header="Capacidade" field="capacity" />
              <Column header="Ocupados" field="occupied" />
              <Column header="Vagas" body={(s) => renderVacancies(s)} />
              <Column
                header="Ação"
                body={(s) => {
                  const isAssigned = isSlotAssignedToStudent(s);
                  return isAssigned ? (
                    <Button
                      label="Desvincular"
                      icon="pi pi-unlink"
                      onClick={() => handleRemoveStudentFromSlot(s)}
                      severity="warning"
                      disabled={isRemoving}
                      loading={isRemoving}
                    />
                  ) : (
                    <Button
                      label="Vincular"
                      icon="pi pi-link"
                      onClick={() => openLinkDialog(s)}
                      disabled={renderVacancies(s) <= 0}
                    />
                  );
                }}
              />
            </DataTable>
          </div>
          <Dialog
            header="Vincular aluno — dados do documento"
            visible={linkDialogVisible}
            style={{ width: "40rem" }}
            onHide={closeLinkDialog}
            blockScroll
            footer={
              <div>
                <Button
                  label="Cancelar"
                  onClick={closeLinkDialog}
                  className="p-button-text"
                />
                <Button
                  label="Confirmar vínculo"
                  onClick={handleLinkSubmit}
                  disabled={linkSubmitting}
                  loading={linkSubmitting}
                />
              </div>
            }
          >
            <div className="p-fluid">
              <div className="surface-100 p-3 border-round mb-3">
                <label className="font-medium">Arquivo assinado pelo diretor (PDF)</label>
                <div
                  className="p-d-flex p-ai-center p-jc-center border-dashed p-p-3 mt-2"
                  style={{ minHeight: 120, cursor: "pointer", background: "var(--surface-b)" }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer?.files?.[0];
                    if (f) handleLinkFormChange({ directorFile: f });
                  }}
                  onClick={() => document.getElementById("director-file-input")?.click()}
                >
                  <div className="text-center">
                    <i className="pi pi-file-pdf" style={{ fontSize: 36 }} />
                    <div className="mt-2">Arraste o PDF aqui ou clique para selecionar</div>
                    {linkForm.directorFile && (
                      <div className="mt-2 text-sm">
                        <strong>{linkForm.directorFile.name}</strong> • {(linkForm.directorFile.size / 1024).toFixed(0)} KB
                        <Button
                          icon="pi pi-times"
                          className="p-button-text p-button-danger ml-2"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleLinkFormChange({ directorFile: null });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <input
                  id="director-file-input"
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => handleLinkFormChange({ directorFile: e.target.files[0] })}
                />
                <small className="text-600">Tamanho máximo: 5MB. Formato: PDF.</small>
              </div>

              <div className="grid">
                <div className="col-12 md:col-6">
                  <label className="font-medium">Data de início do estágio</label>
                  <Calendar
                    className="w-full"
                    value={linkForm.internship_start_date ? new Date(linkForm.internship_start_date) : null}
                    onChange={(e) => {
                      const d = e.value ? new Date(e.value) : null;
                      handleLinkFormChange({ internship_start_date: d ? d.toISOString().slice(0, 10) : "" });
                    }}
                    dateFormat="yy-mm-dd"
                    showIcon
                    placeholder="AAAA-MM-DD"
                  />
                </div>

                <div className="col-12 md:col-6">
                  <label className="font-medium">Data prevista de fim do estágio</label>
                  <Calendar
                    className="w-full"
                    value={linkForm.internship_expected_end_date ? new Date(linkForm.internship_expected_end_date) : null}
                    onChange={(e) => {
                      const d = e.value ? new Date(e.value) : null;
                      handleLinkFormChange({ internship_expected_end_date: d ? d.toISOString().slice(0, 10) : "" });
                    }}
                    dateFormat="yy-mm-dd"
                    showIcon
                    placeholder="AAAA-MM-DD"
                  />
                </div>
              </div>
            </div>
          </Dialog>
        </div>
      </Sidebar>

      <Dialog
        header="Dados do aluno"
        visible={studentDetailsVisible}
        style={{ width: "46rem", maxWidth: "96vw" }}
        onHide={closeStudentDetails}
        blockScroll
      >
        {studentDetailsLoading ? (
          <div className="p-3 text-600">Carregando dados do aluno...</div>
        ) : (
          <div className="p-fluid">
            <div className="surface-100 p-3 border-round mb-3">
              <h4 className="m-0 mb-3">Dados principais</h4>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">Nome</small>
                  <strong>{selectedStudentDetails?.name || "-"}</strong>
                </div>
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">CPF</small>
                  <strong>{selectedStudentDetails?.cpf || "-"}</strong>
                </div>
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">E-mail</small>
                  <strong>{selectedStudentDetails?.email || "-"}</strong>
                </div>
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">Telefone</small>
                  <strong>{selectedStudentDetails?.phone || "-"}</strong>
                </div>
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">Instituição</small>
                  <strong>{getStudentInstitutionName(selectedStudentDetails)}</strong>
                </div>
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">Curso/Disciplina</small>
                  <strong>{getStudentDisciplineName(selectedStudentDetails)}</strong>
                </div>
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">Semestre</small>
                  <strong>{selectedStudentDetails?.semester || "-"}</strong>
                </div>
              </div>
            </div>

            <div className="surface-100 p-3 border-round mb-3">
              <h4 className="m-0 mb-3">Dados de estágio</h4>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">Início do estágio</small>
                  <strong>
                    {formatDateValue(selectedStudentDetails?.internship_start_date)}
                  </strong>
                </div>
                <div className="col-12 md:col-6">
                  <small className="text-600 block mb-1">Previsão de fim</small>
                  <strong>
                    {formatDateValue(
                      selectedStudentDetails?.internship_expected_end_date,
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="surface-100 p-3 border-round">
              <h4 className="m-0 mb-3">Documento enviado pela instituição</h4>
              {resolveStudentDocumentUrl(selectedStudentDetails) ? (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    label="Abrir documento"
                    icon="pi pi-external-link"
                    onClick={() => openPdf(resolveStudentDocumentUrl(selectedStudentDetails))}
                    outlined
                  />
                  <Button
                    label="Download"
                    icon="pi pi-download"
                    onClick={handleDownloadInstitutionDocument}
                    severity="contrast"
                  />
                </div>
              ) : (
                <span className="text-600">Nenhum documento disponível.</span>
              )}
            </div>
          </div>
        )}
      </Dialog>

      <FilterDrawer
        visible={filterVisible}
        onHide={() => setFilterVisible(false)}
        filters={FILTER_CONFIG}
        onApply={(appliedFilters) => {
          setStudentFilters((prev) => ({
            ...prev,
            ...appliedFilters,
          }));
          setFilterVisible(false);
        }}
        onClear={() => {
          setStudentFilters(FILTER_DEFAULTS);
        }}
        activeCount={activeStudentFilterCount}
        initialValues={FILTER_DEFAULTS}
      />
    </div>
  );
}
