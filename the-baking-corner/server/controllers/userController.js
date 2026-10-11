const userModel = require(
  '../models/userModel'
);

const getAllUsers = async (
  req,
  res
) => {
  try {
    const users =
      await userModel.getAllUsers();

    return res
      .status(200)
      .json(users);
  } catch (error) {
    console.error(
      'Error fetching users:',
      error
    );

    return res.status(500).json({
      error: 'Failed to fetch users'
    });
  }
};

module.exports = {
  getAllUsers
};