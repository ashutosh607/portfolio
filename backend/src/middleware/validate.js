import { z } from 'zod';

// Safe URL regex that strictly requires http:// or https://, preventing javascript:, data:, vbscript: XSS
const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (url) => !url || /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url) || url.startsWith('/'),
    { message: 'Must be a valid HTTP/HTTPS URL or root-relative path' }
  );

// Safe slug regex (alphanumeric and hyphens only)
const safeSlugSchema = z
  .string()
  .trim()
  .min(2, 'Slug must be at least 2 characters')
  .max(80, 'Slug cannot exceed 80 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

// 1. Auth Validation Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format')
    .max(120, 'Email must be under 120 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(120, 'Password must be under 120 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(120),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(120),
});

// 2. Visitor Contact Message Schema (Spam & Injection Defense)
export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email format')
    .max(150, 'Email cannot exceed 150 characters'),
  subject: z
    .string()
    .trim()
    .max(150, 'Subject cannot exceed 150 characters')
    .default('Shinobi Inquiry'),
  message: z
    .string()
    .trim()
    .min(2, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters'),
});

// 3. Project Schema
export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  slug: safeSlugSchema,
  dishName: z.string().trim().max(100).default(''),
  category: z.string().trim().max(100).default('Full-Stack'),
  frontPagePhoto: safeUrlSchema.default(''),
  projectPhoto: safeUrlSchema,
  screenshots: z.array(safeUrlSchema).default([]),
  demoVideoUrl: safeUrlSchema.default(''),
  shortDesc: z.string().trim().max(500, 'Short description cannot exceed 500 characters'),
  problemSolved: z.string().trim().max(1000).default(''),
  features: z.array(z.string().trim().max(300)).max(20).default([]),
  techStack: z.array(z.string().trim().max(50)).max(30).default([]),
  githubUrl: safeUrlSchema.default(''),
  liveUrl: safeUrlSchema.default(''),
  accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be valid hex color').default('#e68a2e'),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0),
});

// 4. Mission Schema
export const missionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(180),
  slug: safeSlugSchema,
  type: z.enum(['freelance', 'hackathon', 'internship', 'leadership']),
  category: z.string().trim().max(120).default('Missions'),
  organization: z.string().trim().max(200).default(''),
  role: z.string().trim().max(150).default(''),
  status: z.string().trim().max(100).default('Completed'),
  liveUrl: safeUrlSchema.default(''),
  thumbnail: safeUrlSchema.default(''),
  startDate: z.string().trim().max(50).optional().nullable(),
  endDate: z.string().trim().max(50).optional().nullable(),
  availableFrom: z
    .string()
    .trim()
    .refine((v) => !v || Number.isFinite(Date.parse(v)), 'Invalid availability date')
    .optional()
    .nullable(),
  description: z.string().trim().max(5000).default(''),
  technologies: z.array(z.string().trim().max(100)).max(50).default([]),
  certificates: z.array(safeUrlSchema).default([]),
  caseStudy: z
    .object({
      requirements: z.array(z.string().trim().max(2000)).max(40).default([]),
      responsibilities: z.array(z.string().trim().max(2000)).max(40).default([]),
      features: z.array(z.string().trim().max(2000)).max(40).default([]),
      deployment: z.string().trim().max(1000).default(''),
      challenges: z.array(z.string().trim().max(2000)).max(40).default([]),
      screenshots: z.array(safeUrlSchema).default([]),
    })
    .nullable()
    .optional(),
  events: z
    .array(
      z.object({
        id: z.string().max(80),
        title: z.string().max(180).default(''),
        organiser: z.string().max(180).default(''),
        date: z.string().max(60).default(''),
        duration: z.string().max(100).default(''),
        team: z.string().max(200).default(''),
        project: z.string().max(180).default(''),
        technologies: z.array(z.string().max(100)).default([]),
        achievement: z.string().max(300).default(''),
        certificates: z.array(safeUrlSchema).default([]),
        visible: z.boolean().default(true),
        order: z.number().int().default(0),
      })
    )
    .default([]),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0),
});

// Middleware generator that validates req.body against a Zod schema
export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = Array.isArray(error.issues)
        ? error.issues
        : Array.isArray(error.errors)
          ? error.errors
          : [];
      const errors = issues.map((e) => ({
        field: Array.isArray(e.path) ? e.path.join('.') : '',
        message: e.message,
      }));
      const summary = errors
        .slice(0, 3)
        .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
        .join('; ');
      return res.status(400).json({
        success: false,
        message: summary ? `Input validation failed — ${summary}` : 'Input validation failed',
        errors,
      });
    }
    next(error);
  }
};

