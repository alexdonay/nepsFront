import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { repository } from "../../services/repository";
import {
  clearRouteContext,
  ROUTE_CONTEXT_KEYS,
  setRouteContext,
} from "../../utils/routeContext";
import InternshipsFilter from "./InternshipsFilter";

export default function InternshipsList() {
  const [internships, setInternships] = useState([]);
  const [regions, setRegions] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    loadInternships();
  }, [searchParams, first, rows]);

  const loadInternships = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.internships.get(params);
      setInternships(data.items || data);
      setTotalRecords(data.pagination?.total || 0);
    } catch (e) {
      if (e.response?.status === 401) {
        console.warn("Sessão expirada. Faça login novamente.");
      } else {
        console.error("Erro ao carregar campos de estágio:", e);
      }
      setInternships([]);
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
    } catch (e) {
      console.error("Erro ao carregar regiões:", e);
    }
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
        onClick={() => {
          setRouteContext(ROUTE_CONTEXT_KEYS.service, { id: rowData.id });
          navigate("/internships/detail");
        }}
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
            onClick={() => {
              clearRouteContext(ROUTE_CONTEXT_KEYS.service);
              navigate("/internships/new");
            }}
          />
        </div>
      </div>

      <DataTable
        value={internships}
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
        <Column header="Território" sortable body={regionTemplate} />
        <Column field="is_active" header="Status" body={activeTemplate} />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <InternshipsFilter
        filterVisible={filterVisible}
        setFilterVisible={setFilterVisible}
      />
    </div>
  );
}
