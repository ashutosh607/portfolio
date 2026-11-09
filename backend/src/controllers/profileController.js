import Profile from '../models/Profile.js';

export const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      // Create initial profile if none exists
      profile = await Profile.create({});
    }
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(req.body);
    } else {
      profile = await Profile.findByIdAndUpdate(profile._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.json({
      success: true,
      message: 'Profile dossier updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

