import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";
import { ROUTE_CONTEXT_KEYS, clearRouteContext } from "../../utils/routeContext";

export default function Home() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_internships: 0,
    total_periods: 0,
    total_institutions: 0,
    total_rooms: 0,
  });
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await repository.dashboard.get();
      let totalRooms = data.total_rooms || 0;

      if (!totalRooms) {
        try {
          const roomsRes = await repository.rooms.get({ per_page: 1 });
          const roomsData = roomsRes.data?.pagination?.total ?? roomsRes.data?.length ?? 0;
          totalRooms = roomsData;
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
      const periods = periodsRes.data.items || periodsRes.data || [];
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
      key: "total_students",
    },
    {
      label: "Campos de Estágio",
      icon: "pi pi-home",
      color: "#10b981",
      path: "/internships",
      key: "total_internships",
    },
    {
      label: "Períodos",
      icon: "pi pi-calendar",
      color: "#f59e0b",
      path: "/periods",
      key: "total_periods",
    },
    {
      label: "Instituições",
      icon: "pi pi-building",
      color: "#ec4899",
      path: "/institutions",
      key: "total_institutions",
    },
    {
      label: "Salas",
      icon: "pi pi-map-marker",
      color: "#06b6d4",
      path: "/rooms",
      key: "total_rooms",
    },
  ];

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
                    {stats[item.key]}
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
            <h3 className="text-lg font-medium mb-3">Ações Rápidas</h3>
            <div className="flex flex-column gap-2">
              <Button
                label="Novo Aluno"
                icon="pi pi-user-plus"
                className="p-button-outlined"
                onClick={() => {
                  clearRouteContext(ROUTE_CONTEXT_KEYS.student);
                  navigate("/students/new");
                }}
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