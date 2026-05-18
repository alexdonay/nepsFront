import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

export default function ServiceSchedulesList() {
  const { roomId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [roomId]);
  const load = async () => {
    try {
      const { data } = roomId
        ? await repository.serviceSchedules.getByRoom(roomId)
        : await repository.serviceSchedules.get();
      setSchedules(data.items || data);
    } catch (e) {
      setSchedules([]);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between mb-3">
        <h2>Horários</h2>
        <Button
          label="Novo Horário"
          onClick={() =>
            navigate(
              roomId
                ? `/service-rooms/${roomId}/schedules/new`
                : "/service-rooms/new",
            )
          }
        />
      </div>
      <DataTable
        value={schedules}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
      >
        <Column field="id" header="ID" />
        <Column field="week_day" header="Dia" />
      </DataTable>
    </div>
  );
}
