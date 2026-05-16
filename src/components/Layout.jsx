import { Button } from "primereact/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Início", icon: "pi pi-home", path: "/" },
    {
      label: "Cadastro",
      icon: "pi pi-building",
      items: [
        { label: "Unidades", icon: "pi pi-home", path: "/units" },
        {
          label: "Instituições",
          icon: "pi pi-building",
          path: "/institutions",
        },
        { label: "Regiões", icon: "pi pi-map", path: "/regions" },
        { label: "Cursos", icon: "pi pi-book", path: "/courses" },
        { label: "Locais", icon: "pi pi-map-marker", path: "/locations" },
      ],
    },
    {
      label: "Gestão",
      icon: "pi pi-calendar",
      items: [
        { label: "Períodos", icon: "pi pi-calendar", path: "/periods" },
        { label: "Alunos", icon: "pi pi-users", path: "/students" },
        { label: "Vínculos", icon: "pi pi-link", path: "/internships" },
      ],
    },
    { label: "Acompanhamento", icon: "pi pi-chart-bar", path: "/dashboard" },
  ];

  return (
    <div className="layout-wrapper">
      <aside className="layout-sidebar p-3">
        <h2 className="text-xl font-bold mb-3">e-NEPS</h2>
        <nav className="flex flex-column gap-2">
          {menuItems.map((item, i) =>
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
        <div className="sidebar-footer mt-4">
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
      </aside>
      <main className="layout-main flex-1">        
        {children}
      </main>
    </div>
  );
}
