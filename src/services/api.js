
const API_URL = "http://127.0.0.1:8000/api";

export async function apiRequest(
  endpoint,
  { method = "GET", body, token } = {}
) {
  const headers = {
    Accept: "application/json",
  };

  // Memeriksa apakah data berupa FormData
  const isFormData = body instanceof FormData;

  // Jika bukan FormData, kirim sebagai JSON
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // Mengambil token Sanctum
  const tokenLogin = token || localStorage.getItem("token");

  if (tokenLogin) {
    headers.Authorization = `Bearer ${tokenLogin}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body:
      body !== undefined
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
  });

  // Membaca respons server
  
  // Membaca respons server
  let result;

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  // Menangani respons error dari Laravel
  if (!response.ok) {
    const error = new Error(
      result.message || "Terjadi kesalahan pada server."
    );

    error.status = response.status;
    error.data = result;
    error.retryAfter = result.retry_after || null;

    throw error;
  }

  return result;

}
