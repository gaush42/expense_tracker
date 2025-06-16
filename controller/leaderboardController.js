const User = require('../model/userModel');

exports.getLeaderboard = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: 'Access denied: Not a premium user' });
    }

    const leaderboard = await User.find({})
      .select('fullname email totalexpense')
      .sort({ totalexpense: -1 });

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
