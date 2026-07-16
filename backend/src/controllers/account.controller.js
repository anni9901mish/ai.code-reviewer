const {
  getAccount,
  updateAccount,
  changeAccountPassword,
  deleteAccount,
} = require("../services/account.service");

const getProfile = async (req, res) => {
  try {
    const user = await getAccount(req.user.id);

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        message:
          error.message || "Failed to fetch profile",
      });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await updateAccount({
      userId: req.user.id,
      name: req.body.name,
      email: req.body.email,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        message:
          error.message || "Failed to update profile",
      });
  }
};

const changePassword = async (req, res) => {
  try {
    await changeAccountPassword({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        message:
          error.message || "Failed to change password",
      });
  }
};

const removeAccount = async (req, res) => {
  try {
    await deleteAccount({
      userId: req.user.id,
      password: req.body.password,
    });

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({
        message:
          error.message || "Failed to delete account",
      });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  removeAccount,
};