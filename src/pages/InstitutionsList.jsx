import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import api from '../services/api';

export default function InstitutionsList() {
  const [institutions, setInstitutions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      const { data } = await api.get('/cadastros/institutions');
      setInstitutions(data);
    } catch (e) {
      setInstitutions([]);
    }
  };

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-text" onClick={() => navigate(`/institutions/${rowData.id}`)} />
    </div>
  );

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Instituições</h2>
        <Button label="Nova Instituição" icon="pi pi-plus" onClick={() => navigate('/institutions/new')} />
      </div>
      
      <DataTable value={institutions} tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="cnpj" header="CNPJ" />
        <Column field="address" header="Endereço" />
        <Column field="phone" header="Telefone" />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>
    </div>
  );
}