const activityService = require('../services/activityService');

const getActivities = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    const result = await activityService.getActivities(
      req.user._id,
      parseInt(limit, 10) || 50,
      parseInt(page, 10) || 1
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await activityService.getActivityById(id, req.user._id);
    if (!activity) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Activity not found' } });
    }
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities, getActivityById };
