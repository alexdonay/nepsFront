import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";

export default function Home() {
  const [stats, setStats] = useState({
    students: 0,
    units: 0,
    periods: 0,
  });
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, unitsRes, periodsRes] =
        await Promise.all([
          repository.students.get(),
          repository.healthUnits.get(),
          repository.periods.get(),
        ]);
      const periods = periodsRes.data.items || periodsRes.data;
      setStats({
        students: studentsRes.data.length,
        units: unitsRes.data.length,
        periods: periods.length,
      });
      const today = new Date();
      const current = periods.find(p => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        return start <= today && end >= today;
      });
      setCurrentPeriod(current || null);
    } catch (e) {}
  };

  const quickAccess = [
    {
      label: "Alunos",
      icon: "pi pi-users",
      color: "#3b82f6",
      path: "/students",
    },
    { label: "Unidades", icon: "pi pi-home", color: "#10b981", path: "/units" },
    {
      label: "Períodos",
      icon: "pi pi-calendar",
      color: "#f59e0b",
      path: "/periods",
    },
    {
      label: "Instituições",
      icon: "pi pi-building",
      color: "#ec4899",
      path: "/institutions",
    },
    {
      label: "Salas",
      icon: "pi pi-map-marker",
      color: "#06b6d4",
      path: "/rooms",
    },
  ];

  const chartData = {
    labels: ["Alunos", "Unidades", "Períodos"],
    datasets: [
      {
        data: [stats.students, stats.units, stats.periods],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-900">Bem-vindo ao e-NEPS</h1>
        <p className="text-500">Sistema de Gerenciamento de Estágios</p>
      </div>

      {currentPeriod && (
        <div className="surface-100 p-3 border-round mb-4 flex align-items-center justify-content-between">
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

      <div className="grid mb-4">
        {quickAccess.map((item, i) => (
          <div className="col-12 md:col-6 lg:col-4" key={i}>
            <Card
              className="cursor-pointer hover:shadow-4 transition-duration-200"
              onClick={() => navigate(item.path)}
            >
              <div className="flex align-items-center gap-3">
                <div
                  className="border-circle flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: item.color + "20",
                    color: item.color,
                  }}
                >
                  <i className={`pi ${item.icon} text-xl`}></i>
                </div>
                <div>
                  <div className="text-500 text-sm">{item.label}</div>
                  <div className="text-900 font-medium">
                    {item.label === "Alunos" && stats.students}
                    {item.label === "Unidades" && stats.units}
                    {item.label === "Períodos" && stats.periods}
                    {item.label === "Instituições" && "-"}
                    {item.label === "Salas" && "-"}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid">
        <div className="col-12 md:col-6">
          <Card>
            <h3 className="text-lg font-medium mb-3">Visão Geral</h3>
            <Chart type="doughnut" data={chartData} options={chartOptions} />
          </Card>
        </div>
        <div className="col-12 md:col-6">
          <Card>
            <h3 className="text-lg font-medium mb-3">Ações Rápidas</h3>
            <div className="flex flex-column gap-2">
              <Button
                label="Novo Aluno"
                icon="pi pi-user-plus"
                className="p-button-outlined"
                onClick={() => navigate("/students/new")}
              />
              <Button
                label="Abrir Período"
                icon="pi pi-calendar-plus"
                className="p-button-outlined"
                onClick={() => navigate("/periods")}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}