import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import {
  ALL_PERMISSIONS,
  MANAGEMENT_PERMISSIONS,
  PERMISSIONS,
} from "../constants/permissions";
import { logout } from "../services/auth";
import { hasPermission } from "../utils/auth";

export default function Layout({ children }) {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Início", icon: "pi pi-home", path: "/", permissions: [] },
    {
      label: "Cadastros",
      icon: "pi pi-building",
      items: [
        {
          label: "Usuários",
          icon: "pi pi-user-edit",
          path: "/users",
          permissions: [PERMISSIONS.ADMIN],
        },
        {
          label: "Campos de Estágio",
          icon: "pi pi-cog",
          path: "/internships",
          permissions: [PERMISSIONS.ADMIN],
        },
        {
          label: "Instituições",
          icon: "pi pi-building",
          path: "/institutions",
          permissions: [PERMISSIONS.ADMIN],
        },
        {
          label: "Regiões",
          icon: "pi pi-map",
          path: "/regions",
          permissions: [PERMISSIONS.ADMIN],
        },
        {
          label: "Disciplinas",
          icon: "pi pi-book",
          path: "/disciplines",
          permissions: [PERMISSIONS.ADMIN],
        },
        {
          label: "Salas",
          icon: "pi pi-map-marker",
          path: "/rooms",
          permissions: [PERMISSIONS.ADMIN],
        },
      ],
    },
    {
      label: "Gestão",
      icon: "pi pi-calendar",
      items: [
        {
          label: "Períodos",
          icon: "pi pi-calendar",
          path: "/periods",
          permissions: ALL_PERMISSIONS,
        },
        {
          label: "Alunos",
          icon: "pi pi-users",
          path: "/students",
          permissions: MANAGEMENT_PERMISSIONS,
        },
        {
          label: "Vincular Alunos",
          icon: "pi pi-link",
          path: "/internships/link-students",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
      ],
    },
    {
      label: "Acompanhamento",
      icon: "pi pi-chart-bar",
      path: "/dashboard",
      permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
    },
  ];

  const filterMenuItems = (items) => {
    return items
      .map((item) => {
        if (item.items) {
          const filteredSubItems = item.items.filter((sub) =>
            hasPermission(sub.permissions),
          );
          if (filteredSubItems.length === 0) return null;
          return { ...item, items: filteredSubItems };
        }
        if (item.permissions && !hasPermission(item.permissions)) return null;
        return item;
      })
      .filter(Boolean);
  };

  const visibleMenuItems = filterMenuItems(menuItems);
  return (
    <div className="layout-wrapper">
      <aside className="layout-sidebar p-3">
        <h2 className="text-xl font-bold mb-3">e-NEPS</h2>
        <nav className="flex flex-column gap-2">
          {visibleMenuItems.map((item, i) =>
            item.items ? (
              <div key={i} className="dropdown">
                <span className={`pi ${item.icon} mr-2`}></span> {item.label}
                <div className="submenu ml-3 mt-2">
                  {item.items.map((sub, j) => (
                    <Link
                      key={j}
                      to={sub.path}
                      className="block py-2 text-white"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={i} to={item.path} className="py-2 text-white">
                <span className={`pi ${item.icon} mr-2`}></span> {item.label}
              </Link>
            ),
          )}
        </nav>
      </aside>

      <main className="layout-main flex-1">
        <div className="flex justify-content-end mb-3 gap-2">
          <Button
            icon="pi pi-user"
            text
            className="text-white"
            onClick={() => navigate("/profile")}
          />
          <Button
            icon="pi pi-sign-out"
            label="Sair"
            className="p-button-plain text-white"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          />
        </div>

        <div className="p-3">{children}</div>
      </main>
    </div>
  );
}
