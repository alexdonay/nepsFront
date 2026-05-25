import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import { repository } from "../../services/repository";

const FILTER_CONFIG = [
  {
    label: "Nome",
    key: "name",
    type: "text",
    placeholder: "Buscar por nome...",
  },
  {
    label: "Serviço",
    key: "service_id",
    type: "dropdown",
    options: [],
  },
  {
    label: "Possui Maca",
    key: "has_gurney",
    type: "dropdown",
    options: [
      { label: "Sim", value: "1" },
      { label: "Não", value: "0" },
    ],
  },
];

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    loadRooms();
  }, [searchParams, first, rows]);

  useEffect(() => {
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
    // só rodar na montagem inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.rooms.get(params);
      setRooms(data.items || data || []);
      setTotalRecords(data.pagination?.total || 0);
    } catch (e) {
      console.error("Erro ao carregar salas:", e);
      setRooms([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, first, rows]);

  const loadServices = async () => {
    try {
      const { data } = await repository.services.get();
      const list = data.items || data || [];
      const servicesList = list.map((service) => ({
        label: service.name,
        value: service.id,
      }));
      setServices(servicesList);

      FILTER_CONFIG.find((f) => f.key === "service_id").options = servicesList;
    } catch (e) {
      console.error("Erro ao carregar serviços:", e);
      setServices([]);
    }
  };

  const handleApplyFilters = (appliedFilters) => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.append(key, value.join(","));
      } else {
        params.append(key, value);
      }
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

  const activeFilterCount = Array.from(searchParams.entries()).length;

  const handleManage = (rowData) => {
    navigate(`/rooms/${rowData.id}/schedules`);
  };

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-calendar"
        className="p-button-text"
        tooltip="Gerir Agenda"
        tooltipOptions={{ position: "top" }}
        onClick={() => handleManage(rowData)}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        onClick={() => navigate(`/rooms/${rowData.id}`)}
      />
    </div>
  );

  const serviceTemplate = (rowData) => {
    const service = services.find((item) => item.value === rowData.service_id);
    return service ? service.label : "-";
  };

  const gurneyTemplate = (rowData) => (rowData.has_gurney ? "Sim" : "Não");

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Salas</h2>
        <div className="flex gap-2">
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={activeFilterCount > 0 ? activeFilterCount : null}
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          <Button
            label="Nova Sala"
            icon="pi pi-plus"
            onClick={() => navigate("/rooms/new")}
          />
        </div>
      </div>

      <DataTable
        value={rooms}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        loading={loading}
        lazy
        emptyMessage="Nenhuma sala encontrada"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="room_capacity" header="Capacidade" />
        <Column header="Serviço" body={serviceTemplate} />
        <Column header="Possui Maca" body={gurneyTemplate} />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <FilterDrawer
        visible={filterVisible}
        onHide={() => setFilterVisible(false)}
        filters={FILTER_CONFIG}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeCount={activeFilterCount}
      />
    </div>
  );
}
