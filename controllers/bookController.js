const Book = require('../model/Book');
const User = require('../model/User'); 
const fs = require("fs");
const path = require('path');
const bcrypt = require('bcrypt');

exports.signupPage = (req, res) => {
    res.status(200).render('signup')
}

exports.loginPage = (req, res) => {
    res.status(200).render('login')
}

exports.handleSignup = async (req,res)=> {
    try {
        const { username,password } = req.body;

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            res.cookie('user', username, { maxAge: 3600000, httpOnly: true });
            return res.status(200).redirect('/'); 
        }

          const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await User.create({
            username,
            password: hashedPassword
        });
        res.cookie('user', username, { maxAge: 3600000, httpOnly: true });
        res.status(201).redirect('/');
    }
  catch (error) {
        console.log("Signup Error:", error);
        res.status(500).send("Something went wrong during signup.");
    }
}

exports.handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).redirect('/signup');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.cookie('user', username, {
                maxAge: 3600000,
                httpOnly: true
            });
            res.status(200).redirect('/');
        } else {
            res.status(401).send('Invalid Password! <a href="/login">Try again</a>');
        }
    } catch (error) {
        res.status(500).send("Something went wrong during login!");
    }
    
}


exports.handleLogout = (req, res) => {
    res.status(200).clearCookie("user");
    res.status(200).redirect('/login');
}



exports.getBooks = async (req, res) => {
 try {
        const books = await Book.find();
        res.status(200).render('index', { books, user: req.cookies.user });
    } catch (error) {
        res.status(500).send("Error fetching books");
    }
}

exports.addBookForm = (req, res) => res.status(200).render("add");

exports.createBook = async (req, res) => {
  try {
        const book = new Book({
            ...req.body,
            image: req.file ? req.file.filename : null
        });
        await book.save();
        res.status(201).redirect('/');
    } catch (error) {
        res.status(400).send("Invalid Book Data"); 
    }
}

exports.editBookForm = async (req, res) => {
 try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).send("Book Not Found"); 
        res.status(200).render("edit", { book });
    } catch (error) {
        res.status(500).send("Error");
    }
}

exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send("Book Not Found!");
        }
        let data = { ...req.body };
        if (req.file) {
            if (book.image) {
                const oldPath = path.join(__dirname, "../public/uploads", book.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            data.image = req.file.filename;
        }
        await Book.findByIdAndUpdate(req.params.id, data);
        res.status(200).redirect("/");

    } catch (error) {
        console.log("Update Error:", error);
        res.status(500).send("Somthing Update Server Error!");
    }
}

exports.deleteBook = async (req, res) => {
   try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).send("Book Not Found");

        if (book.image) {
            const imgPath = path.join(__dirname, "../public/uploads", book.image);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
        await Book.findByIdAndDelete(req.params.id);
        res.status(200).redirect('/');
    } catch (error) {
        res.status(500).send("Delete Error");
    }
}