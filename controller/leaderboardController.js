const User = require('../model/userModel');

exports.getLeaderboard = async (req, res) => {
  const userId = req.userId;

  try {
    // Check if the user is premium
    const user = await User.findById(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ message: 'Access denied: Not a premium user' });
    }

    // Fetch leaderboard sorted by totalexpense descending
    const leaderboard = await User.find({})
      .select('fullname email totalexpense')
      .sort({ totalexpense: -1 });

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
