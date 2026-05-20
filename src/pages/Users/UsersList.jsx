import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repository } from "../../services/repository";

const getStatusLabel = (user) => {
  const active = user.is_active ?? user.active;
  if (typeof active === "boolean") return active ? "Ativo" : "Inativo";

  if (typeof user.status === "string") {
    const normalized = user.status.trim().toLowerCase();
    if (["ativo", "active", "ativo(a)", "1"].includes(normalized))
      return "Ativo";
    if (["inativo", "inactive", "0"].includes(normalized)) return "Inativo";
  }

  return "-";
};

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data } = await repository.users.get();
      setUsers(data.items || data);
    } catch (e) {
      setUsers([]);
    }
  };

  return (
    <div className="surface-card p-4 shadow-2 border-round">
      <div className="flex justify-content-between mb-3">
        <h2 className="text-xl font-bold">Usuários</h2>
        <Button
          label="Novo Usuário"
          icon="pi pi-plus"
          onClick={() => navigate("/users/new")}
        />
      </div>

      <DataTable
        value={users}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 50]}
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Nome" sortable />
        <Column field="email" header="E-mail" />
        <Column field="role" header="Perfil" />
        <Column body={(rowData) => getStatusLabel(rowData)} header="Status" />
        <Column
          body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => navigate(`/users/${rowData.id}`)}
              />
            </div>
          )}
          header="Ações"
        />
      </DataTable>
    </div>
  );
}
