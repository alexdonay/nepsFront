const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
const MAX_PDF_SIZE = 5 * 1024 * 1024;

function sha1(str) {
  const rotate = (n, s) => (n << s) | (n >>> (32 - s));
  const msg = unescape(encodeURIComponent(str));
  const H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
  const words = [];
  for (let i = 0; i < msg.length; i++)
    words[i >> 2] |= msg.charCodeAt(i) << (24 - (i % 4) * 8);
  words[msg.length >> 2] |= 0x80 << (24 - (msg.length % 4) * 8);
  words[((msg.length + 8 >> 6) + 1) * 16 - 1] = msg.length * 8;
  for (let i = 0; i < words.length; i += 16) {
    const W = Array(80);
    let [a, b, c, d, e] = H;
    for (let j = 0; j < 80; j++) {
      W[j] = j < 16 ? (words[i + j] | 0) : rotate(W[j-3] ^ W[j-8] ^ W[j-14] ^ W[j-16], 1);
      const T = (rotate(a, 5) + e + W[j] + (
        j < 20 ? ((b & c) | (~b & d)) + 0x5A827999 :
        j < 40 ? (b ^ c ^ d)          + 0x6ED9EBA1 :
        j < 60 ? ((b & c) | (b & d) | (c & d)) + 0x8F1BBCDC :
                 (b ^ c ^ d)          + 0xCA62C1D6
      )) >>> 0;
      [e, d, c, b, a] = [d, c, rotate(b, 30), a, T];
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0; H[4] = (H[4] + e) >>> 0;
  }
  return H.map(n => n.toString(16).padStart(8, "0")).join("");
}

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

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Configuração do Cloudinary ausente no ambiente. Verifique as variáveis VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY e VITE_CLOUDINARY_API_SECRET.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsToSign = `timestamp=${timestamp}&type=upload`;
  const signature = sha1(`${paramsToSign}${CLOUDINARY_API_SECRET}`);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("type", "upload");

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

export function getPdfDownloadUrl(url) {
  if (!url) return "";
  if (url.includes("/raw/upload/") && !url.includes("fl_attachment")) {
    return url.replace("/raw/upload/", "/raw/upload/fl_attachment/");
  }
  return url;
}
