import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

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

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function EnrollmentPeriodsHistory() {
  const periodContext = getRouteContext(ROUTE_CONTEXT_KEYS.period, {});
  const roomContext = getRouteContext(ROUTE_CONTEXT_KEYS.room, {});
  const scheduleContext = getRouteContext(ROUTE_CONTEXT_KEYS.schedule, {});
  const id = periodContext.id;
  const roomId = roomContext.id || scheduleContext.roomId;
  const dayOfWeek = scheduleContext.dayOfWeek;
  const period = scheduleContext.period;
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [periodName, setPeriodName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [scheduleLabel, setScheduleLabel] = useState("");
  const [error, setError] = useState("");
  const isScheduleHistory = Boolean(roomId && dayOfWeek && period);
  const isRoomHistory = Boolean(roomId && !isScheduleHistory);
  const isRoomContext = Boolean(roomContext.id);
  const currentId = roomId || id;

  const title = useMemo(() => {
    if (isScheduleHistory) return "Histórico do Schedule";
    if (isRoomHistory) return "Histórico da Sala";
    return "Histórico do Período";
  }, [isRoomHistory, isScheduleHistory]);

  const loadHistory = useCallback(async () => {
    if (!currentId) return;

    try {
      setLoading(true);
      setError("");

      const page = Math.floor(first / rows) + 1;
      let data;

      if (isScheduleHistory) {
        const { data: scheduleData } = await repository.roomSchedules.get(
          roomId,
        );
        const days = scheduleData?.days || [];
        const currentDay = days.find((item) => item.dayOfWeek === dayOfWeek);
        const currentPeriod = currentDay?.periods?.find(
          (item) => item.period === period,
        );
        const scheduleId =
          currentPeriod?.id ??
          currentPeriod?.schedule_id ??
          currentPeriod?.scheduleId ??
          null;

        if (!scheduleId) {
          throw new Error("schedule_id ausente na agenda da sala");
        }

        setScheduleLabel(
          `${DAY_LABELS[dayOfWeek] || dayOfWeek} • ${PERIOD_LABELS[period] || period}`,
        );

        const response = await repository.histories.getBySchedule(scheduleId, {
          page,
          per_page: rows,
        });
        data = response.data;
      } else if (isRoomHistory) {
        const response = await repository.histories.getByRoom(currentId, {
          page,
          per_page: rows,
        });
        data = response.data;
      } else {
        const response = await repository.histories.getByPeriod(currentId, {
          page,
          per_page: rows,
        });
        data = response.data;
      }

      const items = data?.items || [];
      setHistory(items);
      setTotalRecords(data?.pagination?.total ?? items.length);

      if (items.length > 0) {
        setPeriodName(items[0]?.period?.name || "");
        setRoomName(items[0]?.room_id ? `Sala ${items[0].room_id}` : "");
      }
    } catch (err) {
      setHistory([]);
      setTotalRecords(0);
      setError(
        isScheduleHistory
          ? "Não foi possível carregar o histórico deste schedule."
          : isRoomHistory
          ? "Não foi possível carregar o histórico desta sala."
          : "Não foi possível carregar o histórico deste período.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentId, dayOfWeek, first, isRoomHistory, isScheduleHistory, period, roomId, rows]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handlePage = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const statusTemplate = (row) =>
    row.end_date ? "Encerrado" : "Vínculo ativo";

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3 gap-3">
        <div>
          <h2 className="text-xl font-bold m-0">{title}</h2>
          <p className="text-600 m-0 mt-2">
            {isScheduleHistory
              ? scheduleLabel || `${roomId} • ${dayOfWeek} • ${period}`
              : isRoomHistory
              ? roomName || `Sala ID: ${roomId}`
              : periodName || `Período ID: ${id}`}
          </p>
        </div>
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          severity="secondary"
          onClick={() =>
            navigate(
              isScheduleHistory
                ? isRoomContext
                  ? "/rooms/schedules"
                  : "/service-rooms/schedules"
                : isRoomHistory
                  ? isRoomContext
                    ? "/rooms/schedules"
                    : "/service-rooms/schedules"
                  : "/periods",
            )
          }
        />
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 border-round">
          {error}
        </div>
      )}

      <DataTable
        value={history}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePage}
        loading={loading}
        lazy
        emptyMessage="Nenhum registro de histórico encontrado"
      >
        <Column
          field="student.name"
          header="Aluno"
          body={(row) => row?.student?.name || "-"}
        />
        <Column
          field="student.cpf"
          header="CPF"
          body={(row) => row?.student?.cpf || "-"}
        />
        <Column
          header="Campo de Estágio"
          body={(row) => row?.student?.internship?.name || "-"}
        />
        <Column
          field="room_id"
          header="Sala"
          body={(row) => row?.room_id || "-"}
        />
        {isScheduleHistory && (
          <Column
            field="schedule_id"
            header="Schedule"
            body={(row) => row?.schedule_id || "-"}
          />
        )}
        <Column
          field="period.name"
          header="Período"
          body={(row) => row?.period?.name || periodName || "-"}
        />
        <Column
          field="start_date"
          header="Início"
          body={(row) => formatDate(row?.start_date)}
        />
        <Column
          field="end_date"
          header="Fim"
          body={(row) => formatDate(row?.end_date)}
        />
        <Column header="Status" body={statusTemplate} />
      </DataTable>
    </div>
  );
}