import { reorder } from './reorder.js';
import Project from '../models/Project.js';

export const getProjects = async (req, res, next) => {
  try {
    // Only authenticated admin can view hidden or draft projects via ?all=true
    const isPublic = !req.user || req.query.all !== 'true';
    const filter = isPublic ? { visible: true, status: 'published' } : {};
    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req, res, next) => {
  try {
    const isPublic = !req.user;
    const filter = {
      slug: req.params.slug,
      ...(isPublic ? { visible: true, status: 'published' } : {}),
    };
    const project = await Project.findOne(filter);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ slug: req.params.slug });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const reorderProjects = async (req, res, next) => {
  try {
    await reorder(Project, req.body.items);
    res.json({
      success: true,
      message: 'Project order updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
