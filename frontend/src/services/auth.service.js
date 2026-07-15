import api from "./api";

export const loginUser = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);

  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};