import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import api from '../services/api';

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadInternships();
    loadOptions();
  }, []);

  const loadInternships = async () => {
    try {
      const { data } = await api.get('/gestao/internships');
      setInternships(data);
    } catch (e) {
      setInternships([]);
    }
  };

  const loadOptions = async () => {
    try {
      const [studentsRes, locationsRes] = await Promise.all([
        api.get('/gestao/students'),
        api.get('/cadastros/locations')
      ]);
      setStudents(studentsRes.data);
      setLocations(locationsRes.data);
    } catch (e) {}
  };

  const studentTemplate = (rowData) => {
    const student = students.find(s => s.id === rowData.student_id);
    return student ? student.name : '-';
  };

  const locationTemplate = (rowData) => {
    const location = locations.find(l => l.id === rowData.location_id);
    return location ? location.name : '-';
  };

  const shiftTemplate = (rowData) => {
    const shifts = { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' };
    return shifts[rowData.shift] || rowData.shift;
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Vínculos de Estágio</h2>
        <Button label="Novo Vínculo" icon="pi pi-plus" onClick={() => navigate('/internships/new')} />
      </div>
      
      <DataTable value={internships} tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="ID" sortable />
        <Column header="Aluno" body={studentTemplate} />
        <Column header="Local" body={locationTemplate} />
        <Column header="Turno" body={shiftTemplate} />
        <Column field="status" header="Status" />
      </DataTable>
    </div>
  );
}