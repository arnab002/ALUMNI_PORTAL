import express from 'express'
import cors from 'cors'
import session from 'express-session'
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import compression from 'compression';
import apicache from 'apicache-plus';
import swaggerDocs from './swagger.js';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeMongoConnection, initializeSessionStore, generateRandomString } from './middleware/mongodbMiddleware.js';
import { hppMiddleware, bruteforceMiddleware, requestIdMiddleware } from './middleware/securityMiddleware.js';
import departmentController from './controllers/departmentSection/departmentController.js';
import subjectController from './controllers/subjectSection/subjectController.js';
import studentController from './controllers/studentSection/studentController.js';
import facultyController from './controllers/facultySection/facultyController.js';
import staffController from './controllers/staffSection/staffController.js';
import eventCalendarController from './controllers/eventCalendarSection/eventCalendarController.js';
import eventBlogController from './controllers/eventBlogSection/eventBlogController.js';
import enquiryController from './controllers/enquirySection/enquiryController.js';
import bookController from './controllers/librarySection/bookSecion/bookController.js';
import issuedBookController from './controllers/librarySection/issuedBookSection/issuedBookController.js';
import attendanceController from './controllers/attendanceSection/attendanceController.js';
import timetableController from './controllers/timetableSection/timetableController.js';
import authController from './controllers/auth/authController.js';
import routesController from './controllers/protectedRoutes/routesController.js';
import bannersHome from './controllers/bannerSection/bannersHome.js';
import bannersHomeCSE from './controllers/bannerSection/bannersHomeCSE.js';
import bannersHomeECE from './controllers/bannerSection/bannersHomeECE.js';
import bannersHomeEEE from './controllers/bannerSection/bannersHomeEEE.js';
import bannersHomeCE from './controllers/bannerSection/bannersHomeCE.js';
import bannersHomeME from './controllers/bannerSection/bannersHomeME.js';
import bannersHomeMBA from './controllers/bannerSection/bannersHomeMBA.js';
import aboutHome from './controllers/aboutSection/aboutHome.js';
import aboutHomeCSE from './controllers/aboutSection/aboutHomeCSE.js';
import aboutHomeECE from './controllers/aboutSection/aboutHomeECE.js';
import aboutHomeEEE from './controllers/aboutSection/aboutHomeEEE.js';
import aboutHomeCE from './controllers/aboutSection/aboutHomeCE.js';
import aboutHomeME from './controllers/aboutSection/aboutHomeME.js';
import aboutHomeMBA from './controllers/aboutSection/aboutHomeMBA.js';
import courseController from './controllers/courseSection/courseController.js';
import testimonialController from './controllers/testimonialSection/testimonialController.js';
import achievementController from './controllers/achievementSection/achievementController.js';
import footerController from './controllers/footerSection/footerController.js';
import noticeController from './controllers/noticeSection/noticeController.js';
import materialController from './controllers/materialSection/materialController.js';
import galleryControllerCSE from './controllers/gallerySection/galleryControllerCSE.js';
import galleryControllerECE from './controllers/gallerySection/galleryControllerECE.js';
import galleryControllerEEE from './controllers/gallerySection/galleryControllerEEE.js';
import galleryControllerCE from './controllers/gallerySection/galleryControllerCE.js';
import galleryControllerME from './controllers/gallerySection/galleryControllerME.js';
import galleryControllerMBA from './controllers/gallerySection/galleryControllerMBA.js';
import faqControllerCSE from './controllers/faqSection/faqControllerCSE.js';
import faqControllerECE from './controllers/faqSection/faqControllerECE.js';
import faqControllerEEE from './controllers/faqSection/faqControllerEEE.js';
import faqControllerCE from './controllers/faqSection/faqControllerCE.js';
import faqControllerME from './controllers/faqSection/faqControllerME.js';
import faqControllerMBA from './controllers/faqSection/faqControllerMBA.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(mongoSanitize());
app.use(hppMiddleware);
app.use(bruteforceMiddleware.prevent);
app.use(requestIdMiddleware);
app.use(helmet());

let notifications = [];
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://portalalumni.netlify.app',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.emit('load-notifications', notifications);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

export { io , notifications};

app.use(cors({
  origin: "https://portalalumni.netlify.app",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const SESSION_SECRET = generateRandomString(32);
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const store = initializeSessionStore(MONGODB_URI);

app.set("trust proxy", 1);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    name: 'MernCollegeERP',
    cookie: {
      maxAge: 3600000,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    },
  })
);

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
  },
}));

app.use(compression({
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

const authenticateMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ authenticated: false, message: "Unauthorized" });
  }
  next();
};

const onlyStatus200 = (req, res) => res.statusCode === 200;
const cacheMiddleWare = apicache('30 seconds', onlyStatus200);

initializeMongoConnection(MONGODB_URI);

swaggerDocs(app, PORT);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 *
 * paths:
 *   /register:
 *     post:
 *       summary: Registering Users
 *       description: Registering Users
 *       tags: [🔒 Authentication APIs]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterUser'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         userid:
 *           type: string
 *           description: User's ID
 *         password:
 *           type: string
 *           description: User's Password
 *         role:
 *           type: string
 *           description: User's Role
 *         profile:
 *           type: string
 *           description: User's Profile Link
 *         department:
 *           type: string
 *           description: User's Department
 */
app.post('/register', authController.register);

/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 *
 * paths:
 *   /login:
 *     post:
 *       summary: Logging Users
 *       description: Logging Users
 *       tags: [🔒 Authentication APIs]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoggedInUser'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     LoggedInUser:
 *       type: object
 *       properties:
 *         userid:
 *           type: string
 *           description: User's ID
 *         password:
 *           type: string
 *           description: User's Password
 *         requestedRole:
 *           type: string
 *           description: User's Role
 */
app.post('/login', authController.login);

/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 * 
 * /checkauthentication:
 *   get:
 *     summary: Get Authentication data
 *     description: Get Authentication data from the endpoint
 *     tags: [🔒 Authentication APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.get("/checkauthentication", authenticateMiddleware, async (req, res) => {
  try {
    res.status(200).json({ success: true, authenticated: true, user: req.session.user });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 * /logout:
 *   post:
 *     summary: Execute Logout Operation
 *     description: Post Logout data from the endpoint
 *     tags: [🔒 Authentication APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.post('/logout', authController.logout);

/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 *
 * paths:
 *   /changepassword/:user:
 *     post:
 *       summary: Changing Password for an User
 *       description: Changing Password for an User
 *       tags: [🔒 Authentication APIs]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChangeUserPassword'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     ChangeUserPassword:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: User's ID
 *         newPassword:
 *           type: string
 *           description: User's New Password
 */
app.post('/changepassword/:user', authController.changepassword);

/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 *
 * paths:
 *   /forgotpassword:
 *     post:
 *       summary: Forgot Password Endpoint
 *       description: Forgot Password Endpoint
 *       tags: [🔒 Authentication APIs]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPassword'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     ForgotPassword:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's Email ID
 *         newPassword:
 *           type: string
 *           description: User's New Password
 */
app.post('/forgotpassword', authController.forgotpassword);

app.post('/sendotp', authController.sendotp);

app.post('/verifyotp', authController.verifyotp);

app.post('/sendCredentialsEmail', authController.sendCredentialsEmail);

/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 * 
 * /deleteUser/:id:
 *   post:
 *     summary: Deleting User
 *     description: Deleting Particular User using this endpoint
 *     tags: [🔒 Authentication APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.post('/deleteUser/:id', authController.deleteUser);

/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 * 
 * /getAuthenticatedUsers:
 *   get:
 *     summary: Get Authentication Users
 *     description: Get Authentication Users from the endpoint
 *     tags: [🔒 Authentication APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.get('/getAuthenticatedUsers', cacheMiddleWare, authController.AuthenticatedUsers);

/**
 * @swagger
 * tags:
 *   name: 🔒 Authentication APIs
 *   description: Endpoints for managing authenticated users
 *
 * paths:
 *   /getFilteredAuthenticatedUsers:
 *     post:
 *       summary: Retrieving Authenticated Users Data
 *       description: Retrieving Authenticated User Data from the endpoint
 *       tags: [🔒 Authentication APIs]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthenticatedUsers'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     AuthenticatedUsers:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         userid:
 *           type: string
 *           description: User's ID
 *         role:
 *           type: string
 *           description: User's Role
 *         department:
 *           type: string
 *           description: User's Department
 */
app.post("/getFilteredAuthenticatedUsers", authController.FilteredAuthenticatedUsers);


/**
 * @swagger
 * tags:
 *   name: 🔁 Protected Routes APIs
 *   description: Endpoints for managing protected routes
 * 
 * /adminRoutes:
 *   get:
 *     summary: Get Admin Authentication data
 *     description: Get Admin Authentication data from the endpoint
 *     tags: [🔁 Protected Routes APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.get('/adminRoutes', routesController.AdminRoutes);

/**
 * @swagger
 * tags:
 *   name: 🔁 Protected Routes APIs
 *   description: Endpoints for managing protected routes
 * 
 * /departmentRoutes:
 *   get:
 *     summary: Get Department Admin Authentication data
 *     description: Get Department Admin Authentication data from the endpoint
 *     tags: [🔁 Protected Routes APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.get('/departmentRoutes', routesController.DepartmentRoutes);

/**
 * @swagger
 * tags:
 *   name: 🔁 Protected Routes APIs
 *   description: Endpoints for managing protected routes
 * 
 * /facultyRoutes:
 *   get:
 *     summary: Get Faculty Authentication data
 *     description: Get Faculty Authentication data from the endpoint
 *     tags: [🔁 Protected Routes APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.get('/facultyRoutes', routesController.FacultyRoutes);

/**
 * @swagger
 * tags:
 *   name: 🔁 Protected Routes APIs
 *   description: Endpoints for managing protected routes
 * 
 * /studentRoutes:
 *   get:
 *     summary: Get Student Authentication data
 *     description: Get Student Authentication data from the endpoint
 *     tags: [🔁 Protected Routes APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.get('/studentRoutes', routesController.StudentRoutes);

/**
 * @swagger
 * tags:
 *   name: 🔁 Protected Routes APIs
 *   description: Endpoints for managing protected routes
 * 
 * /librarianRoutes:
 *   get:
 *     summary: Get Librarian Authentication data
 *     description: Get Librarian Authentication data from the endpoint
 *     tags: [🔁 Protected Routes APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.get('/librarianRoutes', routesController.LibrarianRoutes);

/**
 * @swagger
 * tags:
 *   name: 🔁 Protected Routes APIs
 *   description: Endpoints for managing protected routes
 * 
 * /libraryMemberRoutes:
 *   get:
 *     summary: Get Library Member Authentication data
 *     description: Get Library Member Authentication data from the endpoint
 *     tags: [🔁 Protected Routes APIs]
 *     responses:
 *       '200':
 *           description: Successful response
 *       '401':
 *           description: Unauthorized
 *       '500':
 *           description: Internal Server Error
 */
app.get('/libraryMemberRoutes', routesController.LibraryMemberRoutes);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page Banners Section
 *      description: APIs related to Home Page Banners
 *
 * paths:
 *   /addbannerdetails:
 *     post:
 *       summary: Home Page Banners Addition
 *       description: Adding Banners to the Home Page Banner Section 
 *       tags: [Home Page Banners Section]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BannerHomePage'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     BannerHomePage:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Banner Title
 *         description:
 *           type: string
 *           description: Banner Description
 *         backgroundImage:
 *           type: string
 *           description: Banner Background Image
 */
app.post("/addbannerdetails", bannersHome.AddBanner);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page Banners Section
 *      description: APIs related to Home Page Banners
 *
 * paths:
 *   /getbannerdetails:
 *     get:
 *       summary: Retrieving Home Page Banners
 *       description: Retrieving Home Page Banners Using this API 
 *       tags: [Home Page Banners Section]
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 */
app.get('/getbannerdetails', cacheMiddleWare, bannersHome.BannersDetails);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page Banners Section
 *      description: APIs related to Home Page Banners
 *
 * paths:
 *   /getSingleBannerDetails/:id:
 *     get:
 *       summary: Retrieving Single Home Page Banner
 *       description: Retrieving Single Home Page Banner Using this API 
 *       tags: [Home Page Banners Section]
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 */
app.get("/getSingleBannerDetails/:id", cacheMiddleWare, bannersHome.SingleBannerDetails);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page Banners Section
 *      description: APIs related to Home Page Banners
 *
 * paths:
 *   /editBannerDetails/:id:
 *     post:
 *       summary: Home Page Banners Updation
 *       description: Updating Banners of the Home Page Banner Section 
 *       tags: [Home Page Banners Section]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BannerHomePage'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     BannerHomePage:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Banner Title
 *         description:
 *           type: string
 *           description: Banner Description
 *         backgroundImage:
 *           type: string
 *           description: Banner Background Image
 */
app.post("/editBannerDetails/:id", bannersHome.EditBannerDetails);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page Banners Section
 *      description: APIs related to Home Page Banners
 *
 * paths:
 *   /deleteBannerdetails/:id:
 *     post:
 *       summary: Home Page Banners Deletion
 *       description: Deleting Banners of the Home Page Banner Section 
 *       tags: [Home Page Banners Section]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BannerHomePage'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     BannerHomePage:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Banner Title
 *         description:
 *           type: string
 *           description: Banner Description
 *         backgroundImage:
 *           type: string
 *           description: Banner Background Image
 */
app.post('/deleteBannerdetails/:id', bannersHome.DeleteBannerDetails);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page About Section
 *      description: APIs related to Home Page About Section
 *
 * paths:
 *   /addaboutdetails:
 *     post:
 *       summary: Home Page About Addition
 *       description: Adding About to the Home Page About Section 
 *       tags: [Home Page About Section]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutHomePage'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     AboutHomePage:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: About Title
 *         description:
 *           type: string
 *           description: About Description
 *         image:
 *           type: string
 *           description: About Image
 */
app.post("/addaboutdetails", aboutHome.AddAbout);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page About Section
 *      description: APIs related to Home Page About Section
 *
 * paths:
 *   /getaboutdetails:
 *     get:
 *       summary: Retrieving Home Page About Section Data
 *       description: Retrieving Home Page About Section Data Using this API 
 *       tags: [Home Page About Section]
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 */
app.get('/getaboutdetails', cacheMiddleWare, aboutHome.AboutDetails);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page Course Section
 *      description: APIs related to Home Page Course Section
 *
 * paths:
 *   /addcoursedetails:
 *     post:
 *       summary: Home Page Course Addition
 *       description: Adding Course to the Home Page Course Section 
 *       tags: [Home Page Course Section]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseHomePage'
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 *
 * components:
 *   schemas:
 *     CourseHomePage:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Course Title
 *         image:
 *           type: string
 *           description: Course Image
 *         link:
 *           type: string
 *           description: Course Link
 */
app.post("/addcoursedetails", courseController.AddCourse);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page Course Section
 *      description: APIs related to Home Page Course Section
 *
 * paths:
 *   /getcoursedetails:
 *     get:
 *       summary: Retrieving Courses for Home Page Course Section
 *       description: Retrieving Home Page Course Section Data Using this API 
 *       tags: [Home Page Course Section]
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 */
app.get('/getcoursedetails', cacheMiddleWare, courseController.CourseDetails);

/**
 * @swagger
 * tags:
 *   name: 🌐 Main Website Content Management APIs
 *   description: Endpoints for controlling main website content
 *   children:
 *      name: Home Page Course Section
 *      description: APIs related to Home Page Course Section
 *
 * paths:
 *   /getSingleCourseDetails/:id:
 *     get:
 *       summary: Retrieving Single Course Details
 *       description: Retrieving Single Course Details Using this API 
 *       tags: [Home Page Course Section]
 *       responses:
 *         '200':
 *           description: Successful response
 *         '401':
 *           description: Unauthorized
 *         '500':
 *           description: Internal Server Error
 */
app.get("/getSingleCourseDetails/:id", cacheMiddleWare, courseController.SingleCourseDetails);

app.post("/editCourseDetails/:id", courseController.EditCourseDetails);

app.post('/deleteCoursedetails/:id', courseController.DeleteCourse);


app.post("/addtestimonialdetails", testimonialController.AddTestimonial);

app.get('/gettestimonialdetails', cacheMiddleWare, testimonialController.TestimonialDetails);

app.get("/getSingleTestimonialDetails/:id", cacheMiddleWare, testimonialController.SingleTestimonialDetails);

app.post("/editTestimonialDetails/:id", testimonialController.EditTestimonial);

app.post('/deleteTestimonialdetails/:id', testimonialController.DeleteTestimonial);


app.post("/addAchievementdetails", achievementController.AddAchievement);

app.get('/getAchievementDetails', cacheMiddleWare, achievementController.AchievementDetails);

app.get("/getSingleAchievementDetails/:id", cacheMiddleWare, achievementController.SingleAchievementDetails);

app.post("/editAchievementDetails/:id", achievementController.EditAchievement);

app.post('/deleteAchievementdetails/:id', achievementController.DeleteAchievement);


app.post("/addfooterdetails", footerController.AddFooterDetails);

app.get('/getfooterdetails', cacheMiddleWare, footerController.FooterDetails);


app.post("/addnoticedetails", noticeController.AddNotice);

app.get('/getnoticedetails', cacheMiddleWare, noticeController.NoticeDetails);

app.get('/getnewnoticedetails', cacheMiddleWare, noticeController.NewNoticeDetails);

app.post("/getFilteredNotice", noticeController.FilteredNoticeDetails);

app.get("/getSingleNoticeDetails/:id", cacheMiddleWare, noticeController.SingleNoticeDetails);

app.get("/NoticeCount", cacheMiddleWare, noticeController.NoticeCount);

app.post("/editnoticedetails/:id", noticeController.EditNotice);

app.post('/deletenoticedetails/:id', noticeController.DeleteNotice);

app.post("/addbannercsedetails", bannersHomeCSE.AddBanner);

app.get('/getbannercsedetails', cacheMiddleWare, bannersHomeCSE.BannersDetails);

app.get("/getSingleBannerCseDetails/:id", cacheMiddleWare, bannersHomeCSE.SingleBannerDetails);

app.post("/editBannerCseDetails/:id", bannersHomeCSE.EditBannerDetails);

app.post('/deleteBannerCsedetails/:id', bannersHomeCSE.DeleteBannerDetails);

app.post("/addaboutcsedetails", aboutHomeCSE.AddAboutDetails)

app.get('/getaboutcsedetails', cacheMiddleWare, aboutHomeCSE.AboutDetails);

app.post("/addcsegallery", galleryControllerCSE.AddGallery);

app.get('/getcsegallery', cacheMiddleWare, galleryControllerCSE.GalleryDetails);

app.get("/getSinglecsegallery/:id", cacheMiddleWare, galleryControllerCSE.SingleGalleryDetails);

app.post("/editcsegallery/:id", galleryControllerCSE.EditGallery);

app.post('/deletecsegallery/:id', galleryControllerCSE.DeleteGallery);

app.post("/addfaqcse", faqControllerCSE.AddFAQ);

app.get("/getfaqscse", cacheMiddleWare, faqControllerCSE.FAQDetails);

app.get("/getSingleFaqCse/:id", cacheMiddleWare, faqControllerCSE.SingleFAQDetails);

app.post("/editFaqCse/:id", faqControllerCSE.EditFAQ);

app.post('/deleteFaqCse/:id', faqControllerCSE.DeleteFAQ);

app.post("/addbannerECEdetails", bannersHomeECE.AddBanner);

app.get('/getbannerECEdetails', cacheMiddleWare, bannersHomeECE.BannerDetails);

app.get("/getSingleBannerECEDetails/:id", cacheMiddleWare, bannersHomeECE.SingleBannerDetails);

app.post("/editBannerECEDetails/:id", bannersHomeECE.EditBanner);

app.post('/deleteBannerECEdetails/:id', bannersHomeECE.DeleteBanner);

app.post("/addaboutECEdetails", aboutHomeECE.AddAbout);

app.get('/getaboutECEdetails', cacheMiddleWare, aboutHomeECE.AboutDetails);

app.post("/addECEgallery", galleryControllerECE.AddGallery);

app.get('/getECEgallery', cacheMiddleWare, galleryControllerECE.GalleryDetails);

app.get("/getSingleECEgallery/:id", cacheMiddleWare, galleryControllerECE.SingleGalleryDetails);

app.post("/editECEgallery/:id", galleryControllerECE.EditGallery);

app.post('/deleteECEgallery/:id', galleryControllerECE.DeleteGallery);

app.post("/addfaqECE", faqControllerECE.AddFAQ);

app.get("/getfaqsECE", cacheMiddleWare, faqControllerECE.FAQDetails);

app.get("/getSingleFaqECE/:id", cacheMiddleWare, faqControllerECE.SingleFAQDetails);

app.post("/editFaqECE/:id", faqControllerECE.EditFAQ);

app.post('/deleteFaqECE/:id', faqControllerECE.DeleteFAQ);

app.post("/addbannerEEEdetails", bannersHomeEEE.AddBanner);

app.get('/getbannerEEEdetails', cacheMiddleWare, bannersHomeEEE.BannerDetails);

app.get("/getSingleBannerEEEDetails/:id", cacheMiddleWare, bannersHomeEEE.SingleBannerDetails);

app.post("/editBannerEEEDetails/:id", bannersHomeEEE.EditBanner);

app.post('/deleteBannerEEEdetails/:id', bannersHomeEEE.DeleteBanner);

app.post("/addaboutEEEdetails", aboutHomeEEE.AddAbout);

app.get('/getaboutEEEdetails', cacheMiddleWare, aboutHomeEEE.AboutDetails);

app.post("/addEEEgallery", galleryControllerEEE.AddGallery);

app.get('/getEEEgallery', cacheMiddleWare, galleryControllerEEE.GalleryDetails);

app.get("/getSingleEEEgallery/:id", cacheMiddleWare, galleryControllerEEE.SingleGalleryDetails);

app.post("/editEEEgallery/:id", galleryControllerEEE.EditGallery);

app.post('/deleteEEEgallery/:id', galleryControllerEEE.DeleteGallery);

app.post("/addfaqEEE", faqControllerEEE.AddFAQ);

app.get("/getfaqsEEE", cacheMiddleWare, faqControllerEEE.FAQDetails);

app.get("/getSingleFaqEEE/:id", cacheMiddleWare, faqControllerEEE.SingleFAQDetails);

app.post("/editFaqEEE/:id", faqControllerEEE.EditFAQ);

app.post('/deleteFaqEEE/:id', faqControllerEEE.DeleteFAQ);

app.post("/addbannerCEdetails", bannersHomeCE.AddBanner);

app.get('/getbannerCEdetails', cacheMiddleWare, bannersHomeCE.BannerDetails);

app.get("/getSingleBannerCEDetails/:id", cacheMiddleWare, bannersHomeCE.SingleBannerDetails);

app.post("/editBannerCEDetails/:id", bannersHomeCE.EditBanner);

app.post('/deleteBannerCEdetails/:id', bannersHomeCE.DeleteBanner);

app.post("/addaboutCEdetails", aboutHomeCE.AddAbout);

app.get('/getaboutCEdetails', cacheMiddleWare, aboutHomeCE.AboutDetails);

app.post("/addCEgallery", galleryControllerCE.AddGallery);

app.get('/getCEgallery', cacheMiddleWare, galleryControllerCE.GalleryDetails);

app.get("/getSingleCEgallery/:id", cacheMiddleWare, galleryControllerCE.SingleGalleryDetails);

app.post("/editCEgallery/:id", galleryControllerCE.EditGallery);

app.post('/deleteCEgallery/:id', galleryControllerCE.DeleteGallery);

app.post("/addfaqCE", faqControllerCE.AddFAQ);

app.get("/getfaqsCE", cacheMiddleWare, faqControllerCE.FAQDetails);

app.get("/getSingleFaqCE/:id", cacheMiddleWare, faqControllerCE.SingleFAQDetails);

app.post("/editFaqCE/:id", faqControllerCE.EditFAQ);

app.post('/deleteFaqCE/:id', faqControllerCE.DeleteFAQ);

app.post("/addbannerMEdetails", bannersHomeME.AddBanner);

app.get('/getbannerMEdetails', cacheMiddleWare, bannersHomeME.BannerDetails);

app.get("/getSingleBannerMEDetails/:id", cacheMiddleWare, bannersHomeME.SingleBannerDetails);

app.post("/editBannerMEDetails/:id", bannersHomeME.EditBanner);

app.post('/deleteBannerMEdetails/:id', bannersHomeME.DeleteBanner);

app.post("/addaboutMEdetails", aboutHomeME.AddAbout);

app.get('/getaboutMEdetails', cacheMiddleWare, aboutHomeME.AboutDetails);

app.post("/addMEgallery", galleryControllerME.AddGallery);

app.get('/getMEgallery', cacheMiddleWare, galleryControllerME.GalleryDetails);

app.get("/getSingleMEgallery/:id", cacheMiddleWare, galleryControllerME.SingleGalleryDetails);

app.post("/editMEgallery/:id", galleryControllerME.EditGallery);

app.post('/deleteMEgallery/:id', galleryControllerME.DeleteGallery);

app.post("/addfaqME", faqControllerME.AddFAQ);

app.get("/getfaqsME", cacheMiddleWare, faqControllerME.FAQDetails);

app.get("/getSingleFaqME/:id", cacheMiddleWare, faqControllerME.SingleFAQDetails);

app.post("/editFaqME/:id", faqControllerME.EditFAQ);

app.post('/deleteFaqME/:id', faqControllerME.DeleteFAQ);

app.post("/addbannerMBAdetails", bannersHomeMBA.AddBanner);

app.get('/getbannerMBAdetails', cacheMiddleWare, bannersHomeMBA.BannerDetails);

app.get("/getSingleBannerMBADetails/:id", cacheMiddleWare, bannersHomeMBA.SingleBannerDetails);

app.post("/editBannerMBADetails/:id", bannersHomeMBA.EditBanner);

app.post('/deleteBannerMBAdetails/:id', bannersHomeMBA.DeleteBanner);

app.post("/addaboutMBAdetails", aboutHomeMBA.AddAbout)

app.get('/getaboutMBAdetails', cacheMiddleWare, aboutHomeMBA.AboutDetails);

app.post("/addMBAgallery", galleryControllerMBA.AddGallery);

app.get('/getMBAgallery', cacheMiddleWare, galleryControllerMBA.GalleryDetails);

app.get("/getSingleMBAgallery/:id", cacheMiddleWare, galleryControllerMBA.SingleGalleryDetails);

app.post("/editMBAgallery/:id", galleryControllerMBA.EditGallery);

app.post('/deleteMBAgallery/:id', galleryControllerMBA.DeleteGallery);

app.post("/addfaqMBA", faqControllerMBA.AddFAQ);

app.get("/getfaqsMBA", cacheMiddleWare, faqControllerMBA.FAQDetails);

app.get("/getSingleFaqMBA/:id", cacheMiddleWare, faqControllerMBA.SingleFAQDetails);

app.post("/editFaqMBA/:id", faqControllerMBA.EditFAQ);

app.post('/deleteFaqMBA/:id', faqControllerMBA.DeleteFAQ);

app.post("/addDepartment", departmentController.AddDepartment);

app.get("/getDepartment", cacheMiddleWare, departmentController.DepartmentDetails);

app.get("/getSingleDepartmentDetails/:id", cacheMiddleWare, departmentController.SingleDepartmentDetails);

app.get("/DepartmentCount", cacheMiddleWare, departmentController.DepartmentCount);

app.put("/editDepartment/:id", departmentController.EditDepartment);

app.post('/deleteDepartment/:id', departmentController.DeleteDepartment);

app.post("/addSubject", subjectController.AddSubject);

app.get("/getSubject", cacheMiddleWare, subjectController.SubjectDetails);

app.post("/getFilteredSubjectDetails", subjectController.FilteredSubjectDetails);

app.get("/getSingleSubjectDetails/:id", cacheMiddleWare, subjectController.SingleSubjectDetails);

app.get("/SubjectCount", cacheMiddleWare, subjectController.SubjectCount);

app.put("/editSubject/:id", subjectController.EditSubject);

app.post('/deleteSubject/:id', subjectController.DeleteSubject);


app.post("/addStudentDetails", studentController.AddStudent);

app.post("/getFilteredStudentDetails", studentController.FilteredStudentDetails);

app.post("/getFilteredStudentDetailsByEnrollmentNo", studentController.FilteredStudentDetailsByEnrollmentNo);

app.post('/changestudentprofilepicture/:user', studentController.ChangeProfilePicture);

app.get("/getStudentDetails", cacheMiddleWare, studentController.StudentDetails);

app.get("/getSingleStudentDetails/:id", cacheMiddleWare, studentController.SingleStudentDetails);

app.get("/StudentCount", cacheMiddleWare, studentController.StudentCount);

app.post("/editStudentDetails/:id", studentController.EditStudent);

app.post('/deleteStudentDetails/:id', studentController.DeleteStudent);


app.post("/addFacultyDetails", facultyController.AddFaculty);

app.post("/getFilteredFacultyDetails", facultyController.FilteredFacultyDetails);

app.post('/changefacultyprofilepicture/:user', facultyController.ChangeProfilePicture);

app.get("/getFacultyDetails", cacheMiddleWare, facultyController.FacultyDetails);

app.get("/getSingleFacultyDetails/:id", cacheMiddleWare, facultyController.SingleFacultyDetails);

app.get("/FacultyCount", cacheMiddleWare, facultyController.FacultyCount);

app.put("/editFacultyDetails/:id", facultyController.EditFaculty);

app.post('/deleteFacultyDetails/:id', facultyController.DeleteFaculty);


app.post("/addStaffDetails", staffController.AddStaff);

app.post("/getFilteredStaffDetails", staffController.FilteredStaffDetails);

app.post('/changestaffprofilepicture/:user', staffController.ChangeProfilePicture);

app.get("/getStaffDetails", cacheMiddleWare, staffController.StaffDetails);

app.get("/getSingleStaffDetails/:id", cacheMiddleWare, staffController.SingleStaffDetails);

app.get("/StaffCount", cacheMiddleWare, staffController.StaffCount);

app.put("/editStaffDetails/:id", staffController.EditStaff);

app.post('/deleteStaffDetails/:id', staffController.DeleteStaff);

app.post('/StudentAttendance', attendanceController.StudentAttendance);

app.post("/getFilteredStudentAttendanceDetails", attendanceController.FilteredStudentAttendanceDetails);

app.post('/getFilteredStudentAttendanceDetailsByDateRange', attendanceController.FilteredStudentAttendanceDetailsByDateRange);


app.post('/getFilteredStudentAttendanceDetailsByDate', attendanceController.FilteredStudentAttendanceDetailsByDate);


app.post("/addtimetable", timetableController.AddTimetable);

app.post("/getFilteredTimetable", timetableController.FilteredTimetableDetails);

app.get("/getTimetableDetails", cacheMiddleWare, timetableController.TimetableDetails);

app.get("/getSingleTimetableDetails/:id", cacheMiddleWare, timetableController.SingleTimetableDetails);

app.get("/TimetableCount", cacheMiddleWare, timetableController.TimetableCount);

app.post("/editTimetableDetails/:id", timetableController.EditTimetable);

app.post('/deleteTimetableDetails/:id', timetableController.DeleteTimetable);

app.post("/addmaterial", materialController.AddMaterial);

app.get("/getmaterials", cacheMiddleWare, materialController.MaterialDetails);

app.get("/MaterialCount", cacheMiddleWare, materialController.MaterialCount);

app.post("/getFilteredMaterial", materialController.FilteredMaterialDetails);

app.post('/getFilteredSubjectMaterial', materialController.FilteredSubjectMaterial);

app.get("/getSingleMaterialDetails/:id", cacheMiddleWare, materialController.SingleMaterialDetails);

app.post("/editMaterialDetails/:id", materialController.EditMaterial);

app.post('/deleteMaterialDetails/:id', materialController.DeleteMaterial);


app.post("/addevent", eventCalendarController.AddEvent);

app.get("/getevents", cacheMiddleWare, eventCalendarController.EventDetails);

app.delete('/deleteevent', eventCalendarController.DeleteEvent);


app.post("/addshowevent", eventBlogController.AddEventBlog);

app.get("/getshowevents", cacheMiddleWare, eventBlogController.EventBlogDetails);

app.get("/getSingleShowEvent/:id", cacheMiddleWare, eventBlogController.SingleEventBlogDetails);

app.post("/editShowEvent/:id", eventBlogController.EditEventBlog);

app.post('/deleteShowEvent/:id', eventBlogController.DeleteEventBlog);


app.post('/submitContactForm', enquiryController.SubmitContactForm);

app.get("/getEnquiries", cacheMiddleWare, enquiryController.EnquiryDetails);

app.post('/deleteEnquiry/:id', enquiryController.DeleteEnquiry);

app.get("/EnquiryCount", cacheMiddleWare, enquiryController.EnquiryCount);

app.post("/addBookDetails", bookController.AddBook);

app.get("/getBookDetails", cacheMiddleWare, bookController.BookDetails);

app.get("/getSingleBookDetails/:id", cacheMiddleWare, bookController.SingleBookDetails);

app.get("/BookCount", cacheMiddleWare, bookController.BookCount);

app.post("/getFilteredBookDetails", bookController.FilteredBookDetails);

app.post("/editBookDetails/:id", bookController.EditBook);

app.post('/deleteBookDetails/:id', bookController.DeleteBook);

app.post('/updateBookStockStatus/:bookId', bookController.BookStockStatus);


app.post("/addIssueBookDetails", issuedBookController.AddIssuedBook);

app.get("/getIssueBookDetails", cacheMiddleWare, issuedBookController.IssuedBookDetails);

app.get("/IssuedBookCount", cacheMiddleWare, issuedBookController.IssuedBookCount);

app.post("/getFilteredIssueBookDetails", issuedBookController.FilteredIssuedBook);

app.post('/deleteIssueBookDetails/:id', issuedBookController.DeleteIssuedBook);

app.post("/returnBook/:id", issuedBookController.ReturnBook);

app.post('/updateBookStatus/:bookId', issuedBookController.IssuedBookStatus);
