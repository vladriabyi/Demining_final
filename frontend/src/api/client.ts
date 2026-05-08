import axios from "axios"

const client = axios.create({ baseURL: "/api" })

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem("access_token")
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
      window.location.replace("/login")
    }
    return Promise.reject(err)
  }
)

export default client
