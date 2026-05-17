import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadInternships();
    loadOptions();
  }, []);

  const loadInternships = async () => {
    try {
      const { data } = await repository.vinculos.get();
      setInternships(data);
    } catch (e) {
      setInternships([]);
    }
  };

  const loadOptions = async () => {
    try {
      const [studentsRes, locationsRes] = await Promise.all([
        repository.students.get(),
        repository.locations.get(),
      ]);
      setStudents(studentsRes.data);
      setRooms(locationsRes.data);
    } catch (e) {}
  };

  const studentTemplate = (rowData) => {
    const student = students.find((s) => s.id === rowData.student_id);
    return student ? student.name : "-";
  };

  const roomTemplate = (rowData) => {
    const room = rooms.find((r) => r.id === rowData.location_id);
    return room ? room.name : "-";
  };

  const shiftTemplate = (rowData) => {
    const shifts = { morning: "Manhã", afternoon: "Tarde", evening: "Noite" };
    return shifts[rowData.shift] || rowData.shift;
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Vínculos de Estágio</h2>
        <Button
          label="Novo Vínculo"
          icon="pi pi-plus"
          onClick={() => navigate("/internships/new")}
        />
      </div>

      <DataTable value={internships} tableStyle={{ minWidth: "50rem" }}>
        <Column field="id" header="ID" sortable />
        <Column header="Aluno" body={studentTemplate} />
        <Column header="Local" body={locationTemplate} />
        <Column header="Turno" body={shiftTemplate} />
        <Column field="status" header="Status" />
      </DataTable>
    </div>
  );
}
