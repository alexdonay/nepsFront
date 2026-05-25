import FilterDrawer from "../../components/FilterDrawer";

export default function CoursesFilter({
  visible,
  onHide,
  onApply,
  onClear,
  activeCount,
  regions = [],
}) {
  const FILTER_CONFIG = [
    {
      label: "Nome",
      key: "name",
      type: "text",
      placeholder: "Buscar por nome...",
    },
    {
      label: "Código",
      key: "code",
      type: "text",
      placeholder: "Buscar por código...",
    },
    {
      label: "Região",
      key: "region_id",
      type: "dropdown",
      options: regions.map((r) => ({ label: r.name, value: r.id })),
    },
  ];

  return (
    <FilterDrawer
      visible={visible}
      onHide={onHide}
      filters={FILTER_CONFIG}
      onApply={onApply}
      onClear={onClear}
      activeCount={activeCount}
    />
  );
}
5499377804