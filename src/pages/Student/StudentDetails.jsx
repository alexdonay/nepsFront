import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

const FIELD_SECTIONS = [
  {
    title: "Dados pessoais",
    fields: ["name", "cpf", "email", "phone"],
  },
  {
    title: "Dados acadêmicos",
    fields: ["course", "semester", "institution"],
  },
  {
    title: "Documentação",
    fields: ["document_url"],
  },
];

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

export default function StudentDetails() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.student, {});
  const { id } = routeContext;
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");
        const { data } = await repository.students.getById(id);
        setStudent(data || null);
      } catch (e) {
        console.error("Erro ao carregar detalhes do aluno:", e);
        setStudent(null);
        setError("Não foi possível carregar os detalhes do aluno.");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id]);

  const courseName = useMemo(
    () => student?.course?.name || student?.course_name || "-",
    [student],
  );

  const institutionName = useMemo(
    () => student?.institution?.name || student?.institution_name || "-",
    [student],
  );

  const documentUrl = student?.document_url || "";

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold m-0">Detalhes do aluno</h2>
          <small className="text-600">
            Visualização completa dos dados retornados pelo findOne.
          </small>
        </div>

        <div className="flex gap-2">
          <Button
            label="Editar"
            icon="pi pi-pencil"
            onClick={() => navigate("/students/edit")}
            disabled={!id}
          />
          <Button
            label="Voltar"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            onClick={() => navigate("/students")}
          />
        </div>
      </div>

      {error && <Message severity="error" text={error} className="mb-3" />}

      {loading ? (
        <div className="grid">
          <div className="col-12 md:col-6">
            <Skeleton height="11rem" className="mb-3" />
            <Skeleton height="11rem" />
          </div>
          <div className="col-12 md:col-6">
            <Skeleton height="23rem" />
          </div>
        </div>
      ) : (
        <div className="grid">
          <div className="col-12 md:col-6">
            {FIELD_SECTIONS.slice(0, 2).map((section) => (
              <div
                key={section.title}
                className="surface-100 border-round p-3 mb-3"
              >
                <h3 className="text-lg font-semibold mt-0 mb-3">
                  {section.title}
                </h3>

                <div className="grid">
                  {section.fields.map((field) => {
                    let label = field;
                    let value = student?.[field];

                    if (field === "course") {
                      label = "Disciplina";
                      value = courseName;
                    }

                    if (field === "semester") {
                      label = "Semestre";
                    }

                    if (field === "institution") {
                      label = "Instituição";
                      value = institutionName;
                    }

                    if (field === "name") label = "Nome";
                    if (field === "cpf") label = "CPF";
                    if (field === "email") label = "Email";
                    if (field === "phone") label = "Telefone";

                    return (
                      <div key={field} className="col-12 md:col-6 mb-3">
                        <small className="text-600 block mb-1">{label}</small>
                        <strong>{formatValue(value)}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="col-12 md:col-6">
            <div className="surface-100 border-round p-3 mb-3">
              <h3 className="text-lg font-semibold mt-0 mb-3">Documento</h3>

              <div className="mb-3">
                <small className="text-600 block mb-1">URL do documento</small>
                {documentUrl ? (
                  <a href={documentUrl} target="_blank" rel="noreferrer">
                    Abrir documento
                  </a>
                ) : (
                  <strong>-</strong>
                )}
              </div>

              <div>
                <small className="text-600 block mb-1">ID do aluno</small>
                <strong>{formatValue(student?.id)}</strong>
              </div>
            </div>

            <div className="surface-100 border-round p-3">
              <h3 className="text-lg font-semibold mt-0 mb-3">Resumo</h3>
              <p className="m-0 line-height-3 text-700">
                Esta tela usa o resultado de <strong>findOne</strong> para
                exibir os campos principais do aluno em modo somente leitura.
                Use o botão de editar se precisar alterar qualquer dado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}