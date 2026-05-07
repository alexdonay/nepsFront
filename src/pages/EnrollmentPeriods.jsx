import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import api from '../services/api';

export default function EnrollmentPeriods() {
  const [periods, setPeriods] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: '', start_date: null, end_date: null, description: '' });

  useEffect(() => {
    loadPeriods();
    loadCurrentPeriod();
  }, []);

  const loadPeriods = async () => {
    try {
      const { data } = await api.get('/gestao/periods');
      setPeriods(data);
    } catch (e) {
      setPeriods([]);
    }
  };

  const loadCurrentPeriod = async () => {
    try {
      const { data } = await api.get('/gestao/periods/current');
      setCurrentPeriod(data);
    } catch (e) {}
  };

  const handleSave = async () => {
    try {
      await api.post('/gestao/periods', {
        ...form,
        start_date: form.start_date.toISOString(),
        end_date: form.end_date.toISOString()
      });
      setShowDialog(false);
      setForm({ name: '', start_date: null, end_date: null, description: '' });
      loadPeriods();
      loadCurrentPeriod();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao salvar');
    }
  };

  const dateTemplate = (rowData) => new Date(rowData.start_date).toLocaleDateString();

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Períodos de Inscrição</h2>
        <Button label="Abrir Período" icon="pi pi-plus" onClick={() => setShowDialog(true)} />
      </div>

      {currentPeriod && (
        <div className="surface-100 p-3 border-round mb-3">
          <strong>Período Ativo:</strong> {currentPeriod.name} ({dateTemplate(currentPeriod)} - {new Date(currentPeriod.end_date).toLocaleDateString()})
        </div>
      )}

      <DataTable value={periods}>
        <Column field="name" header="Nome" />
        <Column field="start_date" header="Início" body={(row) => new Date(row.start_date).toLocaleDateString()} />
        <Column field="end_date" header="Fim" body={(row) => new Date(row.end_date).toLocaleDateString()} />
        <Column field="is_active" header="Status" body={(row) => row.is_active ? 'Ativo' : 'Encerrado'} />
      </DataTable>

      <Dialog visible={showDialog} onHide={() => setShowDialog(false)} header="Novo Período">
        <div className="field mb-3">
          <label>Nome</label>
          <InputText value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full" />
        </div>
        <div className="field mb-3">
          <label>Início</label>
          <Calendar value={form.start_date} onChange={(e) => setForm({...form, start_date: e.value})} className="w-full" />
        </div>
        <div className="field mb-3">
          <label>Fim</label>
          <Calendar value={form.end_date} onChange={(e) => setForm({...form, end_date: e.value})} className="w-full" />
        </div>
        <div className="field mb-3">
          <label>Descrição</label>
          <InputText value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full" />
        </div>
        <Button label="Salvar" onClick={handleSave} />
      </Dialog>
    </div>
  );
}