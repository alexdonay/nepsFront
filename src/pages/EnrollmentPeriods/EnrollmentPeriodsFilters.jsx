import FilterDrawer from "../../components/FilterDrawer";
import { PERMISSIONS } from "../../constants/permissions";
import { getCurrentPermission, normalizePermission } from "../../utils/auth";

export default function EnrollmentPeriodsFilters({
  visible,
  onHide,
  onApply,
  onClear,
  activeCount,
}) {
  const currentPermission = normalizePermission(getCurrentPermission());
  const isEducationInstitute =
    currentPermission === PERMISSIONS.INSTITUICAO_ENSINO;

  const FILTER_CONFIG = [
    {
      label: "Nome",
      key: "name",
      type: "text",
      placeholder: "Buscar por nome...",
    },
    ...(!isEducationInstitute
      ? [
          {
            label: "Status",
            key: "is_active",
            type: "dropdown",
            options: [
              { label: "Ativo", value: "1" },
              { label: "Encerrado", value: "0" },
            ],
          },
          {
            label: "Data Início",
            key: "start_date",
            type: "date-range",
          },
          {
            label: "Data Fim",
            key: "end_date",
            type: "date-range",
          },
        ]
      : []),
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
