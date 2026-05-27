import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";
import "./ServiceSchedulesList.css";

const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const PERIOD_ORDER = ["MORNING", "AFTERNOON", "EVENING"];

const PERIODS = {
  MORNING: { label: "Manhã", icon: "pi-sun", color: "info" },
  AFTERNOON: { label: "Tarde", icon: "pi-cloud", color: "warning" },
  EVENING: { label: "Vespertino", icon: "pi-moon", color: "secondary" },
};

export default function ServiceSchedulesList() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isRoomContext = location.pathname.startsWith("/rooms/");

  const [room, setRoom] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isRoomContext]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRoom(), loadSchedule()]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoom = async () => {
    try {
      if (!roomId) {
        setRoom(null);
        return;
      }

      const { data } = isRoomContext
        ? await repository.rooms.getById(roomId)
        : await repository.serviceRooms.getById(roomId);
      setRoom(data);
    } catch {
      setRoom(null);
    }
  };

  const loadSchedule = async () => {
    try {
      const { data } = await repository.roomSchedules.get(roomId);
      setSchedule(data);
    } catch {
      setSchedule(null);
    }
  };

  const days = useMemo(() => {
    const apiDays = schedule?.days || [];
    const normalized = new Map(apiDays.map((day) => [day.dayOfWeek, day]));

    return DAY_ORDER.map((dayOfWeek) => {
      const day = normalized.get(dayOfWeek);
      const periods = PERIOD_ORDER.map((periodKey) => {
        const period = day?.periods?.find(
          (item) => item.period === periodKey,
        ) || {
          period: periodKey,
          studentIds: [],
        };

        return {
          ...period,
          periodLabel: PERIODS[periodKey].label,
          icon: PERIODS[periodKey].icon,
          color: PERIODS[periodKey].color,
        };
      });

      return {
        dayOfWeek,
        dayLabel: DAY_LABELS[dayOfWeek],
        periods,
      };
    });
  }, [schedule]);

  const roomCapacity = Number(room?.room_capacity ?? room?.capacity ?? 0);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div>
          <h1 className="schedule-title">
            📅 Agenda da Sala do Campo de Estágio
          </h1>
          {room && (
            <p className="schedule-subtitle">
              Sala: <strong>{room.name}</strong> • Capacidade:{" "}
              <strong>{roomCapacity || "-"}</strong> alunos
            </p>
          )}
        </div>

        <Button
          label="Atualizar"
          icon="pi pi-refresh"
          outlined
          onClick={loadData}
        />
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
                <span className="day-abbr">{day.dayOfWeek}</span>
              </div>

              <div className="shifts-container">
                {day.periods.map((period) => {
                  const studentCount = period.studentIds?.length || 0;
                  const vacancies =
                    roomCapacity > 0
                      ? Math.max(roomCapacity - studentCount, 0)
                      : null;
                  const isFilled = studentCount > 0;

                  return (
                    <div
                      key={`${day.dayOfWeek}-${period.period}`}
                      className={`shift-card p-3 border-round cursor-pointer transition shift-${
                        isFilled ? "filled" : "empty"
                      } shift-${period.color}`}
                      onClick={() =>
                        navigate(
                          `${isRoomContext ? "/rooms" : "/service-rooms"}/${roomId}/schedules/${day.dayOfWeek}/${period.period}`,
                        )
                      }
                      title="Clique para vincular alunos neste período"
                    >
                      <div className="shift-header flex align-items-center gap-2 mb-2">
                        <i className={`pi ${period.icon}`}></i>
                        <span className="shift-label font-semibold text-sm">
                          {period.periodLabel}
                        </span>
                      </div>

                      <div className="shift-student">
                        <div className="student-status font-medium text-color text-sm">
                          {isFilled ? (
                            <>
                              <i className="pi pi-check-circle text-green-500 mr-2"></i>
                              {studentCount} aluno{studentCount > 1 ? "s" : ""}{" "}
                              vinculado{studentCount > 1 ? "s" : ""}
                            </>
                          ) : (
                            <>
                              <i className="pi pi-times-circle text-yellow-500 mr-2"></i>
                              Sem alunos
                            </>
                          )}
                        </div>
                        <div className="student-meta text-xs text-color-secondary mt-2">
                          {roomCapacity > 0
                            ? `${studentCount}/${roomCapacity} ocupados • ${vacancies} vagas livres`
                            : `${studentCount} aluno(s) vinculado(s)`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
