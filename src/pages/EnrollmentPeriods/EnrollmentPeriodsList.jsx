import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import {
  getCurrentInstitutionId,
  getCurrentPermission,
  normalizePermission,
} from "../../utils/auth";
import { ROUTE_CONTEXT_KEYS, clearRouteContext, setRouteContext } from "../../utils/routeContext";
import EnrollmentPeriodsFilters from "./EnrollmentPeriodsFilters";

export default function EnrollmentPeriodsList() {
  const [periods, setPeriods] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPermission = normalizePermission(getCurrentPermission());
  const canCreatePeriod = currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO;
  const institutionId = getCurrentInstitutionId();

  const today = new Date();

  const filterPeriodsForEducationInstitute = (periodsList) => {
    if (currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO) {
      return periodsList;
    }

    const now = new Date();
    return periodsList.filter((period) => {
      if (!period.is_active) return false;

      const priorityStart = period.priority_start_date
        ? new Date(period.priority_start_date)
        : null;
      const priorityEnd = period.priority_end_date
        ? new Date(period.priority_end_date)
        : null;

      if (!priorityStart || !priorityEnd) {
        const periodStart = new Date(period.start_date);
        const periodEnd = new Date(period.end_date);
        periodEnd.setHours(23, 59, 59, 999);
        return now >= periodStart && now <= periodEnd;
      }

      priorityEnd.setHours(23, 59, 59, 999);
      return now >= priorityStart && now <= priorityEnd;
    });
  };

  const loadPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
        params.is_active = "1";
        if (institutionId) {
          params.institution_id = institutionId;
        }
      }

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.periods.get(params);
      let periodsList = data.items || data;

      if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
        periodsList = filterPeriodsForEducationInstitute(periodsList);
      }

      setPeriods(periodsList);
      setTotalRecords(periodsList.length);
    } catch (e) {
      if (e.response?.status === 401) {
        console.warn(
          "Sessão expirada ou não autenticado. Faça login novamente.",
        );
      }
      setPeriods([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [first, rows, currentPermission, institutionId, searchParams]);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods, first, rows]);

  const handleApplyFilters = (appliedFilters) => {
    const params = new URLSearchParams();

    if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
      const filteredFilters = Object.entries(appliedFilters).filter(([key]) => {
        return key.includes("name");
      });
      filteredFilters.forEach(([key, value]) => {
        if (Array.isArray(value)) params.append(key, value.join(","));
        else params.append(key, value);
      });
    } else {
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) params.append(key, value.join(","));
        else params.append(key, value);
      });
    }

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

  const filterInitialValues = {
    ...(searchParams.has("name_like") && { name: searchParams.get("name_like") }),
    ...(searchParams.has("is_active") && { is_active: searchParams.get("is_active") }),
  };

  const dateTemplate = (rowData) =>
    new Date(rowData.start_date).toLocaleDateString();

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Períodos de Inscrição</h2>
        <div className="flex gap-2">
          {currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO && (
            <Button
              label="Filtros"
              icon="pi pi-filter"
              badge={activeFilterCount > 0 ? activeFilterCount : null}
              badgeClassName="p-badge-info"
              onClick={() => setFilterVisible(true)}
            />
          )}
          {canCreatePeriod && (
            <Button
              label="Novo Período"
              icon="pi pi-plus"
              onClick={() => {
                clearRouteContext(ROUTE_CONTEXT_KEYS.period);
                window.location.href = "/periods/new";
              }}
            />
          )}
        </div>
      </div>

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
          header={
            currentPermission === PERMISSIONS.INSTITUICAO_ENSINO
              ? "Período de Inscrição Prioritária"
              : "Início"
          }
          body={(row) => {
            if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
              return `${new Date(row.priority_start_date).toLocaleDateString()} - ${new Date(row.priority_end_date).toLocaleDateString()}`;
            }
            return new Date(row.start_date).toLocaleDateString();
          }}
        />
        {currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO && (
          <Column
            field="end_date"
            header="Fim"
            body={(row) => new Date(row.end_date).toLocaleDateString()}
          />
        )}
        {currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO && (
          <Column
            field="is_active"
            header="Status"
            body={(row) => (row.is_active ? "Ativo" : "Encerrado")}
          />
        )}
        <Column
          header="Ações"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-clock"
                rounded
                text
                size="small"
                title="Ver histórico do período"
                onClick={() => {
                  setRouteContext(ROUTE_CONTEXT_KEYS.period, { id: row.id });
                  navigate("/periods/history");
                }}
              />
              {currentPermission === PERMISSIONS.ADMIN && (
                <Button
                  icon="pi pi-users"
                  rounded
                  text
                  size="small"
                  title="Gerir alunos do período"
                  onClick={() => {
                    setRouteContext(ROUTE_CONTEXT_KEYS.period, { id: row.id });
                    window.location.href = "/periods/manage";
                  }}
                />
              )}
              {currentPermission === PERMISSIONS.INSTITUICAO_ENSINO && (
                <Button
                  icon="pi pi-user-plus"
                  rounded
                  text
                  size="small"
                  title="Gerenciar inscrições"
                  onClick={() => {
                    setRouteContext(ROUTE_CONTEXT_KEYS.period, { id: row.id });
                    navigate("/periods/manage-institution");
                  }}
                />
              )}
              {canCreatePeriod && (
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  onClick={() => {
                    setRouteContext(ROUTE_CONTEXT_KEYS.period, { id: row.id });
                    window.location.href = "/periods/edit";
                  }}
                />
              )}
            </div>
          )}
        />
      </DataTable>

      <EnrollmentPeriodsFilters
        visible={filterVisible}
        onHide={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeCount={activeFilterCount}
        initialValues={filterInitialValues}
      />
    </div>
  );
}
