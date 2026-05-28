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
    label: "Região",
    key: "region_id",
    type: "dropdown",
    options: [],
  },
  {
    label: "Status",
    key: "is_active",
    type: "dropdown",
    options: [
      { label: "Ativo", value: "1" },
      { label: "Inativo", value: "0" },
    ],
  },
];

export default function ServicesList() {
  const [services, setServices] = useState([]);
  const [regions, setRegions] = useState({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    loadServices();
  }, [searchParams, first, rows]);

  useEffect(() => {
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
    // só rodar na montagem inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.services.get(params);
      setServices(data.items || data);
      setTotalRecords(data.pagination?.total || 0);
    } catch (e) {
      console.error("Erro ao carregar campos de estágio:", e);
      setServices([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, first, rows]);

  const loadRegions = async () => {
    try {
      const { data } = await repository.regions.get();
      const regionsList = data.items || data || [];

      const regionsMap = {};
      regionsList.forEach((r) => {
        regionsMap[r.id] = r.name;
      });
      setRegions(regionsMap);

      FILTER_CONFIG.find((f) => f.key === "region_id").options =
        regionsList.map((r) => ({ label: r.name, value: r.id }));
    } catch (e) {
      console.error("Erro ao carregar regiões:", e);
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

  const nameTemplate = (rowData) => rowData.name || "-";
  const regionTemplate = (rowData) => regions[rowData.region_id] || "-";
  const activeTemplate = (rowData) => (
    <span className={rowData.is_active ? "text-green-500" : "text-red-500"}>
      {rowData.is_active ? "Ativo" : "Inativo"}
    </span>
  );

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        onClick={() => navigate(`/services/${rowData.id}`)}
      />
    </div>
  );

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Campos de Estágio</h2>
        <div className="flex gap-2">
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={activeFilterCount > 0 ? activeFilterCount : null}
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          <Button
            label="Novo Campo de Estágio"
            icon="pi pi-plus"
            onClick={() => navigate("/services/new")}
          />
        </div>
      </div>

      <DataTable
        value={services}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        loading={loading}
        lazy
        emptyMessage="Nenhum campo de estágio encontrado"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable body={nameTemplate} />
        <Column header="Região" sortable body={regionTemplate} />
        <Column field="is_active" header="Status" body={activeTemplate} />
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
