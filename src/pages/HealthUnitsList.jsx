import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import api from '../services/api';

export default function HealthUnitsList() {
  const [units, setUnits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const { data } = await repository.healthUnits.get();
      setUnits(data.items || data);
    } catch (e) {
      setUnits([]);
    }
  };

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-text" onClick={() => navigate(`/units/${rowData.id}`)} />
    </div>
  );

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Unidades de Saúde</h2>
        <Button label="Nova Unidade" icon="pi pi-plus" onClick={() => navigate('/units/new')} />
      </div>

      <DataTable
        value={units}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="cnes" header="CNES" />
        <Column field="address" header="Endereço" />
        <Column field="phone" header="Telefone" />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>
    </div>
  );
}