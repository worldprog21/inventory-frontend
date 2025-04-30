import axios from "axios";
import { getSession } from "next-auth/react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handleApiError";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL,
});

// Request interceptor — attach Authorization token
axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.jwt) {
    config.headers.Authorization = `Bearer ${session.user.jwt}`;
  }
  return config;
});

// Response interceptor — global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = handleApiError(error);
    toast.error(errorMessage); // 🛎 show toast automatically
    return Promise.reject(error); // still reject so you can catch if needed
  }
);

export default axiosInstance;
