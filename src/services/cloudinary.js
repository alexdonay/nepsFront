const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const MAX_PDF_SIZE = 5 * 1024 * 1024;

export function validatePdfFile(file) {
  if (!file) {
    return "Selecione um PDF para continuar.";
  }

  if (file.type !== "application/pdf") {
    return "O arquivo deve ser um PDF.";
  }

  if (file.size > MAX_PDF_SIZE) {
    return "O arquivo deve ter no máximo 5MB.";
  }

  return null;
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Falha ao ler o arquivo PDF."));
        return;
      }

      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Falha ao ler o arquivo PDF."));
    reader.readAsDataURL(file);
  });
}

export async function uploadPdfToCloudinary(file) {
  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Configuração do Cloudinary ausente no ambiente. Verifique as variáveis VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Falha ao enviar o PDF para o Cloudinary.",
    );
  }

  if (!data?.secure_url) {
    throw new Error("Cloudinary não retornou a URL do arquivo enviado.");
  }

  return data.secure_url;
}
