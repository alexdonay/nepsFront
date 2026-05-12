import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import api from '../services/api';

export default function InternshipForm() {
  const [form, setForm] = useState({ student_id: null, location_id: null, period_id: null, shift: 'morning' });
  const [students, setStudents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [studentsRes, locationsRes, periodsRes] = await Promise.all([
        api.get('/gestao/students'),
        api.get('/cadastros/locations'),
        api.get('/gestao/periods')
      ]);
      setStudents(studentsRes.data);
      setLocations(locationsRes.data);
      setPeriods(periodsRes.data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/gestao/internships', form);
      navigate('/internships');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao vincular');
    } finally {
      setLoading(false);
    }
  };

  const shiftOptions = [
    { label: 'Manhã', value: 'morning' },
    { label: 'Tarde', value: 'afternoon' },
    { label: 'Noite', value: 'evening' }
  ];

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">Vincular Aluno</h2>
      
      {error && <Message severity="error" text={error} className="mb-3" />}
      
      <form onSubmit={handleSubmit}>
        <div className="field mb-3">
          <label>Aluno *</label>
          <Dropdown value={form.student_id} options={students} optionLabel="name" optionValue="id" onChange={(e) => setForm({...form, student_id: e.value})} className="w-full" placeholder="Selecione" filter />
        </div>
        
        <div className="field mb-3">
          <label>Local *</label>
          <Dropdown value={form.location_id} options={locations} optionLabel="name" optionValue="id" onChange={(e) => setForm({...form, location_id: e.value})} className="w-full" placeholder="Selecione" filter />
        </div>

        <div className="field mb-3">
          <label>Período *</label>
          <Dropdown value={form.period_id} options={periods} optionLabel="name" optionValue="id" onChange={(e) => setForm({...form, period_id: e.value})} className="w-full" placeholder="Selecione" />
        </div>
        
        <div className="field mb-3">
          <label>Turno *</label>
          <Dropdown value={form.shift} options={shiftOptions} onChange={(e) => setForm({...form, shift: e.value})} className="w-full" />
        </div>
        
        <div className="flex gap-2">
          <Button type="submit" label="Vincular" loading={loading} />
          <Button type="button" label="Cancelar" className="p-button-secondary" onClick={() => navigate('/internships')} />
        </div>
      </form>
    </div>
  );
}