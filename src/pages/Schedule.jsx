import { useEffect, useState } from "react";
import api from "../services/api";

export default function Schedule() {
  const [agenda, setAgenda] = useState([]);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const { data } = await api.get("/acompanhamento/locations-agenda");
      setAgenda(data);
    } catch (e) {
      setAgenda([]);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <h2 className="text-xl font-bold mb-3">Agenda Semanal</h2>

      {agenda.length === 0 ? (
        <p>Nenhum dado disponível.</p>
      ) : (
        agenda.map((loc) => (
          <div key={loc.location_id} className="mb-4">
            <h3 className="text-lg font-medium">{loc.location_name}</h3>
            <div className="grid">
              <div className="col-4">
                <div className="surface-100 p-3 border-round">
                  <strong>Manhã</strong>
                  <p>
                    {loc.morning_students?.length || 0}/{loc.morning_slots}
                  </p>
                </div>
              </div>
              <div className="col-4">
                <div className="surface-100 p-3 border-round">
                  <strong>Tarde</strong>
                  <p>
                    {loc.afternoon_students?.length || 0}/{loc.afternoon_slots}
                  </p>
                </div>
              </div>
              <div className="col-4">
                <div className="surface-100 p-3 border-round">
                  <strong>Noite</strong>
                  <p>
                    {loc.evening_students?.length || 0}/{loc.evening_slots}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
