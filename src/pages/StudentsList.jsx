import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../services/repository";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
    loadOptions();
  }, []);

  const loadStudents = async () => {
    try {
      const { data } = await repository.students.get();
      setStudents(data.items || data);
    } catch (e) {
      setStudents([]);
    }
  };

  const loadOptions = async () => {
    try {
      const [coursesRes, instRes] = await Promise.all([
        repository.courses.get(),
        repository.institutions.get(),
      ]);
      setCourses(coursesRes.data.items || coursesRes.data);
      setInstitutions(instRes.data.items || instRes.data);
    } catch (e) {}
  };

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
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Alunos</h2>
        <Button
          label="Novo Aluno"
          icon="pi pi-plus"
          onClick={() => navigate("/students/new")}
        />
      </div>

      <DataTable
        value={students}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
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
    </div>
  );
}
