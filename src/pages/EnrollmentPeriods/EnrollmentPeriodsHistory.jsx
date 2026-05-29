import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { repository } from "../../services/repository";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function EnrollmentPeriodsHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [periodName, setPeriodName] = useState("");
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const page = Math.floor(first / rows) + 1;
      const { data } = await repository.histories.getByPeriod(id, {
        page,
        per_page: rows,
      });

      const items = data?.items || [];
      setHistory(items);
      setTotalRecords(data?.pagination?.total ?? items.length);

      if (items.length > 0) {
        setPeriodName(items[0]?.period?.name || "");
      }
    } catch (err) {
      setHistory([]);
      setTotalRecords(0);
      setError("Não foi possível carregar o histórico deste período.");
    } finally {
      setLoading(false);
    }
  }, [id, first, rows]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handlePage = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const statusTemplate = (row) =>
    row.end_date ? "Encerrado" : "Vínculo ativo";

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between align-items-center mb-3 gap-3">
        <div>
          <h2 className="text-xl font-bold m-0">Histórico do Período</h2>
          <p className="text-600 m-0 mt-2">
            {periodName ? `Período: ${periodName}` : `Período ID: ${id}`}
          </p>
        </div>
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          severity="secondary"
          onClick={() => navigate("/periods")}
        />
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 border-round">
          {error}
        </div>
      )}

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
        emptyMessage="Nenhum registro de histórico encontrado"
      >
        <Column
          field="student.name"
          header="Aluno"
          body={(row) => row?.student?.name || "-"}
        />
        <Column
          field="student.cpf"
          header="CPF"
          body={(row) => row?.student?.cpf || "-"}
        />
        <Column
          field="period.name"
          header="Período"
          body={(row) => row?.period?.name || periodName || "-"}
        />
        <Column
          field="start_date"
          header="Início"
          body={(row) => formatDate(row?.start_date)}
        />
        <Column
          field="end_date"
          header="Fim"
          body={(row) => formatDate(row?.end_date)}
        />
        <Column header="Status" body={statusTemplate} />
      </DataTable>
    </div>
  );
}