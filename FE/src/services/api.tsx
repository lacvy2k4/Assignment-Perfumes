import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

const userApi = {
    login: (user: any) => api.post("/login", user),
    register: (user: any) => api.post("/register", user),
    logout: () => api.get("/logout"),
    profile: () => api.get("/profile"),
    editProfile: (user: any) => api.patch("/profile", user),
    changePassword: (user: any) => api.put("/profile", user),
    getMembers: () => api.get("/api/collectors"),
}

const perfumeApi = {
    getAllPerfumes: () => api.get("/api/perfumes"),
    getPerfumeById: (id: string) => api.get(`/api/perfumes/${id}`),
    getPerfumeByName: (perfumeName: string) => api.get(`/api/perfumes/name/${perfumeName}`),
    createPerfume: (perfume: any) => api.post("/api/perfumes", perfume),
    updatePerfume: (id: string, perfume: any) => api.put(`/api/perfumes/${id}`, perfume),
    deletePerfume: (id: string) => api.delete(`/api/perfumes/${id}`),
}

const brandApi = {
    getAllBrands: () => api.get("/api/brands"),
    getBrandById: (id: string) => api.get(`/api/brands/${id}`),
    createBrand: (brand: any) => api.post("/api/brands", brand),
    updateBrand: (id: string, brand: any) => api.put(`/api/brands/${id}`, brand),
    deleteBrand: (id: string) => api.delete(`/api/brands/${id}`),
}

const commentApi = {
    getAllComments: () => api.get("/api/comments"),
    createComment: (perfumeId: string, comment: any) => api.post(`/api/comments/perfumes/${perfumeId}`, comment),
    updateComment: (id: string, comment: any) => api.put(`/api/comments/${id}`, comment),
    deleteComment: (id: string) => api.delete(`/api/comments/${id}`),
}

export default api
export { userApi, perfumeApi, brandApi, commentApi }