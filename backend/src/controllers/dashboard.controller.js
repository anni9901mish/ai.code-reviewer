const { getDashboardStats } = require("../services/dashboard.service");

const getDashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats(req.user.id);

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      dashboard: stats,
    });
  } catch (error) {
    console.log("DASHBOARD ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
};

module.exports = {
  getDashboard,
};