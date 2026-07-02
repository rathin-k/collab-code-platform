import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

export const signup = (userData) => {
  return API.post("/signup", userData);
};

export const login = (userData) => {
  return API.post("/login", userData);
};