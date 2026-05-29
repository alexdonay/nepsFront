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
import EnrollmentPeriodsFilters from "./EnrollmentPeriodsFilters";

export default function EnrollmentPeriodsList() {
  const [periods, setPeriods] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const currentPermission = normalizePermission(getCurrentPermission());
  const canCreatePeriod = currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO;
  const institutionId = getCurrentInstitutionId();

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

  const filterPeriodsForEducationInstitute = (periodsList) => {
    if (currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO) {
      return periodsList;
    }

    const now = new Date();
    return periodsList.filter((period) => {
      // Verificar se está ativo
      if (!period.is_active) return false;

      // Verificar se está na janela de prioridade
      const priorityStart = period.priority_start_date
        ? new Date(period.priority_start_date)
        : null;
      const priorityEnd = period.priority_end_date
        ? new Date(period.priority_end_date)
        : null;

      // Se não houver datas de prioridade, considerar o período geral
      if (!priorityStart || !priorityEnd) {
        const periodStart = new Date(period.start_date);
        const periodEnd = new Date(period.end_date);
        return now >= periodStart && now <= periodEnd;
      }

      // Verificar se está dentro da janela de prioridade
      return now >= priorityStart && now <= priorityEnd;
    });
  };

  const loadPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      // Diferenciar comportamento por permissão
      if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
        // Instituição de Ensino: apenas períodos ativos
        params.is_active = "1";
        // Se o backend suportar filtro por institution_id, enviar
        if (institutionId) {
          params.institution_id = institutionId;
        }
      }
      // Admin: sem filtros automáticos, vê tudo

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.periods.get(params);
      let periodsList = data.items || data;

      // Filtro no frontend para INSTITUICAO_ENSINO (apenas período prioritário)
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
  }, [searchParams, first, rows, currentPermission, institutionId]);

  const handleApplyFilters = (appliedFilters) => {
    const params = new URLSearchParams();

    if (currentPermission === PERMISSIONS.INSTITUICAO_ENSINO) {
      // Para instituições de ensino, apenas permitir filtro por nome
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
              onClick={() => (window.location.href = "/periods/new")}
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
                onClick={() => navigate(`/periods/${row.id}/history`)}
              />
              {currentPermission === PERMISSIONS.ADMIN && (
                <Button
                  icon="pi pi-users"
                  rounded
                  text
                  size="small"
                  title="Gerir alunos do período"
                  onClick={() =>
                    (window.location.href = `/periods/${row.id}/manage`)
                  }
                />
              )}
              {currentPermission === PERMISSIONS.INSTITUICAO_ENSINO && (
                <Button
                  icon="pi pi-user-plus"
                  rounded
                  text
                  size="small"
                  title="Gerenciar inscrições"
                  onClick={() =>
                    navigate(`/periods/${row.id}/manage-institution`)
                  }
                />
              )}
              {canCreatePeriod && (
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  onClick={() => (window.location.href = `/periods/${row.id}`)}
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
      />
    </div>
  );
}
