const {
  getUserProjectScans,
  getProjectScanById,
  deleteProjectScan,
} = require("../services/project-scan.service");

const getScans = async (req, res) => {
  try {
    const scans = await getUserProjectScans(
      req.user.id
    );

    return res.status(200).json(scans);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const getScan = async (req, res) => {
  try {
    const scan = await getProjectScanById(
      req.user.id,
      Number(req.params.id)
    );

    return res.status(200).json(scan);
  } catch (error) {
    console.log(error);

    return res
      .status(error.statusCode || 500)
      .json({
        message: error.message,
      });
  }
};

const removeScan = async (req, res) => {
  try {
    await deleteProjectScan(
      req.user.id,
      Number(req.params.id)
    );

    return res.status(200).json({
      message: "Project scan deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res
      .status(error.statusCode || 500)
      .json({
        message: error.message,
      });
  }
};

module.exports = {
  getScans,
  getScan,
  removeScan,
};