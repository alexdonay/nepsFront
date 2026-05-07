import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import api from '../services/api';

export default function HealthUnitForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '', cnes: '', address: '', phone: '', responsible_name: '', responsible_contact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadUnit();
  }, [id]);

  const loadUnit = async () => {
    try {
      const { data } = await api.get(`/cadastros/health-units/${id}`);
      setForm(data);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (id) await api.put(`/cadastros/health-units/${id}`, form);
      else await api.post('/cadastros/health-units', form);
      navigate('/units');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">{id ? 'Editar' : 'Nova'} Unidade de Saúde</h2>
      
      {error && <Message severity="error" text={error} className="mb-3" />}
      
      <form onSubmit={handleSubmit}>
        <div className="field mb-3">
          <label>Nome *</label>
          <InputText value={form.name} onChange={updateField('name')} className="w-full" required />
        </div>
        
        <div className="field mb-3">
          <label>CNES</label>
          <InputText value={form.cnes} onChange={updateField('cnes')} className="w-full" />
        </div>
        
        <div className="field mb-3">
          <label>Endereço</label>
          <InputText value={form.address} onChange={updateField('address')} className="w-full" />
        </div>
        
        <div className="field mb-3">
          <label>Telefone</label>
          <InputText value={form.phone} onChange={updateField('phone')} className="w-full" />
        </div>
        
        <div className="field mb-3">
          <label>Responsável</label>
          <InputText value={form.responsible_name} onChange={updateField('responsible_name')} className="w-full" />
        </div>

        <div className="field mb-3">
          <label>Contato Responsável</label>
          <InputText value={form.responsible_contact} onChange={updateField('responsible_contact')} className="w-full" />
        </div>
        
        <div className="flex gap-2">
          <Button type="submit" label="Salvar" loading={loading} />
          <Button type="button" label="Cancelar" className="p-button-secondary" onClick={() => navigate('/units')} />
        </div>
      </form>
    </div>
  );
}