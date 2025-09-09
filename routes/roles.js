const express = require('express');
const Role = require('../models/Role');
const router = express.Router();

//This is to show the registration form add-role.ejs
router.get('/api/add-role-34890645', function(req,res){
    res.render('add-role');
});

router.get('/api/admin-page-34890645', function(req,res){
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    console.log("Email:", email);
    console.log("FullName:", fullName);
    res.render('admin-home', { email, fullName });
});

router.get('/api/chef-page-34890645', function (req, res) {
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    console.log("Email:", email);
    console.log("FullName:", fullName);
    res.render('chef-home', {email, fullName});
});

router.get('/api/manager-page-34890645', function (req, res) {
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    console.log("Email:", email);
    console.log("FullName:", fullName);
    res.render('manager-home', { email, fullName })
});

//This is for the admin role, they can manage all users, recipes, and inventory
router.get('/', async function(req,res){
    try {
        const roles = await Role.find({});
        res.render('roles', { roles });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post('/rolesAdd', async function(req,res){
    try{
        const { userId, email, fullName, role, phone, password } = req.body;

        const newRole = new Role({
            userId,
            email,
            fullName,
            role,
            phone,
            password
        });

        await newRole.save();
        res.redirect('/login-34890645') //after signing up, go to login page
        
    } catch (error){ 
        console.log(error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).send(`Validation Error: ${errors.join(', ')}`);
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).send(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
        }

        res.status(500).send('Server Error');
    }  
});

// Task 3: User Login and Authentication System
router.get('/login-34890645', function(req,res){
    res.render('login')
})

router.post('/loginUser', async function(req,res){
    try {
        const {email, password} = req.body;
        const user = await Role.findOne({email});

        if(!user){
            return res.status(400).send("Account not founc")
        }

        if(user.password != password){
            return res.status(400).send('Invalid password')
        }

        if(user.role === 'Admin'){
            return res.redirect(`/api/admin-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}`); //this make sure the email is pass through
        } else if (user.role === 'Chef'){
            return res.redirect(`/api/chef-page-34890645?email=${encodeURIComponent(user.email, user.fullName)}&fullName=${encodeURIComponent(user.fullName)}`)
        } else if (user.role === 'Manager'){
            return res.redirect(`/api/manager-page-34890645?email=${encodeURIComponent(user.email, user.fullName)}&fullName=${encodeURIComponent(user.fullName)}`)
        } else {
            return res.redirect('/login');
        }


    } catch(error){
        console.log(error);
        res.status(500).send('Sever Error');
    }
});

//Logout
router.get("/logout", function(req,res){
    req.session.destroy( function(error){  //deletes the session date from the sever
        if(error) return res.status(500).send("Unable to log out");
        res.redirect("/login-34890645")
    })
})

module.exports = router;