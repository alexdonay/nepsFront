import FilterDrawer from "../../components/FilterDrawer";

export default function DisciplinesFilter({
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
5499377804