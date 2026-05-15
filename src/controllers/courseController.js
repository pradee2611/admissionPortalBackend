const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const { syncCoursesFromSheet } = require('../services/googleSheetService');

// --- Auto-sync cache: re-sync from Google Sheets every 2 minutes ---
let lastSyncTime = 0;
const SYNC_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
let syncInProgress = false;

const autoSyncIfNeeded = async () => {
  const now = Date.now();
  if (now - lastSyncTime > SYNC_INTERVAL_MS && !syncInProgress) {
    syncInProgress = true;
    try {
      await syncCoursesFromSheet();
      lastSyncTime = Date.now();
      console.log('Auto-sync from Google Sheets completed');
    } catch (err) {
      console.error('Auto-sync failed:', err.message);
    } finally {
      syncInProgress = false;
    }
  }
};

// @desc    Fetch all courses (auto-syncs from Google Sheets)
// @route   GET /api/v1/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  // Sync from sheet if cache expired
  await autoSyncIfNeeded();

  const pageSize = 200;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Course.countDocuments({ ...keyword, isActive: true });
  const courses = await Course.find({ ...keyword, isActive: true })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ courses, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single course
// @route   GET /api/v1/courses/:slug
// @access  Public
const getCourseBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });

  if (course) {
    res.json(course);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// @desc    Force sync courses from Google Sheets (immediate)
// @route   POST /api/v1/courses/sync
// @access  Private/Admin
const syncCourses = asyncHandler(async (req, res) => {
  const result = await syncCoursesFromSheet();
  lastSyncTime = Date.now(); // Reset cache timer
  res.json({ message: 'Courses synced successfully', count: result.count });
});

module.exports = {
  getCourses,
  getCourseBySlug,
  syncCourses,
};
