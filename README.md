# e-NEPS - Documentação de Desenvolvimento Frontend

## Visão Geral

Frontend em **React** com **PrimeReact** para o sistema e-NEPS (Gerenciamento de Estágios).

## Tech Stack

- React 18+
- PrimeReact (componentes UI)
- PrimeIcons
- PrimeFlex (utilitários CSS)
- Axios (requisições HTTP)
- React Router DOM
- JWT Decode

## Instalação

```bash
npx create-react-app eneps-web
cd eneps-web
npm install primeicons primeflex primeprimereact primeflex axios react-router-dom jwt-decode
```

## Configuração

### main.jsx / index.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### App.css
```css
body {
  margin: 0;
  font-family: var(--font-family);
  background-color: #f8f9fa;
}

.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.layout-sidebar {
  width: 250px;
  background: #1e3a8a;
  color: white;
}

.layout-main {
  flex: 1;
  padding: 1rem;
}
```

## Autenticação

### API Service
```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Auth Service
```javascript
// src/services/auth.js
import api from './api';

export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const register = (data) => 
  api.post('/auth/register', data);

export const getCurrentUser = () => 
  api.get('/users/me');

export const updateProfile = (data) => 
  api.put('/users/me', data);

export const resetPassword = (email) => 
  api.post('/auth/reset-password', { email });
```

## Componentes

### Layout Principal
```javascript
// src/components/Layout.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { label: 'Início', icon: 'pi pi-home', command: () => navigate('/') },
    { label: 'Cadastros', icon: 'pi pi-building', items: [
      { label: 'Unidades', icon: 'pi pi-home', command: () => navigate('/units') },
      { label: 'Instituições', icon: 'pi pi-building', command: () => navigate('/institutions') },
      { label: 'Regiões', icon: 'pi pi-map', command: () => navigate('/regions') },
      { label: 'Cursos', icon: 'pi pi-book', command: () => navigate('/courses') },
      { label: 'Locais', icon: 'pi pi-map-marker', command: () => navigate('/locations') },
    ]},
    { label: 'Gestão', icon: 'pi pi-calendar', items: [
      { label: 'Períodos', icon: 'pi pi-calendar', command: () => navigate('/periods') },
      { label: 'Alunos', icon: 'pi pi-users', command: () => navigate('/students') },
      { label: 'Vínculos', icon: 'pi pi-link', command: () => navigate('/internships') },
    ]},
    { label: 'Acompanhamento', icon: 'pi pi-chart-bar', command: () => navigate('/dashboard') },
  ];

  const end = (
    <div className="flex gap-2">
      <Button icon="pi pi-user" text onClick={() => navigate('/profile')} />
      <Button icon="pi pi-sign-out" text onClick={() => {
        localStorage.removeItem('token');
        navigate('/login');
      }} />
    </div>
  );

  return (
    <div className="layout-wrapper">
      <aside className="layout-sidebar p-3">
        <h2 className="text-xl font-bold mb-3">e-NEPS</h2>
        <nav className="flex flex-column gap-2">
          {menuItems.map((item, i) => (
            item.items ? (
              <div key={i} className="dropdown">
                <span className="pi {item.icon} mr-2"></span> {item.label}
                <div className="submenu ml-3 mt-2">
                  {item.items.map((sub, j) => (
                    <Link key={j} to={sub.command} className="block py-2">{sub.label}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={i} to={item.command} className="py-2">
                <span className={`pi ${item.icon} mr-2`}></span> {item.label}
              </Link>
            )
          ))}
        </nav>
      </aside>
      <main className="layout-main flex-1">{children}</main>
    </div>
  );
}
```

### Login
```javascript
// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { login } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await login(email, password);
      localStorage.setItem('token', data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
        <div className="text-center mb-4">
          <h1 className="text-900 font-medium text-3xl">e-NEPS</h1>
          <span className="text-500">Gerenciamento de Estágios</span>
        </div>
        
        {error && <Message severity="error" text={error} className="mb-3" />}
        
        <form onSubmit={handleSubmit}>
          <div className="field mb-3">
            <label htmlFor="email" className="block text-900 font-medium mb-2">Email</label>
            <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" required />
          </div>
          
          <div className="field mb-3">
            <label htmlFor="password" className="block text-900 font-medium mb-2">Senha</label>
            <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" feedback={false} toggleMask />
          </div>
          
          <Button type="submit" label="Entrar" className="w-full" loading={loading} />
        </form>
      </div>
    </div>
  );
}
```

### Cadastro de Unidade de Saúde
```javascript
// src/pages/HealthUnitForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import api from '../services/api';

export default function HealthUnitForm() {
  const [form, setForm] = useState({
    name: '', cnes: '', address: '', phone: '', responsible_name: '', responsible_contact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/cadastros/health-units', form);
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
      <h2 className="text-xl font-bold mb-3">Nova Unidade de Saúde</h2>
      
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
        
        <div className="flex gap-2">
          <Button type="submit" label="Salvar" loading={loading} />
          <Button type="button" label="Cancelar" className="p-button-secondary" onClick={() => navigate('/units')} />
        </div>
      </form>
    </div>
  );
}
```

### Lista de Unidades (DataTable)
```javascript
// src/pages/HealthUnitsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import api from '../services/api';

export default function HealthUnitsList() {
  const [units, setUnits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    const { data } = await api.get('/cadastros/health-units');
    setUnits(data);
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
      
      <DataTable value={units} tableStyle={{ minWidth: '50rem' }}>
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
```

### Períodos de Inscrição
```javascript
// src/pages/EnrollmentPeriods.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    loadPeriods();
    loadCurrentPeriod();
  }, []);

  const loadPeriods = async () => {
    const { data } = await api.get('/gestao/periods');
    setPeriods(data);
  };

  const loadCurrentPeriod = async () => {
    try {
      const { data } = await api.get('/gestao/periods/current');
      setCurrentPeriod(data);
    } catch (e) {}
  };

  const handleSave = async () => {
    await api.post('/gestao/periods', {
      ...form,
      start_date: form.start_date.toISOString(),
      end_date: form.end_date.toISOString()
    });
    setShowDialog(false);
    loadPeriods();
    loadCurrentPeriod();
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
          <strong>Período Ativo:</strong> {currentPeriod.name} ({dateTemplate(currentPeriod)})
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
        <Button label="Salvar" onClick={handleSave} />
      </Dialog>
    </div>
  );
}
```

### Cadastro de Aluno
```javascript
// src/pages/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import api from '../services/api';

export default function StudentForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '', cpf: '', email: '', phone: '', course_id: null, semester: null, institution_id: null
  });
  const [courses, setCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOptions();
    if (id) loadStudent();
  }, []);

  const loadOptions = async () => {
    const [coursesRes, instRes] = await Promise.all([
      api.get('/cadastros/courses'),
      api.get('/cadastros/institutions')
    ]);
    setCourses(coursesRes.data);
    setInstitutions(instRes.data);
  };

  const loadStudent = async () => {
    const { data } = await api.get(`/gestao/students/${id}`);
    setForm(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (id) await api.put(`/gestao/students/${id}`, form);
      else await api.post('/gestao/students', form);
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">{id ? 'Editar' : 'Novo'} Aluno</h2>
      
      {error && <Message severity="error" text={error} className="mb-3" />}
      
      <form onSubmit={handleSubmit}>
        <div className="field mb-3">
          <label>Nome *</label>
          <InputText value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full" required />
        </div>
        
        <div className="field mb-3">
          <label>CPF</label>
          <InputText value={form.cpf} onChange={(e) => setForm({...form, cpf: e.target.value})} className="w-full" />
        </div>
        
        <div className="field mb-3">
          <label>Email *</label>
          <InputText value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full" required />
        </div>
        
        <div className="field mb-3">
          <label>Telefone</label>
          <InputText value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full" />
        </div>
        
        <div className="field mb-3">
          <label>Curso *</label>
          <Dropdown value={form.course_id} options={courses} optionLabel="name" optionValue="id" onChange={(e) => setForm({...form, course_id: e.value})} className="w-full" placeholder="Selecione" required />
        </div>
        
        <div className="field mb-3">
          <label>Semestre</label>
          <InputNumber value={form.semester} onChange={(e) => setForm({...form, semester: e.value})} className="w-full" />
        </div>
        
        <div className="field mb-3">
          <label>Instituição *</label>
          <Dropdown value={form.institution_id} options={institutions} optionLabel="name" optionValue="id" onChange={(e) => setForm({...form, institution_id: e.value})} className="w-full" placeholder="Selecione" required />
        </div>
        
        <Button type="submit" label="Salvar" loading={loading} />
      </form>
    </div>
  );
}
```

### Vinculação de Aluno
```javascript
// src/pages/InternshipForm.jsx
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
    const [studentsRes, locationsRes, periodsRes] = await Promise.all([
      api.get('/gestao/students'),
      api.get('/cadastros/locations'),
      api.get('/gestao/periods')
    ]);
    setStudents(studentsRes.data);
    setLocations(locationsRes.data);
    setPeriods(periodsRes.data);
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
          <label>Turno *</label>
          <Dropdown value={form.shift} options={shiftOptions} onChange={(e) => setForm({...form, shift: e.value})} className="w-full" />
        </div>
        
        <Button type="submit" label="Vincular" loading={loading} />
      </form>
    </div>
  );
}
```

### Agenda Semanal
```javascript
// src/pages/Agenda.jsx
import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import api from '../services/api';

export default function Agenda() {
  const [agenda, setAgenda] = useState([]);

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    const { data } = await api.get('/acompanhamento/locations-agenda');
    setAgenda(data);
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <h2 className="text-xl font-bold mb-3">Agenda Semanal</h2>
      
      {agenda.map((loc) => (
        <div key={loc.location_id} className="mb-4">
          <h3 className="text-lg font-medium">{loc.location_name}</h3>
          <div className="grid">
            <div className="col-4">
              <div className="surface-100 p-3 border-round">
                <strong>Manhã</strong>
                <p>{loc.morning_students.length}/{loc.morning_slots}</p>
              </div>
            </div>
            <div className="col-4">
              <div className="surface-100 p-3 border-round">
                <strong>Tarde</strong>
                <p>{loc.afternoon_students.length}/{loc.afternoon_slots}</p>
              </div>
            </div>
            <div className="col-4">
              <div className="surface-100 p-3 border-round">
                <strong>Noite</strong>
                <p>{loc.evening_students.length}/{loc.evening_slots}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Rotas
```javascript
// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import HealthUnitsList from './pages/HealthUnitsList';
import HealthUnitForm from './pages/HealthUnitForm';
import InstitutionsList from './pages/InstitutionsList';
import EnrollmentPeriods from './pages/EnrollmentPeriods';
import StudentsList from './pages/StudentsList';
import StudentForm from './pages/StudentForm';
import InternshipList from './pages/InternshipList';
import InternshipForm from './pages/InternshipForm';
import Agenda from './pages/Agenda';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<PrivateRoute><Layout><h1>Início</h1></Layout></PrivateRoute>} />
      
      <Route path="/units" element={<PrivateRoute><Layout><HealthUnitsList /></Layout></PrivateRoute>} />
      <Route path="/units/new" element={<PrivateRoute><Layout><HealthUnitForm /></Layout></PrivateRoute>} />
      <Route path="/units/:id" element={<PrivateRoute><Layout><HealthUnitForm /></Layout></PrivateRoute>} />
      
      <Route path="/institutions" element={<PrivateRoute><Layout><InstitutionsList /></Layout></PrivateRoute>} />
      <Route path="/institutions/new" element={<PrivateRoute><Layout><InstitutionForm /></Layout></PrivateRoute>} />
      
      <Route path="/regions" element={<PrivateRoute><Layout><RegionsList /></Layout></PrivateRoute>} />
      <Route path="/courses" element={<PrivateRoute><Layout><CoursesList /></Layout></PrivateRoute>} />
      <Route path="/locations" element={<PrivateRoute><Layout><LocationsList /></Layout></PrivateRoute>} />
      
      <Route path="/periods" element={<PrivateRoute><Layout><EnrollmentPeriods /></Layout></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><Layout><StudentsList /></Layout></PrivateRoute>} />
      <Route path="/students/new" element={<PrivateRoute><Layout><StudentForm /></Layout></PrivateRoute>} />
      <Route path="/students/:id" element={<PrivateRoute><Layout><StudentForm /></Layout></PrivateRoute>} />
      
      <Route path="/internships" element={<PrivateRoute><Layout><InternshipList /></Layout></PrivateRoute>} />
      <Route path="/internships/new" element={<PrivateRoute><Layout><InternshipForm /></Layout></PrivateRoute>} />
      
      <Route path="/dashboard" element={<PrivateRoute><Layout><Agenda /></Layout></PrivateRoute>} />
    </Routes>
  );
}
```

## Endpoints da API

| Módulo | Método | Endpoint | Descrição |
|--------|--------|---------|-----------|
| Auth | POST | `/auth/login` | Autenticar |
| Auth | POST | `/auth/register` | Criar usuário |
| Auth | POST | `/auth/first-access` | Primeiro acesso |
| Auth | POST | `/auth/reset-password` | Recuperar senha |
| Users | GET | `/users/me` | Dados do usuário |
| Users | PUT | `/users/me` | Atualizar perfil |
| Cadastros | GET/POST | `/cadastros/health-units` | Unidades |
| Cadastros | GET/POST | `/cadastros/institutions` | Instituições |
| Cadastros | GET/POST | `/cadastros/regions` | Regiões |
| Cadastros | GET/POST | `/cadastros/courses` | Cursos |
| Cadastros | GET/POST | `/cadastros/locations` | Locais estágio |
| Gestão | GET/POST | `/gestao/periods` | Períodos |
| Gestão | GET/POST | `/gestao/students` | Alunos |
| Gestão | GET/POST | `/gestao/internships` | Vínculos |
| Acompanhamento | GET | `/acompanhamento/locations-agenda` | Agenda |
| Acompanhamento | GET | `/acompanhamento/regions-map` | Mapa |

## Estrutura de Arquivos

```
src/
├── components/
│   └── Layout.jsx
├── pages/
│   ├── Login.jsx
│   ├── HealthUnitsList.jsx
│   ├── HealthUnitForm.jsx
│   ├── InstitutionsList.jsx
│   ├── RegionsList.jsx
│   ├── CoursesList.jsx
│   ├── LocationsList.jsx
│   ��─�� EnrollmentPeriods.jsx
│   ├── StudentsList.jsx
│   ├── StudentForm.jsx
│   ├── InternshipList.jsx
│   ├── InternshipForm.jsx
│   └── Agenda.jsx
├── services/
│   ├── api.js
│   └── auth.js
├── App.jsx
├── main.jsx
└── App.css
```

## Temas PrimeReact

| Tema | Código |
|------|--------|
| Blue Light | `lara-light-blue` |
| Blue Dark | `lara-dark-blue` |
| Purple Light | `lara-light-purple` |
| Purple Dark | `lara-dark-purple` |
| Teal | `lara-light-teal` |

## Executar

```bash
npm start
```

Acesse: http://localhost:3000