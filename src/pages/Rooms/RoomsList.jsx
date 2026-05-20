import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { repository } from "../../services/repository";

const DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
const SHIFTS = ["MAN", "TRD", "VSP"];
const SHIFT_LABELS = { MAN: "Manhã", TRD: "Tarde", VSP: "Vespertino" };

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({
    name: "",
    service_id: null,
    room_capacity: 0,
    has_gurney: false,
    is_active: true,
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadRooms();
    loadServices();
  }, []);

  const loadRooms = async () => {
    try {
      const { data } = await repository.rooms.get();
      setRooms(data.items || data);
    } catch (e) {
      setRooms([]);
    }
  };

  const loadServices = async () => {
    try {
      const { data } = await repository.services.get();
      setServices(
        (data.items || data).map((s) => ({ label: s.name, value: s.id })),
      );
    } catch (e) {
      setServices([]);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.service_id || !form.room_capacity) {
      return;
    }
    try {
      const payload = {
        name: form.name,
        service_id: form.service_id,
        room_capacity: form.room_capacity,
        has_gurney: form.has_gurney,
        is_active: form.is_active,
      };
      if (editId) {
        await repository.rooms.put(editId, payload);
      } else {
        await repository.rooms.post(payload);
      }
      setShowDialog(false);
      setForm({
        name: "",
        service_id: null,
        room_capacity: 0,
        has_gurney: false,
      });
      setEditId(null);
      loadRooms();
    } catch (err) {}
  };

  const handleEdit = (rowData) => {
    setForm({
      name: rowData.name,
      service_id: rowData.service_id,
      room_capacity: rowData.room_capacity,
      has_gurney: rowData.has_gurney ?? false,
      is_active: rowData.is_active ?? true,
    });
    setEditId(rowData.id);
    setShowDialog(true);
  };

  const handleManage = async (rowData) => {
    setSelectedRoom(rowData);
    try {
      const { data } = await repository.serviceSchedules.getByRoom(rowData.id);
      setSchedules(data);
    } catch (e) {
      setSchedules([]);
    }
    setShowScheduleDialog(true);
  };

  const getScheduleForCell = (day, shift) => {
    return schedules.find(
      (s) => s.week_day === day && s.shift === shift && s.is_active
    );
  };

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-calendar"
        className="p-button-text"
        tooltip="Gerir Agenda"
        tooltipOptions={{ position: "top" }}
        onClick={() => handleManage(rowData)}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        onClick={() => handleEdit(rowData)}
      />
    </div>
  );

  const serviceTemplate = (rowData) => {
    const serv = services.find((s) => s.value === rowData.service_id);
    return serv ? serv.label : "-";
  };

  const gurneyTemplate = (rowData) => (rowData.has_gurney ? "Sim" : "Não");

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Salas</h2>
        <Button
          label="Nova Sala"
          icon="pi pi-plus"
          onClick={() => {
            setEditId(null);
            setForm({
              name: "",
              service_id: null,
              room_capacity: 0,
              has_gurney: false,
              is_active: true,
            });
            setShowDialog(true);
          }}
        />
      </div>

      <DataTable
        value={rooms}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={10}
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="room_capacity" header="Capacidade" />
        <Column header="Serviço" body={serviceTemplate} />
        <Column header="Possui Maca" body={gurneyTemplate} />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editId ? "Editar Sala" : "Nova Sala"}
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
          <label className="block text-900 font-medium mb-2">Serviço *</label>
          <Dropdown
            value={form.service_id}
            options={services}
            onChange={(e) => setForm({ ...form, service_id: e.value })}
            placeholder="Selecione"
            className="w-full"
          />
        </div>
        <div className="field mb-3">
          <label className="block text-900 font-medium mb-2">
            Capacidade *
          </label>
          <InputNumber
            value={form.room_capacity}
            onChange={(e) => setForm({ ...form, room_capacity: e.value })}
            className="w-full"
          />
        </div>
        <div className="field mb-3">
          <label className="flex align-items-center gap-2">
            <Checkbox
              checked={form.has_gurney}
              onChange={(e) => setForm({ ...form, has_gurney: e.checked })}
            />
            Possui maca
          </label>
        </div>
        <div className="field mb-3">
          <label className="flex align-items-center gap-2">
            <Checkbox
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.checked })}
            />
            Ativo
          </label>
        </div>
        <Button label="Salvar" onClick={handleSave} className="mt-3" />
      </Dialog>

      <Dialog
        visible={showScheduleDialog}
        onHide={() => setShowScheduleDialog(false)}
        header={`Agenda - ${selectedRoom?.name || ""}`}
        style={{ width: "80vw", maxWidth: "900px" }}
      >
        <DataTable value={SHIFTS} tableStyle={{ minWidth: "50rem" }} stripedRows>
          <Column
            header="Turno"
            body={(row) => SHIFT_LABELS[row]}
            style={{ fontWeight: "bold", width: "120px" }}
          />
          {DAYS.map((day) => (
            <Column
              key={day}
              header={day}
              body={(row) => {
                const schedule = getScheduleForCell(day, row);
                return schedule ? (
                  <div className="text-green-700 font-medium">
                    {schedule.student_id ? `Aluno #${schedule.student_id}` : "Livre"}
                  </div>
                ) : (
                  <span className="text-500">-</span>
                );
              }}
            />
          ))}
        </DataTable>
      </Dialog>
    </div>
  );
}
