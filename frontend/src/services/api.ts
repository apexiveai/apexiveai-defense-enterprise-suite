
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8017/api/v1";

export interface PersonnelRecord {
  id: number;
  employee_code: string;
  full_name: string;
  department: string;
  job_title: string;
  employment_status: string;
  created_at: string;
}

export interface PersonnelCreate {
  employee_code: string;
  full_name: string;
  department: string;
  job_title: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail || `API Error: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export const personnelAPI = {
  list: () =>
    request<PersonnelRecord[]>("/personnel/"),

  create: (data: PersonnelCreate) =>
    request<PersonnelRecord>("/personnel/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (id: number) =>
    request<PersonnelRecord>(`/personnel/${id}`),
};

export const healthAPI = {
  check: () =>
    fetch("http://127.0.0.1:8017/health").then(async (r) => {
      if (!r.ok) throw new Error("Backend unavailable");
      return r.json();
    }),
};
