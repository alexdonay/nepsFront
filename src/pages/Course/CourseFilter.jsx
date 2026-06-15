import FilterDrawer from "../../components/FilterDrawer";

export default function CourseFilter({
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
