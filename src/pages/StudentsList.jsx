import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import api from '../services/api';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
    loadOptions();
  }, []);

  const loadStudents = async () => {
    try {
      const { data } = await api.get('/gestao/students');
      setStudents(data);
    } catch (e) {
      setStudents([]);
    }
  };

  const loadOptions = async () => {
    try {
      const [coursesRes, instRes] = await Promise.all([
        api.get('/cadastros/courses'),
        api.get('/cadastros/institutions')
      ]);
      setCourses(coursesRes.data);
      setInstitutions(instRes.data);
    } catch (e) {}
  };

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-text" onClick={() => navigate(`/students/${rowData.id}`)} />
    </div>
  );

  const courseTemplate = (rowData) => {
    const course = courses.find(c => c.id === rowData.course_id);
    return course ? course.name : '-';
  };

  const institutionTemplate = (rowData) => {
    const inst = institutions.find(i => i.id === rowData.institution_id);
    return inst ? inst.name : '-';
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Alunos</h2>
        <Button label="Novo Aluno" icon="pi pi-plus" onClick={() => navigate('/students/new')} />
      </div>
      
      <DataTable value={students} tableStyle={{ minWidth: '50rem' }}>
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="cpf" header="CPF" />
        <Column field="email" header="Email" />
        <Column header="Curso" body={courseTemplate} />
        <Column field="semester" header="Semestre" />
        <Column header="Instituição" body={institutionTemplate} />
        <Column body={actionsTemplate} header="Ações" />
      </DataTable>
    </div>
  );
}