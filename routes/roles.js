const express = require('express');
const Role = require('../models/Role');
const Recipe = require('../models/Recipe');
const Inventory = require('../models/Inventory');
const router = express.Router();
let loggedUserId;

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
    console.log("UserId", userId);
    res.render('chef-home', {email, fullName, userId});
});

router.get('/api/manager-page-34890645', function (req, res) {
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    const userId = req.query.userId || null;
    console.log("Email:", email);
    console.log("FullName:", fullName);
    console.log("UserId", userId);
    res.render('manager-home', { email, fullName, userId })
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
router.get('/api/login-34890645', function(req,res){
    res.render('login', {error: ''})
})

router.post('/loginUser', async function(req,res){
    try {
        const {email, password,} = req.body;
        const user = await Role.findOne({email});

        if(!user){
            return res.status(400).render("login", { error: "Account not found" }); //send the 400 to the back-end and error to the front-end
        }

        if(user.password != password){
            return res.status(400).render("login", { error: "Invalid password" }); //send the 400 to the back-end and error to the front-end
            
        }

        if(user.role === 'Admin'){
            return res.redirect(`/api/admin-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}`); //this make sure the email is pass through
        } else if (user.role === 'Chef'){
            return res.redirect(`/api/chef-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&userId=${encodeURIComponent(user.userId)}`)
        } else if (user.role === 'Manager'){
            return res.redirect(`/api/manager-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&userId=${encodeURIComponent(user.userId)}`)
        } else {
            return res.redirect('/login-34890645');
        }


    } catch(error){
        console.log(error);
        res.status(500).send('Sever Error');
    }
});



///////////////////////////////
//         RECIPE           //
//////////////////////////////

router.get('/', async function (req, res) {
    try {
        const recipes = await Recipe.find({});
        res.render('view-recipes', { recipes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//GET to the recipe page
router.get("/api/add-recipes-34890645", function (req, res) {
    res.render('add-recipes',{userId:loggedUserId});
});

router.post("/addRecipe", async function (req, res) {
    try {
        console.log(req.body.userId);
        let aRole = await Role.findOne({ userId: req.body.userId});
        console.log(aRole)
        if (!aRole) {
            return res.status(400).send("Invalid user/role ID"); // stop here if not found
        }
        const { recipeId, title, chef, instructions, mealType, cuisineType, prepTime, difficulty, servings, createdDate } = req.body;
        const ingredientInput = req.body.ingredients.join("\n"); // join all textarea lines
        const nameIngredients = splitWord(ingredientInput);
        const newRecipe = new Recipe({
            recipeId,
            userId: [aRole._id],
            title,
            chef,
            ingredients: nameIngredients,
            instructions,
            mealType,
            cuisineType,
            prepTime,
            difficulty,
            servings,
            createdDate
        });

        await newRecipe.save();
        console.log(newRecipe);
        
        res.redirect('/view-recipes') //after signing up, go to login page

    } catch (error) {
        console.log(error);
        res.status(500).send("Error creating recipe");
    }
});




///////////////////////////////
//         INVENTORY         //
//////////////////////////////

router.get('/api/view-inventory-34890645', async function (req, res) {
    try {
        const userId = req.query.userId || null;
        const email = req.query.email || null;
        const fullName = req.query.fullName || null;
        console.log("UserIdForViewInventory", userId);
        const inventories = await Inventory.find({});
        res.render('view-inventory', { inventories, userId, email, fullName });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// GET add inventory form
router.get("/api/add-inventories-34890645", function (req, res) {
    const userId = req.query.userId || null;
    console.log("UserIdForInventory", userId);
    res.render('add-inventory',{userId});
});

// POST create new inventory
router.post("/addInventory", async function(req,res){
    try {
        let aRole = await Role.findOne({ userId: req.body.userId });
        console.log(aRole)
        if (!aRole) {
            return res.status(400).send("Invalid user/role ID"); // stop here if not found
        }
        const { inventoryId, ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost,stock, createdDate } = req.body;
        const newInventory = new Inventory({
            inventoryId,
            userId: [aRole._id], //make it a foreign key
            ingredientName,
            quantity: parseFloat(quantity),
            unit,
            category,
            purchaseDate,
            expirationDate,
            location,
            cost: parseFloat(cost),
            stock: parseInt(stock),
            createdDate
        });

        await newInventory.save();
        res.redirect(`/api/view-inventory-34890645?userId=${req.body.userId}`);
    } catch (error) {
        console.error(error);

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
})

// GET edit inventory form
router.get('/:id/edit', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);

        if (!inventory) {
            return res.status(404).send('Inventory not found');
        }
        res.render('edit-inventory', { inventory });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// POST update inventory
router.post("/:id/update", async function (req, res) {
    try {
        const { inventoryId, ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost, stock, createdDate } = req.body;

        // Create new student instance
        const updateInventory = Inventory.findByIdAndUpdate(
            req.params.id,
            {
            inventoryId,
            ingredientName,
            quantity: parseFloat(quantity),
            unit,
            category,
            purchaseDate,
            expirationDate,
            location,
            cost: parseFloat(cost),
            stock: parseInt(stock),
            createdDate
        },
        {
            new: true,              // Return the updated document
            runValidators: true     // Run schema validation
        }
    );  
        if (!updateInventory) {
            return res.status(404).send('Inventory not found');
        }

        res.redirect('/api/view-inventory-34890645');
    } catch (error) {
        console.error(error);

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
})

// POST delete inventory
router.post('/:id/delete', async (req, res) => {
    try {
        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);

        if (!deletedInventory) {
            return res.status(404).send('Inventory not found');
        }

        res.redirect('/api/view-inventory-34890645');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

function splitWord(input) {
    //split by space or comma, remove extra space , remove empty string
    const sentences = input.split(/\n|,/).map(sentence => sentence.trim()).filter(sentence => sentence)
    let ingredientNameParts = []; //this is to store the each object
    const units = ["g", "kg", "ml", "l"]; // unit

    for (let line of sentences) {
        const parts = line.split(" "); //turn a string into an array
        let quantity = 0;
        let unit = "";
        let nameParts = [];

        for(let part of parts){
            if (!isNaN(part)){ // is a number
                quantity = parseInt(part);
            } else if(units.includes(part.toLowerCase())){ //if the words match one of the unit
                unit = part;
            } else {
                nameParts.push(part); //if it not a number or unit
            }
        }

        ingredientNameParts.push({
            ingredientName: nameParts.join(" "),
            quantity: quantity,
            unit: unit
        });
    }

    return ingredientNameParts;
}


