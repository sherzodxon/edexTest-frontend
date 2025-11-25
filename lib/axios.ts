// lib/axios.ts
import axios from "axios";

/* =======================
    🔹 Asosiy API instance
  ======================= */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api",
    withCredentials: false
});

api.interceptors.request
    .use((config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    });

api.interceptors.response.use((res) => res, (err) => {
        if (err
            ?.response
                ?.status === 401 || err
                    ?.response
                        ?.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    });

export const loginRequest = (data : {
    username: string;
    password: string
}) => api.post("/auth/login", data);

export const registerRequest = (data : any) => api.post("/auth/register", data);

export const getMe = () => api.get("/auth/me");

export const logoutRequest = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }
};

export const getAllGrades = () => api.get("/grades");

export const getGradeById = (id : number) => api.get(`/grades/${id}`);

export const createGrade = (data : {
    name: string
}) => api.post("/grades", data);

export const updateGrade = (id : number, data : {
    name: string
}) => api.put(`/grades/${id}`, data);

export const deleteGrade = (id : number) => api.delete(`/grades/${id}`);

export const getTeacherGrades = () => api.get("/grades/my");

export const getAllSubjects = () => api.get("/subjects");

export const getSubjectsByGrade = (gradeId : number) => api.get(`/subjects/grade/${gradeId}`);

export const createSubject = (data : {
    name: string;
    gradeId: number
}) => api.post("/subjects", data);

export const getTeacherSubjects = () => api.get("/subjects/my");
export const getTestsBySubject = (subjectId: number, role: string) => {
  if (role === "TEACHER") return api.get(`/subjects/teacher/${subjectId}/tests`);
  if (role === "ADMIN")   return api.get(`/subjects/admin/${subjectId}/tests`);
  return api.get(`subjects/${subjectId}/tests`);
};


export const getAverageBySubject = (subjectId : number) => api.get(`/subjects/${subjectId}/average`);

export const getTestById = (testId : number) => api.get(`/tests/${testId}`);
export const createTest = (formData : FormData) => api.post("/tests", formData, {
    headers: {
        "Content-Type": "multipart/form-data"
    }
});
export const getActiveStudents = (id : number) => api.get(`/tests/${id}/active-students`);

export const getTestResults = (id : number) => api.get(`/tests/${id}/results`);

export const getTeacherTestsBySubject = (subjectId : number) => api.get(`/subjects/teacher/${subjectId}/tests`);

export const deleteTest = async(id : number) => {
    return api.delete(`/tests/${id}`);
};
export const finishTest = async(testId : number, payload : any) => {
    // backend /tests/:id/submit endpointiga POST qiladi
    const res = await api.post(`/tests/${testId}/submit`, payload);
    return res.data;
};
export const getAverageResultsBySubject = (subjectId : number) => api.get(`/tests/results/${subjectId}`);

export const getUsers = () => api.get("/users");

export const createUser = (data : any) => api.post("/users", data);

export const getUserById = (id : number) => api.get(`/users/${id}`);

export const updateUser = (id : number, data : any) => api.put(`/users/${id}`, data);

export const deleteUser = (id : number) => api.delete(`/users/${id}`);

export const getStudentsByGrade = (gradeId : number) => api.get(`/grades/${gradeId}/students`);

export const createQuestion = (testId : number, formData : FormData) => api.post(`/questions/${testId}`, formData, {
    headers: {
        "Content-Type": "multipart/form-data"
    }
});
export const updateQuestion = (id : number, formData : FormData) => api.put(`/questions/${id}`, formData, {
    headers: {
        "Content-Type": "multipart/form-data"
    }
});

export const getQuestionsByTest = (testId : number) => api.get(`/tests/${testId}/questions`);

export const sendAnswer = (data : {
    questionId: number;
    optionId: number
}) => api.post("/answers", data);


export default api;
