import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { TabPanel, TabView } from "primereact/tabview";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { getErrorMessage } from "../../utils/errorHandler";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

const EMPTY_DISC = { name: "", is_active: true };

export default function CourseDetail() {
  const navigate = useNavigate();
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.course, {});
  const courseId = routeContext?.id;

  // ── Dados do curso ─────────────────────────────────────────────────────────
  const [courseName, setCourseName] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Disciplinas ────────────────────────────────────────────────────────────
  const [disciplines, setDisciplines] = useState([]);
  const [discLoading, setDiscLoading] = useState(false);

  // ── Dialog disciplina ──────────────────────────────────────────────────────
  const [discDialog, setDiscDialog] = useState(false);
  const [editingDiscId, setEditingDiscId] = useState(null);
  const [discForm, setDiscForm] = useState(EMPTY_DISC);
  const [discSaving, setDiscSaving] = useState(false);
  const [discError, setDiscError] = useState("");

  useEffect(() => {
    if (courseId) {
      loadCourse();
      loadDisciplines();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const { data } = await repository.courses.getById(courseId);
      setCourseName(data.name || "");
    } catch (e) {
      setFormError(getErrorMessage(e, "Erro ao carregar curso"));
    }
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    setFormLoading(true);
    setFormError("");
    try {
      if (courseId) {
        await repository.courses.put(courseId, { name: courseName });
      } else {
        await repository.courses.post({ name: courseName });
      }
      navigate("/courses/");
    } catch (e) {
      setFormError(getErrorMessage(e, "Erro ao salvar"));
      setFormLoading(false);
    }
  };

  const loadDisciplines = useCallback(async () => {
    if (!courseId) return;
    try {
      setDiscLoading(true);
      const { data } = await repository.courses.getById(courseId);
      setDisciplines(data.disciplines || []);
    } catch {
      setDisciplines([]);
    } finally {
      setDiscLoading(false);
    }
  }, [courseId]);

  // ── Dialog ─────────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingDiscId(null);
    setDiscForm(EMPTY_DISC);
    setDiscError("");
    setDiscDialog(true);
  };

  const openEdit = (row) => {
    setEditingDiscId(row.id);
    setDiscForm({ name: row.name || "", is_active: row.is_active ?? true });
    setDiscError("");
    setDiscDialog(true);
  };

  const closeDialog = () => {
    setDiscDialog(false);
    setEditingDiscId(null);
    setDiscForm(EMPTY_DISC);
    setDiscError("");
  };

  const saveDisc = async (e) => {
    e.preventDefault();
    if (!discForm.name.trim()) return;
    setDiscSaving(true);
    setDiscError("");
    try {
      const payload = { name: discForm.name, is_active: discForm.is_active };
      if (editingDiscId) {
        await repository.disciplines.put(editingDiscId, payload);
      } else {
        const { data: newDisc } = await repository.disciplines.post(payload);
        await repository.courses.linkDiscipline(courseId, newDisc.id);
      }
      closeDialog();
      loadDisciplines();
    } catch (e) {
      setDiscError(getErrorMessage(e, "Erro ao salvar disciplina"));
    } finally {
      setDiscSaving(false);
    }
  };

  return (
    <div className="surface-card p-4 border-round">
      <div className="flex align-items-center gap-2 mb-4">
        <Button icon="pi pi-arrow-left" text onClick={() => navigate("/courses/")} />
        <h2 className="text-xl font-bold m-0">
          {courseId ? courseName || "Curso" : "Novo Curso"}
        </h2>
      </div>

      <TabView>
        {/* ── Aba: Dados ─────────────────────────────────────────────────── */}
        <TabPanel header="Dados">
          {formError && <Message severity="error" text={formError} className="mb-3 w-full" />}
          <form onSubmit={saveCourse} className="grid">
            <div className="field col-12 md:col-6">
              <label className="block font-medium mb-2">Nome *</label>
              <InputText
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full"
                required
                autoComplete="off"
              />
            </div>
            <div className="col-12 flex justify-content-end gap-2 mt-2">
              <Button type="button" label="Cancelar" severity="secondary" onClick={() => navigate("/courses/")} />
              <Button type="submit" label="Salvar" loading={formLoading} />
            </div>
          </form>
        </TabPanel>

        {/* ── Aba: Disciplinas ───────────────────────────────────────────── */}
        {courseId && (
          <TabPanel header="Disciplinas">
            <div className="flex justify-content-end mb-3">
              <Button label="Nova Disciplina" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable
              value={disciplines}
              loading={discLoading}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20, 50]}
              emptyMessage="Nenhuma disciplina cadastrada para este curso."
            >
              <Column field="name" header="Nome" />
              <Column
                header="Status"
                body={(r) => (
                  <span className={r.is_active !== false ? "text-green-500" : "text-red-400"}>
                    {r.is_active !== false ? "Ativo" : "Inativo"}
                  </span>
                )}
              />
              <Column
                header="Ações"
                body={(r) => (
                  <Button icon="pi pi-pencil" text tooltip="Editar" tooltipOptions={{ position: "top" }} onClick={() => openEdit(r)} />
                )}
              />
            </DataTable>
          </TabPanel>
        )}
      </TabView>

      {/* ── Dialog: disciplina ─────────────────────────────────────────────── */}
      <Dialog
        header={editingDiscId ? "Editar Disciplina" : "Nova Disciplina"}
        visible={discDialog}
        style={{ width: "32rem", maxWidth: "96vw" }}
        onHide={closeDialog}
        blockScroll
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" text onClick={closeDialog} />
            <Button label="Salvar" loading={discSaving} onClick={saveDisc} />
          </div>
        }
      >
        {discError && <Message severity="error" text={discError} className="mb-3 w-full" />}
        <form onSubmit={saveDisc} className="p-fluid">
          <div className="field mb-3">
            <label className="block font-medium mb-2">Nome *</label>
            <InputText
              value={discForm.name}
              onChange={(e) => setDiscForm({ ...discForm, name: e.target.value })}
              required
              autoComplete="off"
            />
          </div>
          <label className="flex align-items-center gap-2">
            <Checkbox
              checked={discForm.is_active}
              onChange={(e) => setDiscForm({ ...discForm, is_active: e.checked })}
            />
            Ativo
          </label>
        </form>
      </Dialog>
    </div>
  );
}
