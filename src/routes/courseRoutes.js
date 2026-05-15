const express = require('express');
const router = express.Router();
const { getCourses, getCourseBySlug, syncCourses } = require('../controllers/courseController');

router.route('/').get(getCourses);
router.route('/sync').post(syncCourses);
router.route('/:slug').get(getCourseBySlug);

module.exports = router;
