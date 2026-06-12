import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, setRouteContext, clearRouteContext } from "../../utils/routeContext";

const FILTER_CONFIG = [
  {
    label: "Nome",
    key: "name",
    type: "text",
    placeholder: "Buscar por nome...",
  },
  {
    label: "CPF",
    key: "cpf",
    type: "text",
    placeholder: "Buscar por CPF...",
  },
  {
    label: "Email",
    key: "email",
    type: "text",
    placeholder: "Buscar por email...",
  },
  {
    label: "Disciplina",
    key: "discipline_id",
    type: "dropdown",
    options: [],
  },
  {
    label: "Instituição",
    key: "institution_id",
    type: "dropdown",
    options: [],
  },
  {
    label: "Semestre",
    key: "semester",
    type: "number",
    placeholder: "Digite o semestre...",
  },
];

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedDisciplines, setLoadedDisciplines] = useState({});
  const [loadedInstitutions, setLoadedInstitutions] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Se houver filtros na URL na primeira montagem, abrir drawer automaticamente
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
    // só rodar na montagem inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows, include: "discipline,institution" };

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const { data } = await repository.students.get(params);
      setStudents(data.items || data);
      setTotalRecords(data.pagination?.total || 0);
    } catch (e) {
      console.error("Erro ao carregar alunos:", e);
      setStudents([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams, first, rows]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

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

  const filters = useMemo(() => {
    const disciplinesOptions = Array.from(
      new Map(
        students
          .filter((student) => student.discipline?.id && student.discipline?.name)
          .map((student) => [
            student.discipline.id,
            { label: student.discipline.name, value: student.discipline.id },
          ]),
      ).values(),
    );

    const institutionsOptions = Array.from(
      new Map(
        students
          .filter(
            (student) => student.institution?.id && student.institution?.name,
          )
          .map((student) => [
            student.institution.id,
            {
              label: student.institution.name,
              value: student.institution.id,
            },
          ]),
      ).values(),
    );

    return FILTER_CONFIG.map((filter) => {
      if (filter.key === "discipline_id") {
        return { ...filter, options: disciplinesOptions };
      }

      if (filter.key === "institution_id") {
        return { ...filter, options: institutionsOptions };
      }

      return filter;
    });
  }, [students]);

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-history"
        className="p-button-text"
        onClick={() => {
          setRouteContext(ROUTE_CONTEXT_KEYS.student, { id: rowData.id });
          navigate("/students/history");
        }}
        tooltip="Histórico"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-eye"
        className="p-button-text"
        onClick={() => {
          setRouteContext(ROUTE_CONTEXT_KEYS.student, { id: rowData.id });
          navigate("/students/details");
        }}
        tooltip="Detalhes"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        onClick={() => {
          setRouteContext(ROUTE_CONTEXT_KEYS.student, { id: rowData.id });
          navigate("/students/edit");
        }}
        tooltip="Editar"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );

  const disciplineTemplate = (rowData) => {
    if (rowData.discipline && typeof rowData.discipline === "object") {
      return rowData.discipline.name;
    }
    return rowData.discipline_name || "-";
  };

  const institutionTemplate = (rowData) => {
    if (rowData.institution && typeof rowData.institution === "object") {
      return rowData.institution.name;
    }
    return rowData.institution_name || "-";
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3">
        <h2 className="text-xl font-bold m-0">Alunos</h2>
        <div className="flex gap-2">
          <Button
            label="Filtros"
            icon="pi pi-filter"
            badge={activeFilterCount > 0 ? activeFilterCount : null}
            badgeClassName="p-badge-info"
            onClick={() => setFilterVisible(true)}
          />
          <Button
            label="Novo Aluno"
            icon="pi pi-plus"
            onClick={() => {
              clearRouteContext(ROUTE_CONTEXT_KEYS.student);
              navigate("/students/new");
            }}
          />
        </div>
      </div>

      <DataTable
        value={students}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={[10, 20, 50]}
        onPage={handlePaginationChange}
        loading={loading}
        lazy
        emptyMessage="Nenhum aluno encontrado"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="cpf" header="CPF" />
        <Column field="email" header="Email" />
        <Column header="Disciplina" body={disciplineTemplate} />
        <Column field="semester" header="Semestre" />
        <Column header="Instituição" body={institutionTemplate} />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <FilterDrawer
        visible={filterVisible}
        onHide={() => setFilterVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        activeCount={activeFilterCount}
      />
    </div>
  );
}
