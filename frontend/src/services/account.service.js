import api from "./api";

export const getProfile = async () => {
  const { data } = await api.get("/account/profile");

  return data.user;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put(
    "/account/profile",
    payload
  );

  return data;
};

export const changePassword = async (payload) => {
  const { data } = await api.put(
    "/account/password",
    payload
  );

  return data;
};

export const deleteAccount = async (password) => {
  const { data } = await api.delete("/account", {
    data: {
      password,
    },
  });

  return data;
};