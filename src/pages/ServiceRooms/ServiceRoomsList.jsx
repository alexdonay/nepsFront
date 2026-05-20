import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

export default function ServiceRoomsList() {
  const { serviceId } = useParams();
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [serviceId]);
  const load = async () => {
    try {
      const { data } = serviceId
        ? await repository.serviceRooms.getByService(serviceId)
        : await repository.serviceRooms.get();
      setRooms(data.items || data);
    } catch (e) {
      setRooms([]);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between mb-3">
        <h2>Salas</h2>
        <Button
          label="Nova Sala"
          onClick={() =>
            navigate(
              serviceId
                ? `/services/${serviceId}/rooms/new`
                : "/service-rooms/new",
            )
          }
        />
      </div>
      <DataTable
        value={rooms}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
      >
        <Column field="id" header="ID" />
        <Column field="name" header="Nome" />
      </DataTable>
    </div>
  );
}
