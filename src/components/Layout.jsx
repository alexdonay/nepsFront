import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../constants/permissions";
import { logout } from "../services/auth";
import { hasPermission } from "../utils/auth";

export default function Layout({ children }) {
  const navigate = useNavigate();

  const menuItems = [
    // ADMIN
    {
      label: "Início",
      icon: "pi pi-home",
      path: "/",
      permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
    },

    // CAMPO_ESTAGIO - Salas
    {
      label: "Minhas Salas",
      icon: "pi pi-th-large",
      path: "/internships/detail",
      permissions: [PERMISSIONS.CAMPO_ESTAGIO],
    },


    // INSTITUICAO_ENSINO
    {
      label: "Períodos",
      icon: "pi pi-calendar",
      path: "/periods",
      permissions: [PERMISSIONS.INSTITUICAO_ENSINO],
    },
    {
      label: "Cursos",
      icon: "pi pi-book",
      path: "/courses/",
      permissions: [PERMISSIONS.INSTITUICAO_ENSINO],
    },

    // ADMIN — Cadastros
    {
      label: "Cadastros",
      icon: "pi pi-building",
      items: [
        {
          label: "Usuários",
          icon: "pi pi-user-edit",
          path: "/users",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
        {
          label: "Campos de Estágio",
          icon: "pi pi-cog",
          path: "/internships",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
        {
          label: "Instituições",
          icon: "pi pi-building",
          path: "/institutions",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
        {
          label: "Territórios",
          icon: "pi pi-map",
          path: "/regions",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
        {
          label: "Cursos",
          icon: "pi pi-book",
          path: "/courses/",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
        {
          label: "Salas",
          icon: "pi pi-map-marker",
          path: "/rooms",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
      ],
    },

    // ADMIN — Gestão
    {
      label: "Gestão",
      icon: "pi pi-calendar",
      items: [
        {
          label: "Períodos",
          icon: "pi pi-calendar",
          path: "/periods",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
        {
          label: "Alunos",
          icon: "pi pi-users",
          path: "/students",
          permissions: [PERMISSIONS.ADMIN, PERMISSIONS.CAMPO_ESTAGIO],
        },
      ],
    },
  ];

  const filterMenuItems = (items) => {
    const currentPermission = getCurrentPermission();
    return items
      .map((item) => {
        // If item has subitems, filter them
        if (item.items) {
          const filteredSubItems = item.items.filter((sub) =>
            hasPermission(sub.permissions),
          );
          if (filteredSubItems.length === 0) return null;
          return { ...item, items: filteredSubItems };
        }
        // Restrict internships role to only 'Minhas Salas' menu item
        if (
          currentPermission === PERMISSIONS.CAMPO_ESTAGIO &&
          item.path &&
          item.path !== "/internships/detail"
        ) {
          return null;
        }
        // General permission check
        if (item.permissions && !hasPermission(item.permissions)) return null;
        return item;
      })
      .filter(Boolean);
  };

  const visibleMenuItems = filterMenuItems(menuItems);
  return (
    <div className="layout-wrapper">
      <aside className="layout-sidebar">
        <div className="sidebar-header">
          <span className="pi pi-chart-bar mr-2" />
          e-NEPS
        </div>

        <nav className="sidebar-nav">
          {visibleMenuItems.map((item, i) =>
            item.items ? (
              <div key={i} className="sidebar-group">
                <div className="sidebar-group-label">
                  <span className={`pi ${item.icon} mr-2`} />
                  {item.label}
                </div>
                <div className="sidebar-group-items">
                  {item.items.map((sub, j) => (
                    <Link key={j} to={sub.path} className="sidebar-link">
                      <span className={`pi ${sub.icon} mr-2`} />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={i}
                to={item.path}
                className="sidebar-link sidebar-link--top"
              >
                <span className={`pi ${item.icon} mr-2`} />
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="sidebar-footer">
          <Button
            icon="pi pi-sign-out"
            label="Sair"
            text
            className="sidebar-logout"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          />
        </div>
      </aside>

      <main className="layout-main">
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
