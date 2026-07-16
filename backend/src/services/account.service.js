const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const getAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateAccount = async ({
  userId,
  name,
  email,
}) => {
  const cleanedName = name?.trim();
  const cleanedEmail = email?.trim().toLowerCase();

  if (!cleanedName) {
    const error = new Error("Name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!cleanedEmail) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: cleanedEmail,
      NOT: {
        id: userId,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    const error = new Error(
      "Another account is already using this email"
    );
    error.statusCode = 409;
    throw error;
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: cleanedName,
      email: cleanedEmail,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
};

const changeAccountPassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  if (!currentPassword || !newPassword) {
    const error = new Error(
      "Current password and new password are required"
    );
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error(
      "New password must be at least 6 characters"
    );
    error.statusCode = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error(
      "New password must be different from current password"
    );
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!passwordMatches) {
    const error = new Error(
      "Current password is incorrect"
    );
    error.statusCode = 401;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    12
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
};

const deleteAccount = async ({
  userId,
  password,
}) => {
  if (!password) {
    const error = new Error(
      "Password is required to delete the account"
    );
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    const error = new Error("Password is incorrect");
    error.statusCode = 401;
    throw error;
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
};

module.exports = {
  getAccount,
  updateAccount,
  changeAccountPassword,
  deleteAccount,
};