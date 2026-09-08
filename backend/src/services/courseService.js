const { Op } = require('sequelize');
const { Course, Department, CourseModule, Unit, UnitFile, Enrollment, CourseReview } = require('../models');

class CourseService {
  async createCourse(data) {
    try {
      return await Course.create(data);
    } catch (error) {
      throw new Error(`Error creating course: ${error.message}`);
    }
  }

  async _attachCourseStats(course) {
    if (!course) return null;
    const courseJson = typeof course.toJSON === 'function' ? course.toJSON() : course;
    
    // 1. Enrollment count from database
    courseJson.enrollmentCount = await Enrollment.count({ where: { courseId: courseJson.id } });

    // 2. Reviews from database
    const reviews = courseJson.reviews || await CourseReview.findAll({
      where: { courseId: courseJson.id, status: 'approved' },
      order: [['createdAt', 'DESC']]
    });
    
    courseJson.reviews = reviews;
    courseJson.ratingsCount = reviews.length;
    
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      courseJson.averageRating = Number((sum / reviews.length).toFixed(1));
      
      const breakdown = [5, 4, 3, 2, 1].map(stars => {
        const count = reviews.filter(r => Math.round(Number(r.rating)) === stars).length;
        return {
          stars,
          count,
          pct: Math.round((count / reviews.length) * 100)
        };
      });
      courseJson.ratingBreakdown = breakdown;
    } else {
      courseJson.averageRating = 0;
      courseJson.ratingBreakdown = [
        { stars: 5, count: 0, pct: 0 },
        { stars: 4, count: 0, pct: 0 },
        { stars: 3, count: 0, pct: 0 },
        { stars: 2, count: 0, pct: 0 },
        { stars: 1, count: 0, pct: 0 }
      ];
    }

    // 3. Computed counts from modules and units in database
    const modules = courseJson.modules || [];
    let videoCount = 0;
    let fileCount = 0;
    let unitCount = 0;

    modules.forEach(m => {
      (m.units || []).forEach(u => {
        unitCount++;
        if (u.videoUrl) videoCount++;
        fileCount += (u.files || []).length;
      });
    });

    courseJson.modulesCount = modules.length;
    courseJson.unitsCount = unitCount;
    courseJson.videoLessonsCount = videoCount;
    courseJson.filesCount = fileCount;

    return courseJson;
  }

  async getCourseById(id) {
    try {
      const course = await Course.findByPk(id, {
        include: [
          { model: Department, as: 'department' },
          {
            model: CourseReview,
            as: 'reviews',
            where: { status: 'approved' },
            required: false
          },
          {
            model: CourseModule,
            as: 'modules',
            include: [
              {
                model: Unit,
                as: 'units',
                include: [
                  { model: UnitFile, as: 'files' }
                ]
              }
            ]
          }
        ],
        order: [
          [{ model: CourseModule, as: 'modules' }, 'order', 'ASC'],
          [{ model: CourseModule, as: 'modules' }, { model: Unit, as: 'units' }, 'order', 'ASC'],
          [{ model: CourseReview, as: 'reviews' }, 'createdAt', 'DESC']
        ]
      });
      if (!course) throw new Error(`Course with ID ${id} not found`);
      return await this._attachCourseStats(course);
    } catch (error) {
      throw new Error(`Error fetching course: ${error.message}`);
    }
  }

  async getCourseBySlug(slug) {
    try {
      const isNumeric = !isNaN(slug) && !isNaN(parseFloat(slug));
      const whereClause = isNumeric
        ? { [Op.or]: [{ slug }, { id: parseInt(slug, 10) }] }
        : { slug };

      const course = await Course.findOne({
        where: whereClause,
        include: [
          { model: Department, as: 'department' },
          {
            model: CourseReview,
            as: 'reviews',
            where: { status: 'approved' },
            required: false
          },
          {
            model: CourseModule,
            as: 'modules',
            where: { [Op.or]: [{ status: 'active' }, { status: null }] },
            required: false,
            include: [
              {
                model: Unit,
                as: 'units',
                where: { [Op.or]: [{ status: 'active' }, { status: null }] },
                required: false,
                include: [
                  {
                    model: UnitFile,
                    as: 'files',
                    where: { [Op.or]: [{ status: 'active' }, { status: null }] },
                    required: false
                  }
                ]
              }
            ]
          }
        ],
        order: [
          [{ model: CourseModule, as: 'modules' }, 'order', 'ASC'],
          [{ model: CourseModule, as: 'modules' }, { model: Unit, as: 'units' }, 'order', 'ASC'],
          [{ model: CourseReview, as: 'reviews' }, 'createdAt', 'DESC']
        ]
      });
      if (!course) throw new Error(`Course with slug '${slug}' not found`);
      return await this._attachCourseStats(course);
    } catch (error) {
      throw new Error(`Error fetching course: ${error.message}`);
    }
  }

  async getAllCourses({ page = 1, limit = 10, search = '', status, departmentId, level } = {}) {
    try {
      const parsedPage = parseInt(page, 10) || 1;
      const parsedLimit = parseInt(limit, 10) || 10;
      const offset = (parsedPage - 1) * parsedLimit;

      const whereClause = {};
      if (search) whereClause.title = { [Op.like]: `%${search}%` };
      if (status) whereClause.status = status;
      if (departmentId) whereClause.departmentId = departmentId;
      if (level) whereClause.level = level;

      const { count, rows } = await Course.findAndCountAll({
        where: whereClause,
        include: [
          { model: Department, as: 'department', attributes: ['id', 'name', 'slug'] },
          {
            model: CourseModule,
            as: 'modules',
            attributes: ['id', 'title'],
            include: [{ model: Unit, as: 'units', attributes: ['id', 'title', 'videoUrl'] }]
          }
        ],
        limit: parsedLimit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const coursesWithStats = await Promise.all(rows.map(c => this._attachCourseStats(c)));

      return {
        totalItems: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        courses: coursesWithStats
      };
    } catch (error) {
      throw new Error(`Error fetching courses: ${error.message}`);
    }
  }

  async getActiveCourses({ limit = 12, departmentId, level, search } = {}) {
    try {
      const whereClause = { status: 'active' };
      if (departmentId) whereClause.departmentId = departmentId;
      if (level) whereClause.level = level;
      if (search) whereClause.title = { [Op.like]: `%${search}%` };

      const courses = await Course.findAll({
        where: whereClause,
        include: [
          { model: Department, as: 'department', attributes: ['id', 'name', 'slug'] },
          {
            model: CourseModule,
            as: 'modules',
            attributes: ['id', 'title'],
            include: [{ model: Unit, as: 'units', attributes: ['id', 'title', 'videoUrl'] }]
          }
        ],
        limit: parseInt(limit, 10) || 12,
        order: [['createdAt', 'DESC']]
      });

      return await Promise.all(courses.map(c => this._attachCourseStats(c)));
    } catch (error) {
      throw new Error(`Error fetching active courses: ${error.message}`);
    }
  }

  async addReview(courseId, data) {
    try {
      const course = await Course.findByPk(courseId);
      if (!course) throw new Error('Course not found');
      return await CourseReview.create({
        courseId,
        userId: data.userId || null,
        reviewerName: data.reviewerName || 'Anonymous Student',
        reviewerRole: data.reviewerRole || 'Verified Student',
        reviewerAvatar: data.reviewerAvatar || null,
        rating: Math.max(1, Math.min(5, parseInt(data.rating, 10) || 5)),
        comment: data.comment,
        status: 'approved'
      });
    } catch (error) {
      throw new Error(`Error adding review: ${error.message}`);
    }
  }

  async getReviews(courseId) {
    try {
      return await CourseReview.findAll({
        where: { courseId, status: 'approved' },
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      throw new Error(`Error fetching reviews: ${error.message}`);
    }
  }

  async updateCourse(id, data) {
    try {
      const course = await Course.findByPk(id);
      if (!course) throw new Error(`Course with ID ${id} not found`);
      return await course.update(data);
    } catch (error) {
      throw new Error(`Error updating course: ${error.message}`);
    }
  }

  async deleteCourse(id) {
    try {
      const course = await Course.findByPk(id);
      if (!course) throw new Error(`Course with ID ${id} not found`);
      await course.destroy();
      return { message: `Course '${course.title}' deleted successfully` };
    } catch (error) {
      throw new Error(`Error deleting course: ${error.message}`);
    }
  }

  async bulkDeleteCourses(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0)
        throw new Error('An array of ids must be provided for bulk deletion');
      const deletedCount = await Course.destroy({ where: { id: { [Op.in]: ids } } });
      return { message: `${deletedCount} course(s) deleted successfully`, deletedCount };
    } catch (error) {
      throw new Error(`Error performing bulk delete: ${error.message}`);
    }
  }
}

module.exports = new CourseService();
