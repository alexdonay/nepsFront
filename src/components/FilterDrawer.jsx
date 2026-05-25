import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Sidebar } from "primereact/sidebar";
import { useEffect, useState } from "react";

export default function FilterDrawer({
  visible,
  onHide,
  filters,
  onApply,
  onClear,
  activeCount,
}) {
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    // Inicializar filtros com valores vazios
    const initialValues = {};
    filters?.forEach((filter) => {
      if (filter.type === "date-range") {
        initialValues[filter.key] = [null, null];
      } else if (filter.type === "multiselect") {
        initialValues[filter.key] = [];
      } else {
        initialValues[filter.key] = filter.type === "boolean" ? false : null;
      }
    });
    setFilterValues(initialValues);
  }, [filters]);

  const handleApply = () => {
    const appliedFilters = {};

    // Map filter keys to backend query params depending on type
    filters?.forEach((filter) => {
      const { key, type, queryKey } = filter;
      const value = filterValues[key];

      const isEmptyArray = Array.isArray(value) && value.length === 0;
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === false ||
        isEmptyArray
      )
        return;

      // Determine final param key
      let paramKey = queryKey || key;
      if (type === "text") paramKey = queryKey || `${key}_like`;
      if (type === "multiselect") paramKey = queryKey || `${key}_in`;

      if (type === "date-range" && Array.isArray(value)) {
        const [start, end] = value;
        if (start)
          appliedFilters[`${key}_start`] = start.toISOString().split("T")[0];
        if (end) appliedFilters[`${key}_end`] = end.toISOString().split("T")[0];
        return;
      }

      if (type === "date" && value instanceof Date) {
        appliedFilters[paramKey] = value.toISOString().split("T")[0];
        return;
      }

      // For multiselect, keep as array so caller can decide serialization
      appliedFilters[paramKey] = value;
    });

    onApply(appliedFilters);
    onHide();
  };

  const handleClear = () => {
    const clearedValues = {};
    filters?.forEach((filter) => {
      if (filter.type === "date-range") {
        clearedValues[filter.key] = [null, null];
      } else if (filter.type === "multiselect") {
        clearedValues[filter.key] = [];
      } else {
        clearedValues[filter.key] = filter.type === "boolean" ? false : null;
      }
    });
    setFilterValues(clearedValues);
    onClear();
  };

  const renderFilterField = (filter) => {
    const { label, key, type, placeholder, options } = filter;

    const commonProps = {
      value:
        filterValues[key] ??
        (type === "date-range"
          ? [null, null]
          : type === "multiselect"
            ? []
            : type === "boolean"
              ? false
              : null),
      autoComplete: "new-password",
      onChange: (e) => {
        setFilterValues((prev) => ({
          ...prev,
          [key]: e.target?.value !== undefined ? e.target.value : e.value,
        }));
      },
      className: "w-full",
    };

    switch (type) {
      case "text":
        return (
          <div key={key} className="field mb-4">
            <label className="block text-900 font-medium mb-2">{label}</label>
            <InputText {...commonProps} placeholder={placeholder} />
          </div>
        );

      case "dropdown":
        return (
          <div key={key} className="field mb-4">
            <label className="block text-900 font-medium mb-2">{label}</label>
            <Dropdown
              {...commonProps}
              options={options}
              optionLabel="label"
              optionValue="value"
              placeholder={placeholder || "Selecionar..."}
              showClear
            />
          </div>
        );

      case "multiselect":
        return (
          <div key={key} className="field mb-4">
            <label className="block text-900 font-medium mb-2">{label}</label>
            <MultiSelect
              {...commonProps}
              options={options}
              optionLabel="label"
              optionValue="value"
              placeholder={placeholder || "Selecionar..."}
              showClear
            />
          </div>
        );

      case "date":
        return (
          <div key={key} className="field mb-4">
            <label className="block text-900 font-medium mb-2">{label}</label>
            <Calendar
              {...commonProps}
              dateFormat="dd/mm/yy"
              showIcon
              mask="99/99/9999"
            />
          </div>
        );

      case "date-range":
        return (
          <div key={key} className="field mb-4">
            <label className="block text-900 font-medium mb-2">{label}</label>
            <Calendar
              value={filterValues[key] || [null, null]}
              onChange={(e) => {
                setFilterValues((prev) => ({
                  ...prev,
                  [key]: e.value,
                }));
              }}
              selectionMode="range"
              readOnlyInput
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full"
              placeholder={placeholder || "Data início - Data fim"}
            />
          </div>
        );

      case "boolean":
        return (
          <div key={key} className="field mb-4">
            <label className="flex align-items-center gap-2">
              <Checkbox
                checked={filterValues[key] || false}
                onChange={(e) => {
                  setFilterValues((prev) => ({
                    ...prev,
                    [key]: e.checked,
                  }));
                }}
              />
              <span>{label}</span>
            </label>
          </div>
        );

      case "number":
        return (
          <div key={key} className="field mb-4">
            <label className="block text-900 font-medium mb-2">{label}</label>
            <InputNumber
              {...commonProps}
              placeholder={placeholder}
              useGrouping={false}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Sidebar
        visible={visible}
        onHide={onHide}
        position="right"
        style={{ width: "25%", maxWidth: "400px" }}
        breakpoint="768px"
        className="p-sidebar-lg"
      >
        <div className="flex flex-column h-full">
          <div className="flex justify-content-between align-items-center mb-4 pb-3 border-bottom-1 border-200">
            <h3 className="m-0 text-lg font-bold">Filtros</h3>
          </div>

          <div className="flex-grow-1 overflow-y-auto">
            {filters?.map((filter) => renderFilterField(filter))}
          </div>

          <div className="flex gap-2 pt-3 border-top-1 border-200 mt-4">
            <Button
              label="Aplicar"
              icon="pi pi-check"
              onClick={handleApply}
              className="flex-1"
            />
            <Button
              label="Limpar"
              icon="pi pi-trash"
              severity="secondary"
              onClick={handleClear}
              className="flex-1"
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
}
