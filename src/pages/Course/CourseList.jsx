import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { repository } from "../../services/repository";
import {
  ROUTE_CONTEXT_KEYS,
  clearRouteContext,
  setRouteContext,
} from "../../utils/routeContext";
import { getCurrentPermission, getCurrentInstitutionId } from "../../utils/auth";
import { PERMISSIONS } from "../../constants/permissions";
import CourseFilter from "./CourseFilter";
export default function CoursesList() {
  const isInstitution = getCurrentPermission() === PERMISSIONS.INSTITUICAO_ENSINO;
  const institutionId = isInstitution ? getCurrentInstitutionId() : null;
  const [courses, setCourses] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
  }, []);

  const loadCurses = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      if (institutionId) params.education_institute_id = institutionId;

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.courses.get(params);
      setCourses(data.items || data);
      setTotalRecords(data.pagination?.total || 0);
    } catch (e) {
      console.error("Erro ao carregar course:", e);
      setCourses([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, first, rows]);

  useEffect(() => {
    loadCurses();
  }, [loadCurses]);

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

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        onClick={() => {
          setRouteContext(ROUTE_CONTEXT_KEYS.course, { id: rowData.id });
          navigate("/courses/detail");
        }}
      />
    </div>
  );

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Curso</h2>
        <div className="flex gap-2">
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={activeFilterCount > 0 ? activeFilterCount : null}
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          <Button
            label="Novo Curso"
            icon="pi pi-plus"
            onClick={() => {
              clearRouteContext(ROUTE_CONTEXT_KEYS.course);
              navigate("/courses/new");
            }}
          />
        </div>
      </div>

      <DataTable
        value={courses}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        loading={loading}
        lazy
        emptyMessage="Nenhum Curso encontrado"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <CourseFilter
        visible={filterVisible}
        onHide={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeCount={activeFilterCount}
      />
    </div>
  );
}
