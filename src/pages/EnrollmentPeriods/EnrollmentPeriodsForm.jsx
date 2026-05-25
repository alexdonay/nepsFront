import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

export default function EnrollmentPeriodsForm({
  visible,
  onHide,
  form,
  setForm,
  onSave,
}) {
  return (
    <Dialog visible={visible} onHide={onHide} header="Novo Período">
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
          dateFormat="dd/mm/yy"
          className="w-full"
        />
      </div>
      <div className="field mb-3">
        <label>Data Fim Entidades Prioritárias</label>
        <Calendar
          value={form.priority_end_date}
          onChange={(e) => setForm({ ...form, priority_end_date: e.value })}
          dateFormat="dd/mm/yy"
          className="w-full"
        />
      </div>
      <div className="field mb-3">
        <label>Data Início Demais Entidades</label>
        <Calendar
          value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.value })}
          dateFormat="dd/mm/yy"
          className="w-full"
        />
      </div>
      <div className="field mb-3">
        <label>Data Fim Demais Entidades</label>
        <Calendar
          value={form.end_date}
          onChange={(e) => setForm({ ...form, end_date: e.value })}
          dateFormat="dd/mm/yy"
          className="w-full"
        />
      </div>

      <Button label="Salvar" onClick={onSave} />
    </Dialog>
  );
}
