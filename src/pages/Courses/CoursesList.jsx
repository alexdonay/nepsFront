import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { repository } from "../../services/repository";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadCourses();
    loadInstitutes();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await repository.courses.get();
      setCourses(data);
    } catch (e) {
      setCourses([]);
    }
  };

  const loadInstitutes = async () => {
    try {
      const { data } = await repository.institutes.get();
      setInstitutes(data);
    } catch (e) {
      setInstitutes([]);
    }
  };

  const handleSave = async () => {
    try {
      console.log("form antes de salvar:", form);


      if (editId) {
        await repository.courses.put(editId, form);
      } else {
        await repository.courses.post(form);
      }
      setShowDialog(false);
      setForm({ edu_institute_id: 1, name: "", requires_gurney: false });
      setEditId(null);
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.detail || "Erro ao salvar");
    }
  };

  const handleEdit = (rowData) => {
    setForm({
      name: rowData.name,
      code: rowData.code,
    });
    setEditId(rowData.id);
    setShowDialog(true);
  };

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        onClick={() => handleEdit(rowData)}
      />
    </div>
  );

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Cursos</h2>
        <Button
          label="Novo Curso"
          icon="pi pi-plus"
          onClick={() => {
            setEditId(null);
            setForm({ edu_institute_id: 1, name: "", requires_gurney: false });
            setShowDialog(true);
          }}
        />
      </div>

      <DataTable value={courses} tableStyle={{ minWidth: "50rem" }}>
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="requires_gurney" header="Requer Maca" />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editId ? "Editar Curso" : "Novo Curso"}
      >
        <div className="field mb-3">
          <label>Nome</label>
          <InputText
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
          />
        </div>

       <div className="field mb-3">
          <label>Instituição de Ensino **Acho que tiramos isso do front e do back</label>
          <Dropdown
            value={form.edu_institute_id}
            options={institutes}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, edu_institute_id: e.value })}
            className="w-full"
            placeholder="Selecione"
          />
        </div>

        <div className="field mb-3">
          <label>Requer Maca</label>
          <Checkbox
            checked={form.requires_gurney}
            onChange={(e) =>
              setForm({ ...form, requires_gurney: e.checked })
            }
          />
        </div>
        <Button label="Salvar" onClick={handleSave} />
      </Dialog>
    </div>
  );
}
