const express = require("express")
const router = express.Router()
const multer = require('multer')
const controller = require('../controllers/bookController')


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/uploads/"),
    filename: (req, file, cb) =>  cb(null,Date.now() + "-"+file.originalname)
            
    
})

const upload = multer({ storage })

const isAuth = (req, res, next) => {
    if (req.cookies.user) return next();
    res.redirect('/login')
}


router.get('/signup', controller.signupPage);
router.post('/signup', controller.handleSignup);
router.get('/login', controller.loginPage);
router.post('/login', controller.handleLogin);
router.get('/logout', controller.handleLogout);

router.get('/', controller.getBooks);
router.get('/add', isAuth, controller.addBookForm);
router.post('/add', isAuth, upload.single("image"), controller.createBook);
router.get('/edit/:id', isAuth, controller.editBookForm);
router.post('/update/:id', isAuth, upload.single("image"), controller.updateBook);
router.get('/delete/:id', isAuth, controller.deleteBook);

module.exports = router;