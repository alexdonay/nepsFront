import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";
import { getErrorMessage } from "../../utils/errorHandler";

function parseMasked(str) {
  if (!str || str.includes("_")) return null;
  const [d, m, y] = str.split("/").map(Number);
  if (!d || !m || !y || y < 1900) return null;
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  return date;
}

function toDisplay(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function MaskedDateInput({ value, onChange, placeholder, disabled, minDate, maxDate }) {
  const calRef = useRef(null);
  const [text, setText] = useState(toDisplay(value));

  useEffect(() => {
    setText(toDisplay(value));
  }, [value]);

  const handleMaskComplete = (e) => {
    const parsed = parseMasked(e.value);
    if (parsed) onChange(parsed);
  };

  const handleMaskChange = (e) => {
    setText(e.value);
    const parsed = parseMasked(e.value);
    if (parsed) onChange(parsed);
    else if (!e.value || e.value.replace(/_/g, "").replace(/\//g, "").length === 0) onChange(null);
  };

  const handleCalendarChange = (e) => {
    if (e.value) {
      onChange(e.value);
      setText(toDisplay(e.value));
      calRef.current?.hide();
    }
  };

  return (
    <div className="p-inputgroup flex-1">
      <InputMask
        mask="99/99/9999"
        value={text}
        onChange={handleMaskChange}
        onComplete={handleMaskComplete}
        placeholder={placeholder || "dd/mm/aaaa"}
        disabled={disabled}
        className="w-full"
        slotChar="_"
      />
      <Button
        icon="pi pi-calendar"
        type="button"
        className="p-button-outlined"
        disabled={disabled}
        onClick={() => calRef.current?.show()}
      />
      <Calendar
        ref={calRef}
        value={value}
        onChange={handleCalendarChange}
        dateFormat="dd/mm/yy"
        inline={false}
        minDate={minDate}
        maxDate={maxDate}
        style={{ display: "none" }}
        appendTo="self"
      />
    </div>
  );
}

function DateRangeField({ label, startValue, endValue, onStartChange, onEndChange, disabled }) {
  return (
    <div className="field mb-4">
      <label className="block text-900 font-medium mb-2">{label}</label>
      <div className="flex align-items-center gap-2">
        <MaskedDateInput
          value={startValue}
          onChange={onStartChange}
          placeholder="Início dd/mm/aaaa"
          disabled={disabled}
          maxDate={endValue || undefined}
        />
        <span className="text-500 font-medium px-1">→</span>
        <MaskedDateInput
          value={endValue}
          onChange={onEndChange}
          placeholder="Fim dd/mm/aaaa"
          disabled={disabled}
          minDate={startValue || undefined}
        />
      </div>
    </div>
  );
}

export default function EnrollmentPeriodsForm() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.period, {});
  const { id } = routeContext;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    priority_start_date: null,
    priority_end_date: null,
    start_date: null,
    end_date: null,
  });

  const isEdit = !!id;

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [datePart] = dateStr.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const toLocalDate = (date) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    if (isEdit) loadPeriod();
  }, [id]);

  const loadPeriod = async () => {
    try {
      setLoading(true);
      const { data } = await repository.periods.getById(id);
      setForm({
        name: data.name || "",
        priority_start_date: parseDate(data.priority_start_date),
        priority_end_date: parseDate(data.priority_end_date),
        start_date: parseDate(data.start_date),
        end_date: parseDate(data.end_date),
      });
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar período"));
    } finally {
      setLoading(false);
    }
  };

  const patch = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    try {
      setLoading(true);
      setError("");

      const payload = { name: form.name.trim() };
      if (form.priority_start_date) payload.priority_start_date = toLocalDate(form.priority_start_date);
      if (form.priority_end_date)   payload.priority_end_date   = toLocalDate(form.priority_end_date);
      if (form.start_date)          payload.start_date          = toLocalDate(form.start_date);
      if (form.end_date)            payload.end_date             = toLocalDate(form.end_date);

      if (isEdit) {
        await repository.periods.patch(id, payload);
      } else {
        await repository.periods.post(payload);
      }

      navigate("/periods");
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao salvar período"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">
        {isEdit ? "Editar Período de Inscrição" : "Novo Período de Inscrição"}
      </h2>

      {error && <Message severity="error" text={error} className="mb-4 w-full" />}

      <form onSubmit={handleSubmit}>
        <div className="field mb-4">
          <label className="block text-900 font-medium mb-2">Nome *</label>
          <InputText
            value={form.name}
            onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setError(""); }}
            className="w-full"
            placeholder="Digite o nome do período"
            disabled={loading}
            required
          />
        </div>

        <DateRangeField
          label="Período Prioritário"
          startValue={form.priority_start_date}
          endValue={form.priority_end_date}
          onStartChange={patch("priority_start_date")}
          onEndChange={patch("priority_end_date")}
          disabled={loading}
        />

        <DateRangeField
          label="Período Geral"
          startValue={form.start_date}
          endValue={form.end_date}
          onStartChange={patch("start_date")}
          onEndChange={patch("end_date")}
          disabled={loading}
        />

        <div className="flex gap-2">
          <Button label="Salvar" icon="pi pi-check" type="submit" loading={loading} disabled={loading} />
          <Button label="Cancelar" icon="pi pi-times" type="button" severity="secondary" onClick={() => navigate("/periods")} disabled={loading} />
        </div>
      </form>
    </div>
  );
}
