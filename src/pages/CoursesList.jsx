import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import api from '../services/api';

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', region_id: null });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadCourses();
    loadRegions();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await api.get('/cadastros/courses');
      setCourses(data);
    } catch (e) {
      setCourses([]);
    }
  };

  const loadRegions = async () => {
    try {
      const { data } = await api.get('/cadastros/regions');
      setRegions(data);
    } catch (e) {
      setRegions([]);
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/cadastros/courses/${editId}`, form);
      } else {
        await api.post('/cadastros/courses', form);
      }
      setShowDialog(false);
      setForm({ name: '', code: '', region_id: null });
      setEditId(null);
      loadCourses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao salvar');
    }
  };

  const handleEdit = (rowData) => {
    setForm({ name: rowData.name, code: rowData.code, region_id: rowData.region_id });
    setEditId(rowData.id);
    setShowDialog(true);
  };

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-text" onClick={() => handleEdit(rowData)} />
    </div>
  );

  const regionTemplate = (rowData) => {
    const region = regions.find(r => r.id === rowData.region_id);
    return region ? region.name : '-';
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Cursos</h2>
        <Button label="Novo Curso" icon="pi pi-plus" onClick={() => { setEditId(null); setForm({ name: '', code: '', region_id: null }); setShowDialog(true); }} />
      </div>
      
      <DataTable value={courses} tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="code" header="Código" />
        <Column header="Região" body={regionTemplate} />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>

      <Dialog visible={showDialog} onHide={() => setShowDialog(false)} header={editId ? 'Editar Curso' : 'Novo Curso'}>
        <div className="field mb-3">
          <label>Nome</label>
          <InputText value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full" />
        </div>
        <div className="field mb-3">
          <label>Código</label>
          <InputText value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} className="w-full" />
        </div>
        <div className="field mb-3">
          <label>Região</label>
          <Dropdown value={form.region_id} options={regions} optionLabel="name" optionValue="id" onChange={(e) => setForm({...form, region_id: e.value})} className="w-full" placeholder="Selecione" />
        </div>
        <Button label="Salvar" onClick={handleSave} />
      </Dialog>
    </div>
  );
}