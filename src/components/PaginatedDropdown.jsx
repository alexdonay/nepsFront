import { Dropdown } from "primereact/dropdown";
import { useState, useRef, useCallback, useEffect } from "react";

const DEFAULT_PAGE_SIZE = 50;

export default function PaginatedDropdown({
  fetchFn,
  fetchById,
  value,
  onChange,
  optionLabel = "name",
  optionValue = "id",
  placeholder = "Selecione...",
  pageSize = DEFAULT_PAGE_SIZE,
  emptyMessage = "Nenhum resultado encontrado",
  ...rest
}) {
  const [options, setOptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const filterRef = useRef("");
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (search, page) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = { page, per_page: pageSize };
      if (search) params.name_like = search;
      const res = await fetchFn(params);
      const items = res.data?.items || res.data || [];
      const pagination = res.data?.pagination;
      const newTotal = pagination?.total ?? items.length;
      setOptions(prev => (page === 1 ? items : [...prev, ...items]));
      setTotal(newTotal);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchFn, pageSize]);

  useEffect(() => {
    pageRef.current = 1;
    filterRef.current = "";
    loadPage("", 1);
  }, [loadPage]);

  const optionsKey = options.map(o => (typeof o === "object" ? o[optionValue] : o)).join(",");

  useEffect(() => {
    if (!value || !fetchById) return;
    const found = options.some(o =>
      (typeof o === "object" ? o[optionValue] : o) === value
    );
    if (!found && options.length > 0) {
      fetchById(value).then(res => {
        const item = res.data;
        if (item) {
          setOptions(prev => {
            if (prev.some(o => (typeof o === "object" ? o[optionValue] : o) === value)) return prev;
            return [item, ...prev];
          });
        }
      }).catch(() => {});
    }
  }, [value, fetchById, optionsKey]);

  const handleFilter = useCallback(e => {
    const search = e.filter ?? "";
    filterRef.current = search;
    pageRef.current = 1;
    loadPage(search, 1);
  }, [loadPage]);

  const handleLazyLoad = useCallback(e => {
    const page = Math.floor(e.first / pageSize) + 1;
    if (options.length < total && page > pageRef.current) {
      pageRef.current = page;
      loadPage(filterRef.current, page);
    }
  }, [loadPage, options.length, total, pageSize]);

  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={options}
      optionLabel={optionLabel}
      optionValue={optionValue}
      placeholder={placeholder}
      filter
      onFilter={handleFilter}
      filterPlaceholder="Buscar..."
      filterDelay={300}
      showClear
      loading={loading}
      virtualScrollerOptions={{
        lazy: true,
        onLazyLoad: handleLazyLoad,
        itemSize: 40,
        showLoader: true,
        loading,
      }}
      emptyMessage={emptyMessage}
      className="w-full"
      {...rest}
    />
  );
}
