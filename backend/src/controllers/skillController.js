import { reorder } from './reorder.js';
import Skill from '../models/Skill.js';

export const getSkills = async (req, res, next) => {
  try {
    const isPublic = !req.user || req.query.all !== 'true';
    const filter = isPublic ? { visible: true } : {};
    const skills = await Skill.find(filter).sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

export const createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Skill scroll created successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }
    res.json({
      success: true,
      message: 'Skill scroll updated successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndDelete({ slug: req.params.slug });
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }
    res.json({
      success: true,
      message: 'Skill scroll deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const reorderSkills = async (req, res, next) => {
  try {
    await reorder(Skill, req.body.items);
    res.json({
      success: true,
      message: 'Skill order updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
