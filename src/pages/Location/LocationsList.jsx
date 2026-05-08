import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { repository } from "../../services/repository";

export default function LocationsList() {
  const [locations, setLocations] = useState([]);
  const [healthUnits, setHealthUnits] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    name: "",
    health_unit_id: null,
    morning_slots: 0,
    afternoon_slots: 0,
    evening_slots: 0,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadLocations();
    loadHealthUnits();
  }, []);

  const loadLocations = async () => {
    try {
      const { data } = await repository.locations.get();
      setLocations(data);
    } catch (e) {
      setLocations([]);
    }
  };

  const loadHealthUnits = async () => {
    try {
      const { data } = await repository.healthUnits.get();
      setHealthUnits(data);
    } catch (e) {
      setHealthUnits([]);
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await repository.locations.put(editId, form);
      } else {
        await repository.locations.post(form);
      }
      setShowDialog(false);
      setForm({
        name: "",
        health_unit_id: null,
        morning_slots: 0,
        afternoon_slots: 0,
        evening_slots: 0,
      });
      setEditId(null);
      loadLocations();
    } catch (err) {
      alert(err.response?.data?.detail || "Erro ao salvar");
    }
  };

  const handleEdit = (rowData) => {
    setForm({
      name: rowData.name,
      health_unit_id: rowData.health_unit_id,
      morning_slots: rowData.morning_slots,
      afternoon_slots: rowData.afternoon_slots,
      evening_slots: rowData.evening_slots,
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

  const unitTemplate = (rowData) => {
    const unit = healthUnits.find((u) => u.id === rowData.health_unit_id);
    return unit ? unit.name : "-";
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Locais de Estágio</h2>
        <Button
          label="Novo Local"
          icon="pi pi-plus"
          onClick={() => {
            setEditId(null);
            setForm({
              name: "",
              health_unit_id: null,
              morning_slots: 0,
              afternoon_slots: 0,
              evening_slots: 0,
            });
            setShowDialog(true);
          }}
        />
      </div>

      <DataTable value={locations} tableStyle={{ minWidth: "50rem" }}>
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column header="Unidade de Saúde" body={unitTemplate} />
        <Column field="morning_slots" header="Manhã" />
        <Column field="afternoon_slots" header="Tarde" />
        <Column field="evening_slots" header="Noite" />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editId ? "Editar Local" : "Novo Local"}
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
          <label>Unidade de Saúde</label>
          <Dropdown
            value={form.health_unit_id}
            options={healthUnits}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, health_unit_id: e.value })}
            className="w-full"
            placeholder="Selecione"
          />
        </div>
        <div className="grid">
          <div className="col-4">
            <label>Vagas Manhã</label>
            <InputNumber
              value={form.morning_slots}
              onChange={(e) => setForm({ ...form, morning_slots: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-4">
            <label>Vagas Tarde</label>
            <InputNumber
              value={form.afternoon_slots}
              onChange={(e) => setForm({ ...form, afternoon_slots: e.value })}
              className="w-full"
            />
          </div>
          <div className="col-4">
            <label>Vagas Noite</label>
            <InputNumber
              value={form.evening_slots}
              onChange={(e) => setForm({ ...form, evening_slots: e.value })}
              className="w-full"
            />
          </div>
        </div>
        <Button label="Salvar" onClick={handleSave} className="mt-3" />
      </Dialog>
    </div>
  );
}
