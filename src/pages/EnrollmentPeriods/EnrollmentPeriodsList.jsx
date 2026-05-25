import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import { getCurrentPermission, normalizePermission } from "../../utils/auth";
import EnrollmentPeriodsForm from "./EnrollmentPeriodsForm";

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
      { label: "Encerrado", value: "0" },
    ],
  },
  {
    label: "Data Início",
    key: "start_date",
    type: "date-range",
  },
  {
    label: "Data Fim",
    key: "end_date",
    type: "date-range",
  },
];

export default function EnrollmentPeriodsList() {
  const [periods, setPeriods] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [form, setForm] = useState({
    name: "",
    priority_start_date: null,
    priority_end_date: null,
    start_date: null,
    end_date: null,
  });
  const currentPermission = normalizePermission(getCurrentPermission());
  const canCreatePeriod = currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO;

  const today = new Date();

  useEffect(() => {
    loadPeriods();
  }, [searchParams, first, rows]);

  useEffect(() => {
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.periods.get(params);
      setPeriods(data.items || data);
      setTotalRecords(data.pagination?.total || 0);
    } catch (e) {
      setPeriods([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, first, rows]);

  const currentPeriod = periods.find((p) => {
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    return start <= today && end >= today;
  });

  const handleSave = async () => {
    if (!canCreatePeriod) {
      return;
    }

    try {
      await repository.periods.post({
        name: form.name,
        priority_start_date: form.priority_start_date
          ?.toISOString()
          .split("T")[0],
        priority_end_date: form.priority_end_date?.toISOString().split("T")[0],
        start_date: form.start_date?.toISOString().split("T")[0],
        end_date: form.end_date?.toISOString().split("T")[0],
      });
      setShowDialog(false);
      setFirst(0);
      setForm({
        name: "",
        priority_start_date: null,
        priority_end_date: null,
        start_date: null,
        end_date: null,
      });
      loadPeriods();
    } catch (err) {}
  };

  const handleApplyFilters = (appliedFilters) => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) params.append(key, value.join(","));
      else params.append(key, value);
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

  const dateTemplate = (rowData) =>
    new Date(rowData.start_date).toLocaleDateString();

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Períodos de Inscrição</h2>
        <div className="flex gap-2">
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={activeFilterCount > 0 ? activeFilterCount : null}
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          {canCreatePeriod && (
            <Button
              label="Abrir Período"
              icon="pi pi-plus"
              onClick={() => setShowDialog(true)}
            />
          )}
        </div>
      </div>

      {currentPeriod && (
        <div className="surface-100 p-3 border-round mb-3">
          <strong>Período Ativo:</strong> {currentPeriod.name} (
          {dateTemplate(currentPeriod)} -{" "}
          {new Date(currentPeriod.end_date).toLocaleDateString()})
        </div>
      )}

      <DataTable
        value={periods}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        loading={loading}
        lazy
        emptyMessage="Nenhum período encontrado"
      >
        <Column field="name" header="Nome" />
        <Column
          field="start_date"
          header="Início"
          body={(row) => new Date(row.start_date).toLocaleDateString()}
        />
        <Column
          field="end_date"
          header="Fim"
          body={(row) => new Date(row.end_date).toLocaleDateString()}
        />
        <Column
          field="is_active"
          header="Status"
          body={(row) => (row.is_active ? "Ativo" : "Encerrado")}
        />
      </DataTable>

      <EnrollmentPeriodsForm
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />

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
