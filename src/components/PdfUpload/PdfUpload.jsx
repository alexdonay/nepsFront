import { Button } from "primereact/button";
import { useRef } from "react";
import "./PdfUpload.css";

export default function PdfUpload({
  label,
  required,
  value,
  onChange,
  existingUrl,
  hint,
}) {
  const inputRef = useRef(null);

  const hintText = hint || "PDF, máximo 5MB";

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || null;
    if (file) onChange(file);
  };

  const handleInput = (e) => {
    onChange(e.target.files?.[0] || null);
    e.target.value = "";
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="field mb-3">
      {label && (
        <label className="block font-medium mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className="pdf-upload-zone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleInput}
          required={required && !value && !existingUrl}
        />

        {value ? (
          <div className="pdf-upload-selected">
            <i className="pi pi-file-pdf pdf-upload-icon pdf-upload-icon--ready" />
            <div className="pdf-upload-info">
              <span className="pdf-upload-filename">{value.name}</span>
              <span className="pdf-upload-size">
                {(value.size / 1024).toFixed(0)} KB
              </span>
            </div>
            <Button
              icon="pi pi-times"
              text
              severity="danger"
              rounded
              className="pdf-upload-clear"
              onClick={handleClear}
              tooltip="Remover"
              tooltipOptions={{ position: "top" }}
            />
          </div>
        ) : existingUrl ? (
          <div className="pdf-upload-existing">
            <i className="pi pi-check-circle pdf-upload-icon pdf-upload-icon--saved" />
            <div className="pdf-upload-info">
              <span className="pdf-upload-filename">Documento já enviado</span>
              <span className="pdf-upload-size">Clique para substituir</span>
            </div>
            <a
              href={existingUrl}
              target="_blank"
              rel="noreferrer"
              className="pdf-upload-view"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="pi pi-eye" /> Ver
            </a>
          </div>
        ) : (
          <div className="pdf-upload-empty">
            <i className="pi pi-upload pdf-upload-icon pdf-upload-icon--empty" />
            <span className="pdf-upload-cta">
              Arraste o PDF aqui ou clique para selecionar
            </span>
            <span className="pdf-upload-hint">{hintText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
