import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";

const CHART_COLORS = [
  "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899",
  "#8b5cf6", "#14b8a6", "#f97316", "#3b82f6", "#84cc16",
];

const PIE_OPTIONS = (tooltipLabel) => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.6,
  plugins: {
    legend: {
      position: "bottom",
      labels: { padding: 16, font: { size: 12 }, usePointStyle: true },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.parsed} ${tooltipLabel}`,
      },
    },
  },
});

const BAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 3,
  plugins: {
    legend: {
      position: "bottom",
      labels: { padding: 16, font: { size: 12 }, usePointStyle: true },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} alunos`,
      },
    },
  },
  scales: {
    x: {
      stacked: false,
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1, font: { size: 12 } },
      grid: { color: "#f1f5f9" },
    },
  },
};

const buildChartData = (items) => {
  const labels = items.map((r) => r.region_name || r.name);
  const values = items.map((r) => r.vacancies ?? r.total_vacancies ?? r.capacity ?? 0);
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        hoverBackgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + "cc"),
      },
    ],
  };
};

export default function Home() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_internships: 0,
    total_periods: 0,
    total_institutions: 0,
    total_rooms: 0,
  });
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [vacanciesChartData, setVacanciesChartData] = useState(null);
  const [occupiedChartData, setOccupiedChartData] = useState(null);
  const [institutionChartData, setInstitutionChartData] = useState(null);
  const [regionInstitutionChartData, setRegionInstitutionChartData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const buildVacanciesFromSources = async () => {
    const [regionsRes, internshipsRes, roomsRes] = await Promise.all([
      repository.regions.get(),
      repository.internships.get({ per_page: 500 }),
      repository.rooms.get({ per_page: 500 }),
    ]);

    const regions = regionsRes.data?.items || regionsRes.data || [];
    const internships = internshipsRes.data?.items || internshipsRes.data || [];
    const rooms = roomsRes.data?.items || roomsRes.data || [];

    const internshipRegionMap = {};
    for (const i of internships) {
      internshipRegionMap[i.id] = i.region_id;
    }

    const regionCapacity = {};
    for (const room of rooms) {
      const internshipId = room.internships_id ?? room.internship_id;
      const regionId = internshipRegionMap[internshipId];
      if (!regionId) continue;
      regionCapacity[regionId] = (regionCapacity[regionId] || 0) + (room.room_capacity ?? room.capacity ?? 0);
    }

    return regions
      .filter((r) => (regionCapacity[r.id] || 0) > 0)
      .map((r) => ({ region_name: r.name, vacancies: regionCapacity[r.id] }));
  };

  const loadData = async () => {
    try {
      const { data } = await repository.dashboard.get();
      let totalRooms = data.total_rooms || 0;

      if (!totalRooms) {
        try {
          const roomsRes = await repository.rooms.get({ per_page: 1 });
          totalRooms = roomsRes.data?.pagination?.total ?? roomsRes.data?.length ?? 0;
        } catch (_) {}
      }

      setStats({
        total_students: data.total_students || 0,
        total_internships: data.total_internships || 0,
        total_periods: data.total_periods || 0,
        total_institutions: data.total_institutions || 0,
        total_rooms: totalRooms,
      });

      const periodsRes = await repository.periods.get();
      const periods = periodsRes.data?.items || periodsRes.data || [];
      const today = new Date();
      const current = periods.find((p) => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        return start <= today && end >= today;
      });
      setCurrentPeriod(current || null);
    } catch (_) {}

    // Gráfico: vagas por região
    try {
      let items = [];
      try {
        const { data } = await repository.dashboard.vacanciesByRegion();
        items = data?.items || data || [];
      } catch (_) {
        items = await buildVacanciesFromSources();
      }
      if (items.length > 0) setVacanciesChartData(buildChartData(items));
    } catch (_) {}

    // Gráfico: alunos alocados por região
    try {
      const { data } = await repository.dashboard.occupiedByRegion();
      const items = data?.items || data || [];
      if (items.length > 0) setOccupiedChartData(buildChartData(items));
    } catch (_) {}

    // Gráfico: alunos vinculados por instituição (pizza)
    try {
      const { data } = await repository.dashboard.studentsByInstitution();
      const items = (data?.items || data || []).map((i) => ({
        region_name: i.institution_name || i.name,
        vacancies: i.student_count ?? i.total ?? i.count ?? 0,
      }));
      if (items.length > 0) setInstitutionChartData(buildChartData(items));
    } catch (_) {}

    // Gráfico: alunos por região agrupado por instituição (barras)
    try {
      const { data } = await repository.dashboard.studentsByRegionInstitution();
      const items = data?.items || data || [];
      if (items.length === 0) return;

      // items: [{ region_name, institutions: [{ institution_name, student_count }] }]
      const regions = items.map((r) => r.region_name || r.name);
      const institutionNames = [
        ...new Set(
          items.flatMap((r) =>
            (r.institutions || []).map((i) => i.institution_name || i.name)
          )
        ),
      ];

      const datasets = institutionNames.map((instName, idx) => ({
        label: instName,
        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
        data: items.map((region) => {
          const inst = (region.institutions || []).find(
            (i) => (i.institution_name || i.name) === instName
          );
          return inst ? (inst.student_count ?? inst.total ?? inst.count ?? 0) : 0;
        }),
      }));

      setRegionInstitutionChartData({ labels: regions, datasets });
    } catch (_) {}
  };

  const quickAccess = [
    { label: "Alunos", icon: "pi pi-users", color: "#3b82f6", path: "/students", key: "total_students" },
    { label: "Campos de Estágio", icon: "pi pi-home", color: "#10b981", path: "/internships", key: "total_internships" },
    { label: "Períodos", icon: "pi pi-calendar", color: "#f59e0b", path: "/periods", key: "total_periods" },
    { label: "Instituições", icon: "pi pi-building", color: "#ec4899", path: "/institutions", key: "total_institutions" },
    { label: "Salas", icon: "pi pi-map-marker", color: "#06b6d4", path: "/rooms", key: "total_rooms" },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-900">Bem-vindo ao e-NEPS</h1>
        <p className="text-500">Sistema de Gerenciamento de Estágios</p>
      </div>

      {currentPeriod && (
        <div className="surface-100 p-3 border-round mb-2 flex align-items-center justify-content-between">
          <div>
            <strong className="text-primary">Período Ativo:</strong>{" "}
            {currentPeriod.name}
          </div>
          <div className="text-500 text-sm">
            {new Date(currentPeriod.start_date).toLocaleDateString("pt-BR")} -{" "}
            {new Date(currentPeriod.end_date).toLocaleDateString("pt-BR")}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          label="Abrir Período"
          icon="pi pi-calendar"
          className="p-button-outlined"
          onClick={() => navigate("/periods")}
        />
        <Button
          label="Gerenciar Período"
          icon="pi pi-cog"
          className="p-button-outlined"
          onClick={() => navigate("/periods/manage")}
        />
      </div>

      <div className="grid mb-4">
        {quickAccess.map((item, i) => (
          <div className="col" key={i}>
            <Card
              className="cursor-pointer hover:shadow-4 transition-duration-200"
              onClick={() => navigate(item.path)}
            >
              <div className="flex align-items-center gap-3">
                <div
                  className="border-circle flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px", backgroundColor: item.color + "20", color: item.color }}
                >
                  <i className={`pi ${item.icon} text-xl`}></i>
                </div>
                <div>
                  <div className="text-500 text-sm">{item.label}</div>
                  <div className="text-900 font-medium">{stats[item.key]}</div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid">
        <div className="col-12 md:col-4">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-700 mb-3">Vagas por Região</h3>
            {vacanciesChartData ? (
              <Chart type="pie" data={vacanciesChartData} options={PIE_OPTIONS("vagas")} />
            ) : (
              <div className="text-500 text-sm p-3 text-center">Nenhuma vaga cadastrada.</div>
            )}
          </Card>
        </div>

        <div className="col-12 md:col-4">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-700 mb-3">Alunos Alocados por Região</h3>
            {occupiedChartData ? (
              <Chart type="pie" data={occupiedChartData} options={PIE_OPTIONS("alunos")} />
            ) : (
              <div className="text-500 text-sm p-3 text-center">Nenhum aluno alocado.</div>
            )}
          </Card>
        </div>

        <div className="col-12 md:col-4">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-700 mb-3">Alunos Vinculados por Instituição</h3>
            {institutionChartData ? (
              <Chart type="pie" data={institutionChartData} options={PIE_OPTIONS("alunos")} />
            ) : (
              <div className="text-500 text-sm p-3 text-center">Nenhum aluno vinculado.</div>
            )}
          </Card>
        </div>

        <div className="col-12 mt-2">
          <Card>
            <h3 className="text-base font-semibold text-700 mb-3">Alunos por Região — por Instituição</h3>
            {regionInstitutionChartData ? (
              <Chart type="bar" data={regionInstitutionChartData} options={BAR_OPTIONS} />
            ) : (
              <div className="text-500 text-sm p-3 text-center">Nenhum dado disponível.</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
