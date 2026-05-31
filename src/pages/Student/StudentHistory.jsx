import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, getRouteContext } from "../../utils/routeContext";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function StudentHistory() {
  const routeContext = getRouteContext(ROUTE_CONTEXT_KEYS.student, {});
  const { id } = routeContext;
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadHistory = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const page = Math.floor(first / rows) + 1;
      const [studentResponse, historyResponse] = await Promise.all([
        repository.students.getById(id),
        repository.histories.getByStudent(id, {
          page,
          per_page: rows,
        }),
      ]);

      setStudent(studentResponse.data || null);

      const data = historyResponse.data || {};
      const items = data.items || [];
      setHistory(items);
      setTotalRecords(data.pagination?.total ?? items.length);
    } catch (e) {
      console.error("Erro ao carregar histórico do aluno:", e);
      setStudent(null);
      setHistory([]);
      setTotalRecords(0);
      setError("Não foi possível carregar o histórico do aluno.");
    } finally {
      setLoading(false);
    }
  }, [first, id, rows]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const studentName = useMemo(() => student?.name || `Aluno ID: ${id}`, [id, student]);
  const studentCourse = useMemo(
    () => student?.course?.name || student?.course_name || "-",
    [student],
  );
  const studentInstitution = useMemo(
    () => student?.institution?.name || student?.institution_name || "-",
    [student],
  );

  const handlePage = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const roomTemplate = (row) => row?.room_name || row?.room?.name || row?.room_id || "-";
  const dayTemplate = (row) => row?.day_of_week || row?.dayOfWeek || "-";
  const periodTemplate = (row) => row?.period?.name || row?.period_name || row?.period || "-";
  const statusTemplate = (row) => row?.end_date ? "Encerrado" : "Vínculo ativo";

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold m-0">Histórico do aluno</h2>
          <small className="text-600">Vínculos encontrados em períodos cadastrados.</small>
        </div>

        <div className="flex gap-2">
          <Button
            label="Detalhes"
            icon="pi pi-eye"
            onClick={() => navigate("/students/details")}
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
          <div className="col-12 md:col-4">
            <Skeleton height="9rem" />
          </div>
          <div className="col-12 md:col-8">
            <Skeleton height="20rem" />
          </div>
        </div>
      ) : (
        <>
          <div className="surface-100 border-round p-3 mb-4">
            <div className="grid">
              <div className="col-12 md:col-4">
                <small className="text-600 block mb-1">Nome</small>
                <strong>{studentName}</strong>
              </div>
              <div className="col-12 md:col-4">
                <small className="text-600 block mb-1">Disciplina</small>
                <strong>{studentCourse}</strong>
              </div>
              <div className="col-12 md:col-4">
                <small className="text-600 block mb-1">Instituição</small>
                <strong>{studentInstitution}</strong>
              </div>
            </div>
          </div>

          <DataTable
            value={history}
            paginator
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[10, 20, 50]}
            onPage={handlePage}
            loading={loading}
            lazy
            emptyMessage="Nenhum registro de histórico encontrado para este aluno"
          >
            <Column field="room_id" header="Sala" body={roomTemplate} />
            <Column field="day_of_week" header="Dia" body={dayTemplate} />
            <Column field="period" header="Período" body={periodTemplate} />
            <Column field="start_date" header="Início" body={(row) => formatDate(row?.start_date)} />
            <Column field="end_date" header="Fim" body={(row) => formatDate(row?.end_date)} />
            <Column header="Status" body={statusTemplate} />
            <Column
              header="Ações"
              body={(row) => (
                <Button
                  label="Abrir período"
                  icon="pi pi-external-link"
                  className="p-button-text"
                  onClick={() =>
                    navigate(
                      `/periods/${row.period_id || row.period?.id || row.id}/manage`,
                    )
                  }
                />
              )}
            />
          </DataTable>
        </>
      )}
    </div>
  );
}