import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterDrawer from "../../components/FilterDrawer";
import { repository } from "../../services/repository";

const FILTER_CONFIG = [
  {
    label: "Nome",
    key: "name",
    type: "text",
    placeholder: "Buscar por nome...",
  },
  {
    label: "Território",
    key: "region_id",
    type: "dropdown",
    options: [],
  },
  {
    label: "Status",
    key: "is_active",
    type: "dropdown",
    options: [
      { label: "Ativo", value: "1" },
      { label: "Inativo", value: "0" },
    ],
  },
];

export default function InternshipsFilter({
  filterVisible,
  setFilterVisible,
  onFilterChange,
}) {
  const [regions, setRegions] = useState({});
  const [filterConfig, setFilterConfig] = useState(FILTER_CONFIG);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadRegions();
    const hasFilters = searchParams.toString().length > 0;
    if (hasFilters) {
      setFilterVisible(true);
    }
  }, []);

  const loadRegions = async () => {
    try {
      const { data } = await repository.regions.get();
      const regionsList = data.items || data || [];

      const regionsMap = {};
      regionsList.forEach((r) => {
        regionsMap[r.id] = r.name;
      });
      setRegions(regionsMap);

      const updatedConfig = FILTER_CONFIG.map((filter) => {
        if (filter.key === "region_id") {
          return {
            ...filter,
            options: regionsList.map((r) => ({ label: r.name, value: r.id })),
          };
        }
        return filter;
      });
      setFilterConfig(updatedConfig);
    } catch (e) {
      console.error("Erro ao carregar regiões:", e);
    }
  };

  const handleApplyFilters = (appliedFilters) => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.append(key, value.join(","));
      } else {
        params.append(key, value);
      }
    });
    setSearchParams(params);
    setFilterVisible(false);
    onFilterChange?.(appliedFilters);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setFilterVisible(false);
    onFilterChange?.({});
  };

  const activeFilterCount = Array.from(searchParams.entries()).length;

  const initialValues = {
    ...(searchParams.has("name_like") && {
      name: searchParams.get("name_like"),
    }),
    ...(searchParams.has("region_id") && {
      region_id: Number(searchParams.get("region_id")),
    }),
    ...(searchParams.has("is_active") && {
      is_active: searchParams.get("is_active"),
    }),
  };

  return (
    <FilterDrawer
      visible={filterVisible}
      onHide={() => setFilterVisible(false)}
      filters={filterConfig}
      onApply={handleApplyFilters}
      onClear={handleClearFilters}
      activeCount={activeFilterCount}
      initialValues={initialValues}
    />
  );
}
