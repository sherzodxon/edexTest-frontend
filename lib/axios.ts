// lib/axios.ts
import axios from "axios";

// 🔸 Asosiy API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api",
  withCredentials: false,
});

// 🔸 Har bir so‘rovga token qo‘shish
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 🔸 Token muddati tugaganda avtomatik logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

/* =======================
   🟢 AUTH
======================= */
export const loginRequest = (data: { username: string; password: string }) =>
  api.post("/auth/login", data);

export const registerRequest = (data: any) =>
  api.post("/auth/register", data);

export const getMe = () => api.get("/auth/me");

export const logoutRequest = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

/* =======================
   🟡 GRADES
======================= */
export const getAllGrades = () => api.get("/grades");
export const getGradeById = (id: number) => api.get(`/grades/${id}`);
export const createGrade = (data: { name: string }) => api.post("/grades", data);
export const updateGrade = (id: number, data: { name: string }) =>
  api.put(`/grades/${id}`, data);
export const deleteGrade = (id: number) => api.delete(`/grades/${id}`);
export const getTeacherGrades = () => api.get("/grades/my");


/* =======================
   🟠 SUBJECTS
======================= */
export const getAllSubjects = () => api.get("/subjects");
export const getSubjectsByGrade = (gradeId: number) =>
  api.get(`/subjects/grade/${gradeId}`);
export const createSubject = (data: { name: string; gradeId: number }) =>
  api.post("/subjects", data);
export const getTeacherSubjects = () => api.get("/subjects/my");
/* =======================
   🔵 TESTS
======================= */
export const getTestsBySubject = (subjectId: number) =>
  api.get(`/tests/subject/${subjectId}`);
export const getTestById = (testId: number) => api.get(`/tests/${testId}`);
export const createTest = (formData: FormData) =>
  api.post("/tests", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const submitTest = (testId: number, answers: any) =>
  api.post(`/tests/${testId}/submit`, { answers });
/* =======================
   🟣 USERS
======================= */
export const getUsers = () => api.get("/users");
export const createUser = (data: any) => api.post("/users", data);
export const getUserById = (id: number) => api.get(`/users/${id}`);
export const updateUser = (id: number, data: any) =>
  api.put(`/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);
// ==== STUDENTS ====
export const getStudentsByGrade = (gradeId: number) =>
  api.get(`/grades/${gradeId}/students`);


export default api;
