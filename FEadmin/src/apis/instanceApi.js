import axios from "axios";
import { ROOT_DOMAIN } from "../utils/constant";

export const instanceApi = axios.create({
    baseURL: ROOT_DOMAIN,
});

instanceApi.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    const { refreshToken } = JSON.parse(userInfo);
    if(refreshToken) {
      config.headers.Authorization = `Bearer ${refreshToken}`;
    }
  }
  config.headers.set('Content-Type', 'application/json');

  return config;
});
