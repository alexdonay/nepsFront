import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import { getCurrentPermission, normalizePermission } from "../../utils/auth";

export default function EnrollmentPeriods() {
  const [periods, setPeriods] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    name: "",
    priority_start_date: null,
    priority_end_date: null,
    start_date: null,
    end_date: null,
  });
  const currentPermission = normalizePermission(getCurrentPermission());
  const canCreatePeriod = currentPermission !== PERMISSIONS.INSTITUICAO_ENSINO;

  const today = new Date();

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      const { data } = await repository.periods.get();
      setPeriods(data.items || data);
    } catch (e) {
      setPeriods([]);
    }
  };

  const currentPeriod = periods.find((p) => {
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    return start <= today && end >= today;
  });

  const handleSave = async () => {
    if (!canCreatePeriod) {
      return;
    }

    try {
      await repository.periods.post({
        name: form.name,
        priority_start_date: form.priority_start_date
          ?.toISOString()
          .split("T")[0],
        priority_end_date: form.priority_end_date?.toISOString().split("T")[0],
        start_date: form.start_date?.toISOString().split("T")[0],
        end_date: form.end_date?.toISOString().split("T")[0],
      });
      setShowDialog(false);
      setForm({
        name: "",
        priority_start_date: null,
        priority_end_date: null,
        start_date: null,
        end_date: null,
      });
      loadPeriods();
    } catch (err) {}
  };

  const dateTemplate = (rowData) =>
    new Date(rowData.start_date).toLocaleDateString();

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Períodos de Inscrição</h2>
        {canCreatePeriod && (
          <Button
            label="Abrir Período"
            icon="pi pi-plus"
            onClick={() => setShowDialog(true)}
          />
        )}
      </div>

      {currentPeriod && (
        <div className="surface-100 p-3 border-round mb-3">
          <strong>Período Ativo:</strong> {currentPeriod.name} (
          {dateTemplate(currentPeriod)} -{" "}
          {new Date(currentPeriod.end_date).toLocaleDateString()})
        </div>
      )}

      <DataTable
        value={periods}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
      >
        <Column field="name" header="Nome" />
        <Column
          field="start_date"
          header="Início"
          body={(row) => new Date(row.start_date).toLocaleDateString()}
        />
        <Column
          field="end_date"
          header="Fim"
          body={(row) => new Date(row.end_date).toLocaleDateString()}
        />
        <Column
          field="is_active"
          header="Status"
          body={(row) => (row.is_active ? "Ativo" : "Encerrado")}
        />
      </DataTable>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header="Novo Período"
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
          <label>Data Início Entidades Prioritárias</label>
          <Calendar
            value={form.priority_start_date}
            onChange={(e) => setForm({ ...form, priority_start_date: e.value })}
            className="w-full"
          />
        </div>
        <div className="field mb-3">
          <label>Data Fim Entidades Prioritárias</label>
          <Calendar
            value={form.priority_end_date}
            onChange={(e) => setForm({ ...form, priority_end_date: e.value })}
            className="w-full"
          />
        </div>
        <div className="field mb-3">
          <label>Data Início Demais Entidades</label>
          <Calendar
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.value })}
            className="w-full"
          />
        </div>
        <div className="field mb-3">
          <label>Data Fim Demais Entidades</label>
          <Calendar
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.value })}
            className="w-full"
          />
        </div>

        <Button label="Salvar" onClick={handleSave} />
      </Dialog>
    </div>
  );
}
