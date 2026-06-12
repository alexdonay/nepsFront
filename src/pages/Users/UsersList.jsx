import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, setRouteContext } from "../../utils/routeContext";

const FILTER_CONFIG = [
  {
    label: "Nome",
    key: "name",
    type: "text",
    placeholder: "Buscar por nome...",
  },
  {
    label: "Email",
    key: "email",
    type: "text",
    placeholder: "Buscar por email...",
  },
  {
    label: "Perfil",
    key: "role",
    type: "dropdown",
    options: [
      { label: "Admin", value: PERMISSIONS.ADMIN },
      {
        label: "Instituição de Ensino",
        value: PERMISSIONS.INSTITUICAO_ENSINO,
      },
      { label: "Campo de Estágio", value: PERMISSIONS.CAMPO_ESTAGIO },
    ],
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

const getRoleLabel = (role) => {
  switch (role) {
    case PERMISSIONS.ADMIN:
      return "Administrador";
    case PERMISSIONS.CAMPO_ESTAGIO:
      return "Campo de Estágio";
    case PERMISSIONS.INSTITUICAO_ENSINO:
      return "Instituição de Ensino";
    default:
      return role || "-";
  }
};

const getStatusLabel = (user) => {
  const active = user.is_active ?? user.active;
  if (typeof active === "boolean") return active ? "Ativo" : "Inativo";

  if (typeof user.status === "string") {
    const normalized = user.status.trim().toLowerCase();
    if (["ativo", "active", "ativo(a)", "1"].includes(normalized))
      return "Ativo";
    if (["inativo", "inactive", "0"].includes(normalized)) return "Inativo";
  }

  return "-";
};

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [filters, first, rows]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

      // Adicionar filtros locais aos parâmetros da API
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params[key] = value.join(",");
        } else {
          params[key] = value;
        }
      });

      const { data } = await repository.users.get(params);
      setUsers(data.items || data);
      setTotalRecords(data.pagination?.total || 0);
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
      setUsers([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [filters, first, rows]);

  const handleApplyFilters = (appliedFilters) => {
    setFilters(appliedFilters);
    setFirst(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setFirst(0);
    setFilterVisible(false);
  };

  const handlePaginationChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Usuários</h2>
        <div className="flex gap-2">
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={activeFilterCount > 0 ? activeFilterCount : null}
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          <Button
            label="Novo Usuário"
            icon="pi pi-plus"
            onClick={() => {
              setRouteContext("user", {}); // Limpa o ID anterior
              navigate("/users/new");
            }}
          />
        </div>
      </div>

      <DataTable
        value={users}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        loading={loading}
        lazy
        emptyMessage="Nenhum usuário encontrado"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="email" header="E-mail" />
        <Column
          body={(rowData) => getRoleLabel(rowData.role)}
          header="Perfil"
        />
        <Column body={(rowData) => getStatusLabel(rowData)} header="Status" />
        <Column
          body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => {
                  setRouteContext(ROUTE_CONTEXT_KEYS.user, { id: rowData.id });
                  navigate("/users/edit");
                }}
              />
            </div>
          )}
          header="Ações"
        />
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
