const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
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

export async function uploadPdfToCloudinary(file) {
  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Configuração do Cloudinary ausente no ambiente. Verifique as variáveis VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY e VITE_CLOUDINARY_API_SECRET.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const paramsToSign = `timestamp=${timestamp}`;
  const signatureBuffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(`${paramsToSign}${CLOUDINARY_API_SECRET}`),
  );
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
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
