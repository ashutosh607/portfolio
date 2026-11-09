import Mission from '../models/Mission.js';

export const getMissions = async (req, res, next) => {
  try {
    const isPublic = req.query.all !== 'true';
    const filter = isPublic ? { visible: true } : {};
    const missions = await Mission.find(filter).sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      count: missions.length,
      data: missions,
    });
  } catch (error) {
    next(error);
  }
};

export const getMissionBySlug = async (req, res, next) => {
  try {
    const mission = await Mission.findOne({ slug: req.params.slug });
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }
    res.json({ success: true, data: mission });
  } catch (error) {
    next(error);
  }
};

export const createMission = async (req, res, next) => {
  try {
    const mission = await Mission.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Mission created successfully',
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMission = async (req, res, next) => {
  try {
    const mission = await Mission.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }
    res.json({
      success: true,
      message: 'Mission updated successfully',
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMission = async (req, res, next) => {
  try {
    const mission = await Mission.findOneAndDelete({ slug: req.params.slug });
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }
    res.json({
      success: true,
      message: 'Mission deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const reorderMissions = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Array of items required' });
    }

    const updates = items.map((item) =>
      Mission.updateOne({ slug: item.id || item.slug }, { $set: { order: item.order } })
    );

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Mission order updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

