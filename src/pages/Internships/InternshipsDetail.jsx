import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { TabPanel, TabView } from "primereact/tabview";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import { repository } from "../../services/repository";
import { getCurrentInternshipId, getCurrentPermission } from "../../utils/auth";
import { getErrorMessage } from "../../utils/errorHandler";
import {
  ROUTE_CONTEXT_KEYS,
  getRouteContext,
  setRouteContext,
} from "../../utils/routeContext";

const EMPTY_ROOM_FORM = {
  name: "",
  room_capacity: null,
  has_gurney: false,
  is_active: true,
};

export default function InternshipsDetail() {
  const navigate = useNavigate();
  const isCampoEstagio = getCurrentPermission() === PERMISSIONS.CAMPO_ESTAGIO;

  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.service, {});
  const internshipId = isCampoEstagio
    ? getCurrentInternshipId()
    : routeContext.id;

  const [form, setForm] = useState({
    name: "",
    region_id: null,
    is_active: true,
    user_email: "",
  });
  const [regions, setRegions] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomPage, setRoomPage] = useState(0);
  const [roomRows] = useState(10);
  const [roomTotal, setRoomTotal] = useState(0);

  const [roomDialog, setRoomDialog] = useState(false);
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM_FORM);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomFormLoading, setRoomFormLoading] = useState(false);
  const [roomFormError, setRoomFormError] = useState("");

  useEffect(() => {
    loadRegions();
    if (internshipId) {
      loadInternship();
      loadRooms();
    }
  }, [internshipId]);

  const loadRegions = async () => {
    try {
      const { data } = await repository.regions.get();
      const list = data.items || data || [];
      setRegions(list.map((r) => ({ label: r.name, value: r.id })));
    } catch (_) {}
  };

  const loadInternship = async () => {
    try {
      const { data } = await repository.internships.getById(internshipId);
      setForm({
        name: data.name || "",
        region_id: data.region_id || null,
        is_active: data.is_active ?? true,
        user_email: data.email || data.user_email || "",
      });
    } catch (e) {
      setFormError(getErrorMessage(e, "Erro ao carregar campo de estágio"));
    }
  };

  const loadRooms = useCallback(
    async (page = 0) => {
      if (!internshipId) return;
      try {
        setRoomsLoading(true);
        const { data } = await repository.rooms.get({
          internship_id: internshipId,
          page: Math.floor(page / roomRows) + 1,
          per_page: roomRows,
        });
        setRooms(data.items || data || []);
        setRoomTotal(data.pagination?.total || 0);
      } catch (_) {
        setRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    },
    [internshipId, roomRows],
  );

  const saveInternship = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setFormLoading(true);
    setFormError("");
    try {
      const payload = {
        name: form.name,
        region_id: form.region_id,
        is_active: form.is_active,
        user_email: form.user_email || null,
      };
      if (internshipId) {
        await repository.internships.put(internshipId, payload);
      } else {
        await repository.internships.post(payload);
      }
      navigate("/internships");
    } catch (e) {
      setFormError(getErrorMessage(e, "Erro ao salvar"));
      setFormLoading(false);
    }
  };

  const openNewRoom = () => {
    setEditingRoomId(null);
    setRoomForm(EMPTY_ROOM_FORM);
    setRoomFormError("");
    setRoomDialog(true);
  };

  const openEditRoom = (room) => {
    setEditingRoomId(room.id);
    setRoomForm({
      name: room.name || "",
      room_capacity: room.room_capacity ?? null,
      has_gurney: room.has_gurney ?? false,
      is_active: room.is_active ?? true,
    });
    setRoomFormError("");
    setRoomDialog(true);
  };

  const closeRoomDialog = () => {
    setRoomDialog(false);
    setEditingRoomId(null);
    setRoomForm(EMPTY_ROOM_FORM);
    setRoomFormError("");
  };

  const saveRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.name || !roomForm.room_capacity) return;
    setRoomFormLoading(true);
    setRoomFormError("");
    try {
      const payload = { ...roomForm, internships_id: internshipId };
      if (editingRoomId) {
        await repository.rooms.put(editingRoomId, payload);
      } else {
        await repository.rooms.post(payload);
      }
      closeRoomDialog();
      loadRooms(roomPage);
    } catch (e) {
      setRoomFormError(getErrorMessage(e, "Erro ao salvar sala"));
    } finally {
      setRoomFormLoading(false);
    }
  };

  const handleManageSchedule = (room) => {
    setRouteContext(ROUTE_CONTEXT_KEYS.room, { id: room.id });
    setRouteContext(ROUTE_CONTEXT_KEYS.schedule, { roomId: room.id });
    navigate("/rooms/schedules");
  };

  return (
    <div className="surface-card p-4 border-round">
      <div className="flex align-items-center gap-2 mb-4">
        {!isCampoEstagio && (
          <Button
            icon="pi pi-arrow-left"
            text
            onClick={() => navigate("/internships")}
          />
        )}
        <h2 className="text-xl font-bold m-0">
          {isCampoEstagio
            ? "Minhas Salas"
            : internshipId
              ? form.name || "Campo de Estágio"
              : "Novo Campo de Estágio"}
        </h2>
      </div>

      <TabView>
        {!isCampoEstagio && (
          <TabPanel header="Dados">
            {formError && (
              <Message
                severity="error"
                text={formError}
                className="mb-3 w-full"
              />
            )}

            <form onSubmit={saveInternship} className="grid">
              <div className="field col-12 md:col-6">
                <label className="block font-medium mb-2">Nome *</label>
                <InputText
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label className="block font-medium mb-2">Território</label>
                <Dropdown
                  value={form.region_id}
                  options={regions}
                  onChange={(e) => setForm({ ...form, region_id: e.value })}
                  placeholder="Selecione uma região"
                  className="w-full"
                  showClear
                />
              </div>

              <div className="field col-12 md:col-6">
                <label className="block font-medium mb-2">
                  Email do Responsável
                </label>
                <InputText
                  value={form.user_email}
                  onChange={(e) =>
                    setForm({ ...form, user_email: e.target.value })
                  }
                  className="w-full"
                  placeholder="email@exemplo.com"
                  autoComplete="off"
                />
              </div>

              <div className="col-12 md:col-6 flex align-items-center pt-2">
                <label className="flex align-items-center gap-2">
                  <Checkbox
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.checked })}
                  />
                  Ativo
                </label>
              </div>

              <div className="col-12 flex justify-content-end gap-2 mt-2">
                <Button
                  type="button"
                  label="Cancelar"
                  severity="secondary"
                  onClick={() => navigate("/internships")}
                />
                <Button type="submit" label="Salvar" loading={formLoading} />
              </div>
            </form>
          </TabPanel>
        )}

        {internshipId && (
          <TabPanel header="Salas">
            <div className="flex justify-content-end mb-3">
              <Button
                label="Nova Sala"
                icon="pi pi-plus"
                onClick={openNewRoom}
              />
            </div>

            <DataTable
              value={rooms}
              loading={roomsLoading}
              paginator
              first={roomPage}
              rows={roomRows}
              totalRecords={roomTotal}
              lazy
              onPage={(e) => {
                setRoomPage(e.first);
                loadRooms(e.first);
              }}
              emptyMessage="Nenhuma sala cadastrada para este campo."
              rowsPerPageOptions={[10, 20, 50]}
              rowClassName={(r) => (r.has_gurney ? "surface-blue-row" : "")}
            >
              <Column
                field="name"
                header="Nome"
                body={(r) => (
                  <span
                    className={
                      r.has_gurney ? "text-blue-600 font-semibold" : ""
                    }
                  >
                    {r.name}
                  </span>
                )}
              />
              <Column field="room_capacity" header="Capacidade" />
              <Column
                header="Maca"
                body={(r) =>
                  r.has_gurney ? (
                    <span className="inline-flex align-items-center gap-1 px-2 py-1 border-round text-xs font-semibold bg-blue-100 text-blue-700">
                      <i className="pi pi-check-circle" /> Sim
                    </span>
                  ) : (
                    <span className="text-color-secondary text-sm">Não</span>
                  )
                }
              />
              <Column
                header="Status"
                body={(r) => (
                  <span
                    className={r.is_active ? "text-green-500" : "text-red-400"}
                  >
                    {r.is_active ? "Ativo" : "Inativo"}
                  </span>
                )}
              />
              <Column
                header="Ações"
                body={(r) => (
                  <div className="flex gap-2">
                    <Button
                      icon="pi pi-calendar"
                      text
                      tooltip="Gerir Agenda"
                      tooltipOptions={{ position: "top" }}
                      onClick={() => handleManageSchedule(r)}
                    />
                    <Button
                      icon="pi pi-pencil"
                      text
                      tooltip="Editar"
                      tooltipOptions={{ position: "top" }}
                      onClick={() => openEditRoom(r)}
                    />
                  </div>
                )}
              />
            </DataTable>
          </TabPanel>
        )}
      </TabView>

      <Dialog
        header={editingRoomId ? "Editar Sala" : "Nova Sala"}
        visible={roomDialog}
        style={{ width: "36rem", maxWidth: "96vw" }}
        onHide={closeRoomDialog}
        blockScroll
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" text onClick={closeRoomDialog} />
            <Button
              label="Salvar"
              loading={roomFormLoading}
              onClick={saveRoom}
            />
          </div>
        }
      >
        {roomFormError && (
          <Message
            severity="error"
            text={roomFormError}
            className="mb-3 w-full"
          />
        )}

        <form onSubmit={saveRoom} className="grid p-fluid">
          <div className="field col-12">
            <label className="block font-medium mb-2">Nome *</label>
            <InputText
              value={roomForm.name}
              onChange={(e) =>
                setRoomForm({ ...roomForm, name: e.target.value })
              }
              required
              autoComplete="off"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label className="block font-medium mb-2">Capacidade *</label>
            <InputNumber
              value={roomForm.room_capacity}
              onValueChange={(e) =>
                setRoomForm({ ...roomForm, room_capacity: e.value })
              }
              min={1}
            />
          </div>

          <div className="col-12 flex gap-4 align-items-center pt-1">
            <label className="flex align-items-center gap-2">
              <Checkbox
                checked={roomForm.has_gurney}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, has_gurney: e.checked })
                }
              />
              Possui maca
            </label>
            <label className="flex align-items-center gap-2">
              <Checkbox
                checked={roomForm.is_active}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, is_active: e.checked })
                }
              />
              Ativo
            </label>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
