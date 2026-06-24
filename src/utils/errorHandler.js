

export function getErrorMessage(error, defaultMessage = "Erro") {
  // Check if it's an axios error response
  if (error.response?.data) {
    const data = error.response.data;

    // Check for 'detail' field (common in error responses)
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((e) => {
            const field = e.loc?.join(".") || "field";
            const message = e.msg || "Invalid value";
            return `${field}: ${message}`;
          })
          .join("; ");
      }
      return data.detail;
    }

    if (Array.isArray(data)) {
      return data
        .map((e) => {
          const field = e.loc?.join(".") || "field";
          const message = e.msg || "Invalid value";
          return `${field}: ${message}`;
        })
        .join("; ");
    }

    // Handle object with 'message' field
    if (data.message && typeof data.message === "string") {
      return data.message;
    }

    // Handle plain string response
    if (typeof data === "string") {
      return data;
    }

    // Handle custom error structure
    if (data.error) {
      return data.error;
    }
  }

  // Check for error message string
  if (error.message && typeof error.message === "string") {
    return error.message;
  }

  return defaultMessage;
}
