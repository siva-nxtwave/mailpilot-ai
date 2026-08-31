const EmailActivity = require('../models/EmailActivity');
const { emitToUser } = require('../config/socket');

const logActivity = async ({ owner, action, messageId, threadId, metadata = {}, success = true, error = null }) => {
  try {
    const activity = await EmailActivity.create({
      owner,
      action,
      messageId,
      threadId,
      metadata,
      success,
      error
    });

    // Emit live event to user's socket room
    emitToUser(owner.toString(), 'activity_created', activity);

    return activity;
  } catch (err) {
    console.error('Error logging email activity:', err.message);
    return null;
  }
};

const getActivities = async (userId, limit = 50, page = 1) => {
  const skip = (page - 1) * limit;
  const [activities, total] = await Promise.all([
    EmailActivity.find({ owner: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    EmailActivity.countDocuments({ owner: userId })
  ]);

  return {
    activities,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

const getActivityById = async (activityId, userId) => {
  return EmailActivity.findOne({ _id: activityId, owner: userId }).lean();
};

module.exports = { logActivity, getActivities, getActivityById };
