const crypto = require('crypto');
const {
  Course,
  CourseModule,
  Unit,
  UnitFile,
  Enrollment,
  UnitProgress,
  Certificate,
  User,
  UserProfile,
  Department,
} = require('../models');
const { sendCertificateIssuedEmail, getCertificateEmailTemplate } = require('../utils/mailer');

// Helper to generate Unique Credential ID
const generateCredentialId = () => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `JK-${year}-${randomHex}`;
};

// Helper to generate SHA-256 Verification Hash
const generateVerificationHash = (userId, courseId, credentialId) => {
  const secret = process.env.JWT_SECRET || 'jonikwiria_academic_secret';
  return crypto.createHmac('sha256', secret)
    .update(`${userId}_${courseId}_${credentialId}_${Date.now()}`)
    .digest('hex');
};

/**
 * Enroll student into a course (Free instant enrollment)
 */
exports.enroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { userId, courseId },
      defaults: {
        userId,
        courseId,
        status: 'enrolled',
        progressPercentage: 0,
        enrolledAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: created ? 'Enrolled successfully' : 'Already enrolled in this course',
      data: enrollment,
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return res.status(500).json({ success: false, error: 'Failed to enroll in course' });
  }
};

/**
 * Get student's learning dashboard overview (Active courses, Progress %, Certificates)
 */
exports.getMyLearning = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            { model: Department, as: 'department', attributes: ['id', 'name'] },
            {
              model: CourseModule,
              as: 'modules',
              include: [{ model: Unit, as: 'units', attributes: ['id'] }],
            },
          ],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });

    const certificates = await Certificate.findAll({
      where: { userId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'slug'] }],
      order: [['issueDate', 'DESC']],
    });

    const totalEnrolled = enrollments.length;
    const completedCount = enrollments.filter(e => e.status === 'completed' || e.progressPercentage === 100).length;
    const inProgressCount = totalEnrolled - completedCount;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEnrolled,
          completedCount,
          inProgressCount,
          certificatesEarned: certificates.length,
        },
        enrollments,
        certificates,
      },
    });
  } catch (error) {
    console.error('Error fetching student learning dashboard:', error);
    return res.status(500).json({ success: false, error: 'Failed to load learning data' });
  }
};

/**
 * Get Course Learning Player Data (Great Learning Phased Sequential Progression)
 */
exports.getCoursePlayer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseIdOrSlug } = req.params;

    // Lookup course by ID or Slug
    let course = null;
    if (!isNaN(courseIdOrSlug)) {
      course = await Course.findByPk(courseIdOrSlug, {
        include: [
          { model: Department, as: 'department', attributes: ['id', 'name'] },
          {
            model: CourseModule,
            as: 'modules',
            include: [
              {
                model: Unit,
                as: 'units',
                include: [{ model: UnitFile, as: 'files' }],
              },
            ],
          },
        ],
      });
    }

    if (!course) {
      course = await Course.findOne({
        where: { slug: courseIdOrSlug },
        include: [
          { model: Department, as: 'department', attributes: ['id', 'name'] },
          {
            model: CourseModule,
            as: 'modules',
            include: [
              {
                model: Unit,
                as: 'units',
                include: [{ model: UnitFile, as: 'files' }],
              },
            ],
          },
        ],
      });
    }

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Auto-enroll user if not yet enrolled (Free course access)
    const [enrollment] = await Enrollment.findOrCreate({
      where: { userId, courseId: course.id },
      defaults: {
        userId,
        courseId: course.id,
        status: 'in_progress',
        progressPercentage: 0,
        enrolledAt: new Date(),
      },
    });

    // Fetch all progress records by this user in this course
    const allProgressRecords = await UnitProgress.findAll({
      where: { userId, courseId: course.id },
    });
    const progressMap = new Map();
    allProgressRecords.forEach(p => {
      progressMap.set(p.unitId, p);
    });

    // Sort modules and units by displayOrder
    const sortedModules = (course.modules || [])
      .sort((a, b) => (a.order !== undefined ? a.order : a.displayOrder || 0) - (b.order !== undefined ? b.order : b.displayOrder || 0))
      .map(mod => {
        const modJson = mod.toJSON ? mod.toJSON() : mod;
        const sortedUnits = (mod.units || [])
          .sort((a, b) => (a.order !== undefined ? a.order : a.displayOrder || 0) - (b.order !== undefined ? b.order : b.displayOrder || 0))
          .map(u => (u.toJSON ? u.toJSON() : u));
        return {
          ...modJson,
          units: sortedUnits,
        };
      });

    // Flatten all units in sequential order to apply step locks
    const allSequentialUnits = [];
    sortedModules.forEach(mod => {
      (mod.units || []).forEach(unit => {
        allSequentialUnits.push(unit);
      });
    });

    const totalUnitsCount = allSequentialUnits.length;
    let completedCount = 0;
    let totalScoreSum = 0;
    let unlockedPrevious = true; // First unit is always unlocked

    // Process sequential locks and user progress for each unit
    const processedModules = sortedModules.map(mod => {
      const units = mod.units.map(unit => {
        const uProg = progressMap.get(unit.id);
        const isCompleted = uProg?.status === 'completed';
        if (isCompleted) {
          completedCount++;
          totalScoreSum += (uProg.score || 0);
        }

        const isLocked = !unlockedPrevious;
        unlockedPrevious = isCompleted;

        return {
          ...unit,
          isCompleted,
          isLocked,
          userScore: uProg ? uProg.score : null,
          watched: uProg ? uProg.watched : false,
          passingScore: unit.passingScore || 70,
          exerciseData: unit.exerciseData || null,
        };
      });

      return {
        ...mod,
        units,
      };
    });

    const progressPercentage = totalUnitsCount > 0 ? Math.round((completedCount / totalUnitsCount) * 100) : 0;
    const currentAverageScore = completedCount > 0 ? Math.round(totalScoreSum / completedCount) : 0;

    // Check certificate if completed
    let certificate = null;
    if (progressPercentage === 100) {
      const certDoc = await Certificate.findOne({
        where: { userId, courseId: course.id },
      });
      certificate = certDoc ? (certDoc.toJSON ? certDoc.toJSON() : certDoc) : null;
    }

    const deptJson = course.department ? (course.department.toJSON ? course.department.toJSON() : course.department) : null;
    const enrollJson = enrollment ? (enrollment.toJSON ? enrollment.toJSON() : enrollment) : null;

    return res.status(200).json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          level: course.level,
          duration: course.duration,
          department: deptJson ? { id: deptJson.id, name: deptJson.name } : null,
        },
        enrollment: enrollJson,
        modules: processedModules,
        totalUnits: totalUnitsCount,
        completedUnits: completedCount,
        progressPercentage,
        currentAverageScore,
        certificate,
      },
    });
  } catch (error) {
    console.error('Error loading course player:', error);
    return res.status(500).json({ success: false, error: 'Failed to load course player', details: error.message });
  }
};

/**
 * Complete a Unit Phase with Automatic Exercise Scoring & Certificate of Participation Awarding
 */
exports.completeUnit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unitId } = req.params;
    const { exerciseAnswers, score: passedScore, watched } = req.body || {};

    const unit = await Unit.findByPk(unitId, {
      include: [
        {
          model: CourseModule,
          as: 'module',
          include: [
            {
              model: Course,
              as: 'course',
              include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }]
            }
          ],
        },
      ],
    });

    if (!unit || !unit.module || !unit.module.course) {
      return res.status(404).json({ success: false, error: 'Unit or associated course not found' });
    }

    const course = unit.module.course;
    const courseId = course.id;

    // Fetch full course with sequential units
    const fullCourse = await Course.findByPk(courseId, {
      include: [
        {
          model: CourseModule,
          as: 'modules',
          include: [{ model: Unit, as: 'units' }],
        },
      ],
    });

    const sortedModules = (fullCourse.modules || []).sort((a, b) => (a.order !== undefined ? a.order : a.displayOrder || 0) - (b.order !== undefined ? b.order : b.displayOrder || 0));
    const allSequentialUnits = [];
    sortedModules.forEach(mod => {
      const units = (mod.units || []).sort((a, b) => (a.order !== undefined ? a.order : a.displayOrder || 0) - (b.order !== undefined ? b.order : b.displayOrder || 0));
      units.forEach(u => allSequentialUnits.push(u));
    });

    const currentUnitIndex = allSequentialUnits.findIndex(u => u.id === parseInt(unitId, 10));
    if (currentUnitIndex === -1) {
      return res.status(400).json({ success: false, error: 'Unit is not part of this course curriculum' });
    }

    // Sequential Rule: If not first unit, check if previous unit is completed
    if (currentUnitIndex > 0) {
      const previousUnit = allSequentialUnits[currentUnitIndex - 1];
      const prevCompleted = await UnitProgress.findOne({
        where: { userId, unitId: previousUnit.id, status: 'completed' },
      });
      if (!prevCompleted) {
        return res.status(403).json({
          success: false,
          error: 'Sequential phase locked: You must complete the previous phase/unit before progressing.',
        });
      }
    }

    // Automated Exercise Scoring
    const passingThreshold = unit.passingScore || 70;
    let computedScore = 100;

    const questions = Array.isArray(unit.exerciseData) ? unit.exerciseData : [];
    if (questions.length > 0) {
      if (exerciseAnswers && typeof exerciseAnswers === 'object') {
        let correctCount = 0;
        questions.forEach((q, idx) => {
          const expectedAnswer = q.correctIndex !== undefined ? q.correctIndex : q.correct;
          if (Number(exerciseAnswers[idx]) === Number(expectedAnswer)) {
            correctCount++;
          }
        });
        computedScore = Math.round((correctCount / questions.length) * 100);
      } else if (passedScore !== undefined) {
        computedScore = parseInt(passedScore, 10);
      } else {
        computedScore = 0;
      }
    } else if (passedScore !== undefined) {
      computedScore = parseInt(passedScore, 10);
    }

    // Validate score against passing threshold
    if (questions.length > 0 && computedScore < passingThreshold) {
      return res.status(400).json({
        success: false,
        passed: false,
        score: computedScore,
        passingThreshold,
        error: `Your score (${computedScore}%) is below the passing requirement of ${passingThreshold}%. Please review the unit and try the exercise again.`,
      });
    }

    // Record or update unit completion
    const [progress, created] = await UnitProgress.findOrCreate({
      where: { userId, unitId: unit.id },
      defaults: {
        userId,
        unitId: unit.id,
        courseId,
        status: 'completed',
        score: computedScore,
        watched: watched !== undefined ? Boolean(watched) : true,
        exerciseAnswers: exerciseAnswers || null,
        completedAt: new Date(),
      },
    });

    if (!created) {
      progress.status = 'completed';
      progress.score = Math.max(progress.score || 0, computedScore);
      if (watched !== undefined) progress.watched = Boolean(watched);
      if (exerciseAnswers) progress.exerciseAnswers = exerciseAnswers;
      progress.completedAt = new Date();
      await progress.save();
    }

    // Calculate updated course progress percentage and average cumulative score
    const completedProgressList = await UnitProgress.findAll({
      where: { userId, courseId, status: 'completed' },
    });

    const totalUnitsCount = allSequentialUnits.length;
    const completedUnitsCount = completedProgressList.length;
    const progressPercentage = totalUnitsCount > 0 ? Math.min(100, Math.round((completedUnitsCount / totalUnitsCount) * 100)) : 100;

    const cumulativeScore = completedUnitsCount > 0
      ? Math.round(completedProgressList.reduce((sum, p) => sum + (p.score || 0), 0) / completedUnitsCount)
      : computedScore;

    const isCourseCompleted = progressPercentage >= 100 && cumulativeScore >= 70;

    // Update Enrollment status and finalScore
    const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
    if (enrollment) {
      enrollment.progressPercentage = progressPercentage;
      enrollment.finalScore = cumulativeScore;
      if (isCourseCompleted) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      } else {
        enrollment.status = 'in_progress';
      }
      await enrollment.save();
    }

    // Generate Official Certificate of Participation automatically when course is fully completed
    let certificate = null;
    if (isCourseCompleted) {
      const user = await User.findByPk(userId, {
        include: [{ model: UserProfile, as: 'profile' }],
      });

      const studentName = user?.profile
        ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
        : (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Distinguished Participant');

      const credentialId = generateCredentialId();
      const verificationHash = generateVerificationHash(userId, courseId, credentialId);

      // Determine Distinction Grade
      let distinction = 'Pass';
      if (cumulativeScore >= 90) distinction = 'Honors with Distinction';
      else if (cumulativeScore >= 80) distinction = 'Merit';

      const [cert] = await Certificate.findOrCreate({
        where: { userId, courseId },
        defaults: {
          userId,
          courseId,
          credentialId,
          verificationHash,
          recipientName: studentName || 'Distinguished Participant',
          courseTitle: course.title,
          issueDate: new Date(),
          status: 'issued',
          metadata: {
            certificateType: 'Certificate of Participation',
            finalScore: cumulativeScore,
            distinction,
            department: course.department?.name || 'Department of Technology',
            duration: course.duration || 'Comprehensive Track',
            level: course.level || 'Advanced',
            totalUnits: totalUnitsCount,
            institution: 'JONIKWIRIA Academy of Technology',
            directorSignature: 'Dr. Jonathan Kwiria, Academic Director',
          },
        },
      });

      // Update metadata if cert already existed
      if (cert) {
        cert.metadata = {
          certificateType: 'Certificate of Participation',
          finalScore: cumulativeScore,
          distinction,
          department: course.department?.name || 'Department of Technology',
          duration: course.duration || 'Comprehensive Track',
          level: course.level || 'Advanced',
          totalUnits: totalUnitsCount,
          institution: 'JONIKWIRIA Academy of Technology',
          directorSignature: 'Dr. Jonathan Kwiria, Academic Director',
        };
        await cert.save();
      }

      certificate = cert;

      // Automatically dispatch official completion certificate email with QR code & verification link
      if (user && user.email) {
        sendCertificateIssuedEmail(user, cert, course).catch(err => {
          console.error('[StudentController] Error sending certificate email:', err.message);
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: isCourseCompleted
        ? 'Congratulations! You have completed all course modules and earned your official JONIKWIRIA Certificate of Participation!'
        : 'Unit phase passed successfully! Next unit unlocked.',
      data: {
        completedUnitId: unit.id,
        unitScore: computedScore,
        progressPercentage,
        completedUnits: completedUnitsCount,
        totalUnits: totalUnitsCount,
        currentAverageScore: cumulativeScore,
        isCourseCompleted,
        certificate: certificate ? (certificate.toJSON ? certificate.toJSON() : certificate) : null,
      },
    });
  } catch (error) {
    console.error('Error completing unit:', error);
    return res.status(500).json({ success: false, error: 'Failed to complete unit phase' });
  }
};

/**
 * Get all earned certificates for student
 */
exports.getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'slug', 'level', 'duration'],
        },
      ],
      order: [['issueDate', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return res.status(500).json({ success: false, error: 'Failed to load certificates' });
  }
};

/**
 * Public Certificate Verification Endpoint (Verify by Credential ID or Hash)
 */
exports.verifyCertificate = async (req, res) => {
  try {
    const { identifier } = req.params;

    const certificate = await Certificate.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { credentialId: identifier },
          { verificationHash: identifier },
        ],
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'slug', 'level', 'duration', 'description'],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or unrecognized certificate identifier. No verified credential was found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        isValid: certificate.status === 'issued',
        credentialId: certificate.credentialId,
        verificationHash: certificate.verificationHash,
        recipientName: certificate.recipientName,
        courseTitle: certificate.courseTitle,
        issueDate: certificate.issueDate,
        status: certificate.status,
        metadata: certificate.metadata,
        course: certificate.course,
      },
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify credential' });
  }
};

/**
 * Preview Certificate Email Template (renders directly in browser as HTML or JSON)
 */
exports.previewCertificateEmail = async (req, res) => {
  try {
    const { identifier } = req.params;
    let certificate = null;

    if (identifier && identifier !== 'sample') {
      certificate = await Certificate.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { credentialId: identifier },
            { id: isNaN(identifier) ? 0 : parseInt(identifier, 10) }
          ]
        },
        include: [{ model: Course, as: 'course' }, { model: User, as: 'user' }]
      });
    }

    const studentName = certificate ? certificate.recipientName : (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Alex Johnson');
    const courseTitle = certificate ? certificate.courseTitle : 'Full-Stack Software Engineering & Artificial Intelligence';
    const credentialId = certificate ? certificate.credentialId : 'JKW-2026-X8F9A2';
    const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const verificationUrl = `${baseUrl}/verify/${credentialId}`;
    const certificateViewUrl = `${baseUrl}/certificates/view/${certificate ? certificate.courseId : '1'}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(verificationUrl)}`;

    const issueDateFormatted = new Date(certificate ? certificate.issueDate : Date.now()).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const distinction = certificate?.metadata?.distinction || 'Honors with Distinction';
    const score = certificate?.metadata?.finalScore || 96;

    const html = getCertificateEmailTemplate({
      studentName,
      courseTitle,
      credentialId,
      issueDateFormatted,
      distinction,
      score,
      verificationUrl,
      certificateViewUrl,
      qrCodeUrl
    });

    if (req.query.json === 'true') {
      return res.status(200).json({ success: true, html });
    }

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error('Error previewing certificate email:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate email preview' });
  }
};

/**
 * Resend Certificate Completion Email to student
 */
exports.resendCertificateEmail = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;

    const certificate = await Certificate.findByPk(certificateId, {
      include: [
        { model: Course, as: 'course' },
        { model: User, as: 'user' }
      ]
    });

    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found.' });
    }

    // Security: Only certificate owner or admin can resend
    if (certificate.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to resend this certificate email.' });
    }

    const recipient = certificate.user || req.user;
    await sendCertificateIssuedEmail(recipient, certificate, certificate.course);

    return res.status(200).json({
      success: true,
      message: `Official certificate email successfully dispatched to ${recipient.email}.`
    });
  } catch (error) {
    console.error('Error resending certificate email:', error);
    return res.status(500).json({ success: false, error: 'Failed to resend certificate email.' });
  }
};

