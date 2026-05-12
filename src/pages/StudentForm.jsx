import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CpfInput from "../components/CpfInput";
import { repository } from "../services/repository";

export default function StudentForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    course_id: null,
    semester: null,
    institution_id: null,
  });
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOptions();
    if (id) loadStudent();
  }, []);

  const loadOptions = async () => {
    try {
      const [coursesRes, instRes] = await Promise.all([
        repository.courses.get(),
        repository.institutions.get(),
      ]);
      setCourses(coursesRes.data);
      setInstitutions(instRes.data);
    } catch (e) {}
  };

  const loadStudent = async () => {
    try {
      const { data } = await repository.students.getById(id);
      setForm(data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (id) await repository.students.put(id, form);
      else await repository.students.post(form);
      navigate("/students");
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">{id ? "Editar" : "Novo"} Aluno</h2>

      {error && <Message severity="error" text={error} className="mb-3" />}

      <form onSubmit={handleSubmit}>
        <div className="field mb-3">
          <label>Nome *</label>
          <InputText
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div className="field mb-3">
          <label>CPF</label>
          <CpfInput
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label>Email *</label>
          <InputText
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div className="field mb-3">
          <label>Telefone</label>
          <InputText
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label>Curso *</label>
          <Dropdown
            value={form.course_id}
            options={courses}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, course_id: e.value })}
            className="w-full"
            placeholder="Selecione"
            required
          />
        </div>

        <div className="field mb-3">
          <label>Semestre</label>
          <InputNumber
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.value })}
            className="w-full"
          />
        </div>

        <div className="field mb-3">
          <label>Instituição *</label>
          <Dropdown
            value={form.institution_id}
            options={institutions}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => setForm({ ...form, institution_id: e.value })}
            className="w-full"
            placeholder="Selecione"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" label="Salvar" loading={loading} />
          <Button
            type="button"
            label="Cancelar"
            className="p-button-secondary"
            onClick={() => navigate("/students")}
          />
        </div>
      </form>
    </div>
  );
}
