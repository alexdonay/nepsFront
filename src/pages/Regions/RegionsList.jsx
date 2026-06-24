import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import { repository } from "../../services/repository";
import {
  clearRouteContext,
  ROUTE_CONTEXT_KEYS,
  setRouteContext,
} from "../../utils/routeContext";

const FILTER_CONFIG = [
  {
    label: "Nome",
    key: "name",
    type: "text",
    placeholder: "Buscar por nome...",
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

export default function RegionsList() {
  const [regions, setRegions] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadRegions();
  }, [searchParams, first, rows]);

  useEffect(() => {
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
  }, []);

  const loadRegions = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.regions.get(params);
      setRegions(data.items || data);
      setTotalRecords(data.pagination?.total || 0);
    } catch (e) {
      console.error("Erro ao carregar regiões:", e);
      setRegions([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, first, rows]);

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
        onClick={() => {
          setRouteContext(ROUTE_CONTEXT_KEYS.region, { id: rowData.id });
          navigate("/regions/edit");
        }}
      />
    </div>
  );

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Territórios</h2>
        <div className="flex gap-2">
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={activeFilterCount > 0 ? activeFilterCount : null}
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          <Button
            label="Novo Território"
            icon="pi pi-plus"
            onClick={() => {
              clearRouteContext(ROUTE_CONTEXT_KEYS.region);
              navigate("/regions/new");
            }}
          />
        </div>
      </div>

      <DataTable
        value={regions}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        loading={loading}
        lazy
        emptyMessage="Nenhuma região encontrada"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
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
