import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { repository } from "../../services/repository";

export default function RegionsList() {
  const [regions, setRegions] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: "", is_active: true });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const { data } = await repository.regions.get();
      setRegions(data.items || data);
    } catch (e) {
      setRegions([]);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      return;
    }
    try {
      const payload = { name: form.name, is_active: form.is_active };
      if (editId) {
        await repository.regions.put(editId, payload);
      } else {
        await repository.regions.post(payload);
      }
      setShowDialog(false);
      setForm({ name: "", is_active: true });
      setEditId(null);
      loadRegions();
    } catch (err) {}
  };

  const handleEdit = (rowData) => {
    setForm({ name: rowData.name, is_active: rowData.is_active ?? true });
    setEditId(rowData.id);
    setShowDialog(true);
  };

  const activeTemplate = (rowData) => (
    <span className={rowData.is_active ? "text-green-500" : "text-red-500"}>
      {rowData.is_active ? "Ativo" : "Inativo"}
    </span>
  );

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
        <h2 className="text-xl font-bold">Regiões</h2>
        <Button
          label="Nova Região"
          icon="pi pi-plus"
          onClick={() => {
            setEditId(null);
            setForm({ name: "", is_active: true });
            setShowDialog(true);
          }}
        />
      </div>

      <DataTable
        value={regions}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="is_active" header="Status" body={activeTemplate} />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editId ? "Editar Região" : "Nova Região"}
      >
        <div className="field mb-3">
          <label className="block text-900 font-medium mb-2">Nome *</label>
          <InputText
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="field mb-3">
          <label className="flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Ativo
          </label>
        </div>
        <Button label="Salvar" onClick={handleSave} />
      </Dialog>
    </div>
  );
}
