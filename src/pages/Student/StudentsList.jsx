import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import api from "../../services/api";
import { API_ROUTES } from "../../services/API_routes";
import { repository } from "../../services/repository";

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
    label: "Curso",
    key: "course_id",
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
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    // Se houver filtros na URL na primeira montagem, abrir drawer automaticamente
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
    // só rodar na montagem inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOptions = async () => {
    try {
      const [coursesRes, instRes] = await Promise.all([
        api.get(API_ROUTES.CADASTROS.COURSES),
        api.get(API_ROUTES.CADASTROS.INSTITUTIONS),
      ]);
      const coursesList = Array.isArray(coursesRes.data)
        ? coursesRes.data
        : coursesRes.data.items || [];
      const instList = Array.isArray(instRes.data)
        ? instRes.data
        : instRes.data.items || [];

      setCourses(coursesList);
      setInstitutions(instList);

      // Atualizar opções nos filtros
      FILTER_CONFIG.find((f) => f.key === "course_id").options =
        coursesList.map((c) => ({ label: c.name, value: c.id }));
      FILTER_CONFIG.find((f) => f.key === "institution_id").options =
        instList.map((i) => ({ label: i.name, value: i.id }));
    } catch (e) {
      console.error("Erro ao carregar opções:", e);
    }
  };

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const page = Math.floor(first / rows) + 1;
      const params = { page, per_page: rows };

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

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        onClick={() => navigate(`/students/${rowData.id}`)}
      />
    </div>
  );

  const courseTemplate = (rowData) => {
    const course = courses.find((c) => c.id === rowData.course_id);
    return course ? course.name : "-";
  };

  const institutionTemplate = (rowData) => {
    const inst = institutions.find((i) => i.id === rowData.institution_id);
    return inst ? inst.name : "-";
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
            onClick={() => navigate("/students/new")}
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
        <Column header="Curso" body={courseTemplate} />
        <Column field="semester" header="Semestre" />
        <Column header="Instituição" body={institutionTemplate} />
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
