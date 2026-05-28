import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

export default function ServiceRoomsList() {
  const { serviceId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
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
      setTotalRecords(
        data.pagination?.total ||
          (Array.isArray(data) ? data.length : data.items?.length || 0),
      );
      setFirst(0);
    } catch (e) {
      setRooms([]);
      setTotalRecords(0);
    }
  };

  const handlePaginationChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between mb-3">
        <h2>Salas do Campo de Estágio</h2>
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
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        lazy
      >
        <Column field="id" header="ID" />
        <Column field="name" header="Nome" />
      </DataTable>
    </div>
  );
}
