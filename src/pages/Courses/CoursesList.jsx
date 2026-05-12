import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { repository } from "../../services/repository";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await repository.courses.get();
      setCourses(data);
    } catch (e) {
      setCourses([]);
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await repository.courses.put(editId, form);
      } else {
        await repository.courses.post(form);
      }
      setShowDialog(false);
      setForm({ name: "", code: "" });
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
            setForm({ name: "", code: "" });
            setShowDialog(true);
          }}
        />
      </div>

      <DataTable value={courses} tableStyle={{ minWidth: "50rem" }}>
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="code" header="Código" />
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
          <label>Código</label>
          <InputText
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full"
          />
        </div>
        <Button label="Salvar" onClick={handleSave} />
      </Dialog>
    </div>
  );
}
