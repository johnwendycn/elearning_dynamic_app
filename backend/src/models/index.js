const sequelize = require('../config/database');
const OrganizationSetting = require('./organizationSetting');
const Media = require('./media');
const Role = require('./role');
const User = require('./user');
const UserProfile = require('./userProfile');
const UserRole = require('./userRole');
const Module = require('./module');
const RoleModule = require('./roleModule');
const UserModulePermission = require('./userModulePermission');
const Header = require('./header');
const Menu = require('./menu');
const AuditTrail = require('./auditTrail');
const Carousel = require('./carousel');
const CarouselSlide = require('./carouselSlide');
const Page = require('./page');
const Footer = require('./footer');
const Subscriber = require('./subscriber');
const NewsComment = require('./newsComment');
const ContactMessage = require('./contactMessage');

// Organization & Media Associations
OrganizationSetting.belongsTo(Media, { as: 'logoMedia', foreignKey: 'logoMediaId' });
OrganizationSetting.belongsTo(Media, { as: 'faviconMedia', foreignKey: 'faviconMediaId' });
Media.hasMany(OrganizationSetting, { foreignKey: 'logoMediaId' });
Media.hasMany(OrganizationSetting, { foreignKey: 'faviconMediaId' });

// Header & Media/Menu Associations
Header.belongsTo(Media, { as: 'logoMedia', foreignKey: 'logoMediaId' });
Header.belongsTo(Menu, { as: 'menu', foreignKey: 'menuId' });
Media.hasMany(Header, { foreignKey: 'logoMediaId' });
Menu.hasMany(Header, { foreignKey: 'menuId' });

// Footer & Menu Associations
Footer.belongsTo(Menu, { as: 'column1Menu', foreignKey: 'column1_menu_id' });
Footer.belongsTo(Menu, { as: 'column2Menu', foreignKey: 'column2_menu_id' });
Footer.belongsTo(Menu, { as: 'column3Menu', foreignKey: 'column3_menu_id' });

// User & Profile Associations (1:1)
User.hasOne(UserProfile, { as: 'profile', foreignKey: 'userId', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

// User & Role Associations (N:M via UserRole)
User.belongsToMany(Role, { through: UserRole, as: 'roles', foreignKey: 'userId', otherKey: 'roleId' });
Role.belongsToMany(User, { through: UserRole, as: 'users', foreignKey: 'roleId', otherKey: 'userId' });

User.hasMany(UserRole, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserRole.belongsTo(User, { foreignKey: 'userId' });

Role.hasMany(UserRole, { foreignKey: 'roleId', onDelete: 'CASCADE' });
UserRole.belongsTo(Role, { foreignKey: 'roleId' });

// Role & Module Associations (N:M via RoleModule)
Role.belongsToMany(Module, { through: RoleModule, as: 'modules', foreignKey: 'roleId', otherKey: 'moduleId' });
Module.belongsToMany(Role, { through: RoleModule, as: 'roles', foreignKey: 'moduleId', otherKey: 'roleId' });

Role.hasMany(RoleModule, { foreignKey: 'roleId', onDelete: 'CASCADE' });
RoleModule.belongsTo(Role, { foreignKey: 'roleId' });

Module.hasMany(RoleModule, { foreignKey: 'moduleId', onDelete: 'CASCADE' });
RoleModule.belongsTo(Module, { foreignKey: 'moduleId' });

// User & Module Granular Permissions / Overrides / Restrictions
User.hasMany(UserModulePermission, { as: 'customModulePermissions', foreignKey: 'userId', onDelete: 'CASCADE' });
UserModulePermission.belongsTo(User, { foreignKey: 'userId' });

Module.hasMany(UserModulePermission, { as: 'customUserPermissions', foreignKey: 'moduleId', onDelete: 'CASCADE' });
UserModulePermission.belongsTo(Module, { foreignKey: 'moduleId' });

// User & Media Associations
User.belongsTo(Media, { as: 'profilePicture', foreignKey: 'profilePicId' });
Media.hasMany(User, { foreignKey: 'profilePicId' });

// AuditTrail & User Associations
AuditTrail.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(AuditTrail, { as: 'auditLogs', foreignKey: 'userId' });

// Carousel & CarouselSlide & Media Associations
Carousel.hasMany(CarouselSlide, { as: 'slides', foreignKey: 'carouselId', onDelete: 'CASCADE' });
CarouselSlide.belongsTo(Carousel, { as: 'carousel', foreignKey: 'carouselId' });
CarouselSlide.belongsTo(Media, { as: 'media', foreignKey: 'mediaId' });
Media.hasMany(CarouselSlide, { foreignKey: 'mediaId' });

// Page Hierarchy & User Associations
Page.belongsTo(Page, { as: 'parent', foreignKey: 'parentId' });
Page.hasMany(Page, { as: 'children', foreignKey: 'parentId' });
Page.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Page.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });

// ─── Academic & Content Models ───────────────────────────────────────────────
const Department = require('./department');
const Course = require('./course');
const CourseModule = require('./courseModule');
const Unit = require('./unit');
const UnitFile = require('./unitFile');
const News = require('./news');
const Event = require('./event');
const Enrollment = require('./enrollment');
const UnitProgress = require('./unitProgress');
const Certificate = require('./certificate');
const EventRegistration = require('./eventRegistration');
const CourseReview = require('./courseReview');

// News Comments (self-referential for threading)
News.hasMany(NewsComment, { as: 'comments', foreignKey: 'newsId', onDelete: 'CASCADE' });
NewsComment.belongsTo(News, { foreignKey: 'newsId' });
NewsComment.hasMany(NewsComment, { as: 'replies', foreignKey: 'parentId', onDelete: 'CASCADE' });
NewsComment.belongsTo(NewsComment, { as: 'parent', foreignKey: 'parentId' });

// Course Reviews
Course.hasMany(CourseReview, { as: 'reviews', foreignKey: 'courseId', onDelete: 'CASCADE' });
CourseReview.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
User.hasMany(CourseReview, { as: 'courseReviews', foreignKey: 'userId', onDelete: 'SET NULL' });
CourseReview.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Department → Course (1:M)
Department.hasMany(Course, { as: 'courses', foreignKey: 'departmentId', onDelete: 'CASCADE' });
Course.belongsTo(Department, { as: 'department', foreignKey: 'departmentId' });

// Course → CourseModule (1:M)
Course.hasMany(CourseModule, { as: 'modules', foreignKey: 'courseId', onDelete: 'CASCADE' });
CourseModule.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

// CourseModule → Unit (1:M)
CourseModule.hasMany(Unit, { as: 'units', foreignKey: 'moduleId', onDelete: 'CASCADE' });
Unit.belongsTo(CourseModule, { as: 'module', foreignKey: 'moduleId' });

// Unit → UnitFile (1:M)
Unit.hasMany(UnitFile, { as: 'files', foreignKey: 'unitId', onDelete: 'CASCADE' });
UnitFile.belongsTo(Unit, { as: 'unit', foreignKey: 'unitId' });

// ─── Student Learning & LMS Associations ──────────────────────────────────────
// User ↔ Course (Enrollments)
User.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'userId', onDelete: 'CASCADE' });
Enrollment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Course.hasMany(Enrollment, { as: 'enrollments', foreignKey: 'courseId', onDelete: 'CASCADE' });
Enrollment.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

// User ↔ UnitProgress
User.hasMany(UnitProgress, { as: 'unitProgresses', foreignKey: 'userId', onDelete: 'CASCADE' });
UnitProgress.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Unit.hasMany(UnitProgress, { as: 'unitProgresses', foreignKey: 'unitId', onDelete: 'CASCADE' });
UnitProgress.belongsTo(Unit, { as: 'unit', foreignKey: 'unitId' });
Course.hasMany(UnitProgress, { as: 'unitProgresses', foreignKey: 'courseId', onDelete: 'CASCADE' });
UnitProgress.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

// Event → EventRegistration (1:M)
Event.hasMany(EventRegistration, { as: 'registrations', foreignKey: 'eventId', onDelete: 'CASCADE' });
EventRegistration.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });

// User ↔ Certificate
User.hasMany(Certificate, { as: 'certificates', foreignKey: 'userId', onDelete: 'CASCADE' });
Certificate.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Course.hasMany(Certificate, { as: 'certificates', foreignKey: 'courseId', onDelete: 'CASCADE' });
Certificate.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

const db = {
  sequelize,
  Sequelize: sequelize.constructor,
  OrganizationSetting,
  Media,
  Role,
  User,
  UserProfile,
  UserRole,
  Module,
  RoleModule,
  UserModulePermission,
  Header,
  Footer,
  Menu,
  AuditTrail,
  Carousel,
  CarouselSlide,
  Page,
  // Academic & Content
  Department,
  Course,
  CourseModule,
  Unit,
  UnitFile,
  CourseReview,
  News,
  Event,
  EventRegistration,
  // LMS
  Enrollment,
  UnitProgress,
  Certificate,
  // Subscribers
  Subscriber,
  // Comments
  NewsComment,
  // Contact
  ContactMessage,
};

module.exports = db;
