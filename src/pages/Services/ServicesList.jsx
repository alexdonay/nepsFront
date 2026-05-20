import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";

export default function ServicesList() {
  const [services, setServices] = useState([]);
  const [regions, setRegions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [servicesRes, regionsRes] = await Promise.all([
        repository.services.get(),
        repository.regions.get(),
      ]);
      setServices(servicesRes.data.items || servicesRes.data);

      const regionsMap = {};
      (regionsRes.data.items || regionsRes.data).forEach((r) => {
        regionsMap[r.id] = r.name;
      });
      setRegions(regionsMap);
    } catch (e) {
      setServices([]);
    }
  };

  const nameTemplate = (rowData) => rowData.name || "-";
  const regionTemplate = (rowData) => regions[rowData.region_id] || "-";
  const activeTemplate = (rowData) => (
    <span
      className={`badge ${rowData.is_active ? "badge-success" : "badge-danger"}`}
    >
      {rowData.is_active ? "Ativo" : "Inativo"}
    </span>
  );

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        onClick={() => navigate(`/services/${rowData.id}`)}
      />
    </div>
  );

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Serviços</h2>
        <Button
          label="Novo Serviço"
          icon="pi pi-plus"
          onClick={() => navigate("/services/new")}
        />
      </div>
      <DataTable
        value={services}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable body={nameTemplate} />
        <Column header="Região" sortable body={regionTemplate} />
        <Column field="is_active" header="Status" body={activeTemplate} />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>
    </div>
  );
}
