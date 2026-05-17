import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";

export default function InternshipForm() {
  const [form, setForm] = useState({
    student_id: null,
    location_id: null,
    period_id: null,
    shift: "morning",
  });
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [studentsRes, locationsRes, periodsRes] = await Promise.all([
        repository.students.get(),
        repository.rooms.get(),
        repository.periods.get(),
      ]);
      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
      setPeriods(periodsRes.data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await repository.vinculos.post(form);
      navigate("/internships");
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao vincular");
    } finally {
      setLoading(false);
    }
  };

  const shiftOptions = [
    { label: "Manhã", value: "morning" },
    { label: "Tarde", value: "afternoon" },
    { label: "Noite", value: "evening" },
  ];

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">Vincular Aluno</h2>

      {error && <Message severity="error" text={error} className="mb-3" />}

      <form onSubmit={handleSubmit}>
        <div className="field mb-3">
          <label>Aluno *</label>
          <Dropdown
            value={form.student_id}
            options={students}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, student_id: e.value })}
            className="w-full"
            placeholder="Selecione"
            filter
          />
        </div>

        <div className="field mb-3">
          <label>Sala *</label>
          <Dropdown
            value={form.location_id}
            options={rooms}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, location_id: e.value })}
            className="w-full"
            placeholder="Selecione"
            filter
          />
        </div>

        <div className="field mb-3">
          <label>Período *</label>
          <Dropdown
            value={form.period_id}
            options={periods}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, period_id: e.value })}
            className="w-full"
            placeholder="Selecione"
          />
        </div>

        <div className="field mb-3">
          <label>Turno *</label>
          <Dropdown
            value={form.shift}
            options={shiftOptions}
            onChange={(e) => setForm({ ...form, shift: e.value })}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" label="Vincular" loading={loading} />
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/internships")}
          />
        </div>
      </form>
    </div>
  );
}
