const express = require('express');
const Role = require('../models/Role');
const Recipe = require('../models/Recipe');
const Inventory = require('../models/Inventory');
const router = express.Router();


///////////////////////////////
//          ROLE            //
//////////////////////////////

router.get('/api/admin-page-34890645', async function(req,res){
    const countUser = await Role.countDocuments();  //countDocuments is for counting the total in the database reference: https://www.geeksforgeeks.org/mongodb/mongoose-countdocuments-function/
    const countRecipe = await Recipe.countDocuments({});
    const countInventory = await Inventory.countDocuments({});
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    const userId = req.query.userId || null;
    console.log("Email:", email);
    console.log("FullName:", fullName);
    console.log("UserId", userId);
    res.status(200).render('admin-home', { email, fullName, userId, countUser, countRecipe, countInventory });
});

router.get('/api/chef-page-34890645',async function (req, res) {
    const countChef = await Role.countDocuments({ role: "Chef" });  //countDocuments is for counting the total in the database reference: https://www.geeksforgeeks.org/mongodb/mongoose-countdocuments-function/
    const countRecipe = await Recipe.countDocuments({});
    const countInventory = await Inventory.countDocuments({});
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    const userId = req.query.userId || null;
    console.log("Email:", email);
    console.log("FullName:", fullName);
    console.log("UserId", userId);
    res.status(200).render('chef-home', { email, fullName, userId, countChef, countRecipe, countInventory });
});

router.get('/api/manager-page-34890645',async function (req, res) {
    const countManger = await Role.countDocuments({role: "Manager"})
    const countInventory = await Inventory.countDocuments({});
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    const userId = req.query.userId || null;
    console.log("Email:", email);
    console.log("FullName:", fullName);
    console.log("UserId", userId);
    res.status(200).render('manager-home', { email, fullName, userId, countManger, countInventory })
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

//This is to show the registration form add-role.ejs
router.get('/api/add-role-34890645', function (req, res) {
    res.status(200).render('add-role', {error: ''});
});

router.post('/rolesAdd', async function(req,res){
    const { userId, email, fullName, role, phone, password } = req.body;
    try{
        const newRole = new Role({
            userId,  
            email,
            fullName,
            role,
            phone,
            password
        });

        await newRole.save();
        res.status(200).redirect('/api/login-34890645') //after signing up, go to login page
        
    } catch (error){ 
        console.log(error);

        let errorMessage = '';

        if (error.name === 'ValidationError'){
            for(let eachField in error.errors){
                if(eachField === 'email'){
                    errorMessage += 'Email failes to create. '
                }
                if (eachField === 'fullName') {
                    errorMessage += 'fullName failes to create. '
                } 
                if (eachField === 'role') {
                    errorMessage += 'Role not selected correctly. '
                } 
                if (eachField === 'phone') {
                    errorMessage += 'Phone number should be in Austrailia. '
                } 
                if (eachField === 'password') {
                    errorMessage += 'Password failed to create. '
                } 
            }
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).send(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
        }

        return res.status(400).render('add-role', { //make it to 400 because there is an error
            error: errorMessage,
            email,
            fullName,
            role,
            phone
        })
    }  
});

// Task 3: User Login and Authentication System
router.get('/api/login-34890645', function(req,res){
    res.status(200).render('login', {error: ''})
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
            return res.status(200).redirect(`/api/admin-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}`); //this make sure the email is pass through
        } else if (user.role === 'Chef'){
            return res.status(200).redirect(`/api/chef-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&userId=${encodeURIComponent(user.userId)}`)
        } else if (user.role === 'Manager'){
            return res.status(200).redirect(`/api/manager-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&userId=${encodeURIComponent(user.userId)}`)
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


router.get('/api/view-recipes-34890645', async function (req, res) {
    try {
        const userId = req.query.userId || null;
        const email = req.query.email || null;
        const fullName = req.query.fullName || null;
        console.log("userIdForViewRecipe", userId);
        console.log("emailForViewRecipe", email);
        console.log("fullNameForViewRecipe", fullName);
        const recipes = await Recipe.find({});
        res.render('view-recipes', { recipes,userId,email,fullName });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//GET to the recipe page
router.get("/api/add-recipes-34890645", async function (req, res) {
    const userId = req.query.userId || null;
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    console.log("userIdForAddRecipe", userId);
    console.log("emailForAddRecipe", email);
    console.log("fullNameForAddRecipe", fullName);
    res.status(200).render('add-recipes', { userId, email, fullName });
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
        const instructionsSpilt = instructions.split(/,|\n/);
        const ingrdientsSpilt = req.body.ingredients.split(/\n|,/).map(item => splitWord(item.trim()));
        const newRecipe = new Recipe({
            recipeId,
            userId: [aRole._id],
            title,
            chef,
            ingredients: ingrdientsSpilt,
            instructions: instructionsSpilt,
            mealType,
            cuisineType,
            prepTime,
            difficulty,
            servings,
            createdDate
        });

        await newRecipe.save();
        console.log(newRecipe);

        res.status(200).redirect(`/api/view-recipes-34890645?userId=${req.body.userId}&&fullName=${req.body.fullName}&&email=${req.body.email}`)
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
});

router.get('/api/delete-recipes-34890645', async function (req, res) {
    try {
        const userId = req.query.userId || null;
        const email = req.query.email || null;
        const fullName = req.query.fullName || null;
        console.log("userIdForViewRecipe", userId);
        console.log("emailForViewRecipe", email);
        console.log("fullNameForViewRecipe", fullName);
        const recipes = await Recipe.find({});
        res.status(200).render('recipe-delete', { recipes, userId, email, fullName });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// POST delete Recipe
router.post('/:id/delete', async (req, res) => {
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);

        if (!deletedRecipe) {
            return res.status(404).send('Recipe not found');
        }

        const { userId, email, fullName } = req.query;
        res.status(200).redirect(`/api/view-recipes-34890645?userId=${userId}&&fullName=${fullName}&&email=${email}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//GET edit recipe
router.get('/:id/edit', async (req, res) => {
    try {
        const userId = req.query.userId || null;
        const email = req.query.email || null;
        const fullName = req.query.fullName || null;
        const recipe = await Recipe.findById(req.params.id);

        console.log(recipe)
        if (!recipe) {
            return res.status(404).send('recipe not found');
        }
        res.status(200).render('edit-recipe', { recipe, userId, email, fullName });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post("/:id/update", async function (req, res) {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).send('Recipe in update not found');

        const aRole = await Role.findById(recipe.userId[0]);
        if (!aRole) return res.status(400).send("Invalid user error in update");

        const { recipeId, title, chef, instructions, mealType, cuisineType, prepTime, difficulty, servings, createdDate } = req.body;
        const instructionsSpilt = instructions.split(/,|\n/);
        const ingrdientsSpilt = req.body.ingredients.split(/\n|,/).map(item => splitWord(item.trim()));
        const updateRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            {
            recipeId,
            userId: [aRole._id],
            title,
            chef,
            ingredients: ingrdientsSpilt,
            instructions: instructionsSpilt,
            mealType,
            cuisineType,
            prepTime,
            difficulty,
            servings,
            createdDate
        },{
            new: true,              // Return the updated document
            runValidators: true     // Run schema validation
        }
    );

        await updateRecipe.save();
        console.log(updateRecipe);

        res.status(200).redirect(`/api/view-recipes-34890645?userId=${req.body.userId}&&fullName=${req.body.fullName}&&email=${req.body.email}`)
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
});

//GET update page in recipe
router.get('/api/update-recipes-34890645',async function(req,res){
    try {
        const userId = req.query.userId || null;
        const email = req.query.email || null;
        const fullName = req.query.fullName || null;
        const recipes = await Recipe.find({})
        res.render('update-recipe', { 
            recipes, 
            recipe: null, 
            message: '', 
            userId, 
            email, 
            fullName })
    }catch(error){
        console.error(error);
        res.status(500).send('Server Error');
    }
})

// POST update recipe
router.post('/updateRecipeByid',async function (req, res) {
    try {
        const recipeId = req.body.recipeId;
        const recipes = await Recipe.find({});

        if(!recipeId){
            return res.status(200).render('update-recipe', { 
                recipes,
                recipe: null, 
                message: 'Please enter Id', 
                userId: req.body.userId || null,
                email: req.body.email || null, 
                fullName: req.body.fullName || null });
        }
        const recipe = await Recipe.findOne({recipeId: recipeId}) //by recipe by id, it will display one recipe

        if (!recipe) {
            return res.status(200).render('update-recipe', {
                recipes,
                recipe: null, 
                message: 'Recipe not found', 
                userId: req.body.userId || null,
                email: req.body.email || null,
                fullName: req.body.fullName || null });
        } else {
            return res.status(200).render('update-recipe', {
                recipes,
                recipe: recipe,
                message: '',
                userId: req.body.userId || null,
                email: req.body.email || null,
                fullName: req.body.fullName || null
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
})

//HD Task 1
//recipe integration 
router.get('/api/recipe-integration-34890645', async function(req,res){
    try{
        const inventories = await Inventory.find({});
        const recipes = await Recipe.find({});
        const userId = req.query.userId || null;
        const email = req.query.email || null;
        const fullName = req.query.fullName || null;
        const recommendRecipe = await Recipe.aggregate([
            {
                // join the Recipe and Inventory togethere
                $lookup: {
                    from: 'inventories', // the collection to join in the recipe integration is inventory
                    localField: 'ingredients.itemName', // array of string
                    foreignField: 'ingredientName', // name of ingredient in the inventory
                    as: 'availableIngredients' //matched inventory
                }
            },
            {
                $addFields: { //reference: https://www.w3schools.com/mongodb/mongodb_aggregations_addFields.php
                    // size count the returnt the total number of array reference: https://www.mongodb.com/docs/manual/reference/operator/aggregation/size/
                    totalIngredients: { $size: "$ingredients" },  // this is for counting the number in the ingredient array
                    matchIngredients: { $size: "$availableIngredients"} // This is from the lookup, can recommend recipe base on the ingredient
                }
            }
        ]);
        res.status(200).render('recipe-integration', { recommendRecipe, userId,email, fullName, recipes, inventories })
    }catch(error){
        console.log(error)
        res.status(500).send("Sever Error")
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
        console.log("userIdForViewInventory", userId);
        console.log("emailForViewInventory", email);
        console.log("fullNameForViewInventory", fullName);
        const inventories = await Inventory.find({});
        res.status(200).render('view-inventory', { inventories, userId, email, fullName });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// GET add inventory form
router.get("/api/add-inventories-34890645", function (req, res) {
    const userId = req.query.userId || null;
    const email = req.query.email || null;
    const fullName = req.query.fullName || null;
    console.log("UserIdForInventory", userId);
    console.log("emailFromAddInv", email);
    console.log("fullNameFromAddInv", fullName);
    res.status(200).render('add-inventory', { userId, email, fullName });
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
        res.status(200).redirect(`/api/view-inventory-34890645?userId=${req.body.userId}&&fullName=${req.body.fullName}&&email=${req.body.email}`);
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
router.get('/inventories/:id/edit', async (req, res) => {
    try {
        const userId = req.query.userId || null;
        const email = req.query.email || null;
        const fullName = req.query.fullName || null;
        const inventory = await Inventory.findById(req.params.id);

        if (!inventory) {
            return res.status(404).send('Inventory in edit not found');
        }
        res.status(200).render('edit-inventory', { inventory, userId, email, fullName });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
//needs to redo this
// POST update inventory
router.post("/inventories/:id/update", async function (req, res) {
    try {
        const inventory = await Inventory.findById(req.params.id).populate("userId");
        if (!inventory) return res.status(404).send('Inventory in update not found');
        
        const aRole = await Role.findById(inventory.userId[0]);
        if (!aRole) return res.status(400).send("Invalid user error in update");

        const { inventoryId, ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost, stock, createdDate } = req.body;
        // Create new student instance
        const updateInventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            {
            inventoryId,
            userId: [aRole._id],
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
            return res.status(404).send('Inventory in update not found');
        }

        res.status(200).redirect(`/api/view-inventory-34890645?userId=${aRole.userId}&&email=${aRole.email}&&fullName=${aRole.fullName}`);
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
});

// POST delete inventory
router.post('/inventories/:id/delete', async (req, res) => {
    try {
        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);

        if (!deletedInventory) {
            return res.status(404).send('Inventory in delete not found');
        }

        res.status(200).redirect('/api/view-inventory-34890645');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
    
function splitWord(input) {
    const units = ["kg", "g", "liters", "ml", "cups", "tbsp", "tsp", "pieces", "dozen"]; // unit
    input = input.trim(); //remove the space, incase uer put it in
    let words = input.split(" ");
    let ingredientNameParts = []; //this is to store actual words e.g eggs
    let quantity = 1;
    let unit = "";

    for (let word of words) { // reference:https://www.w3schools.com/js/js_loop_forof.asp
        if (!isNaN(word) && word !== "") {   //NaN is not a Number reference: https://www.w3schools.com/jsref/jsref_isnan.asp
            quantity = parseInt(word)          //store in the quantity             
        } else if (units.includes(word.toLowerCase())) { // if match the unit
            unit = word
        } else {
            ingredientNameParts.push(word); //else put it in the ingredientNameParts
        }
    };

    return {
        itemName: ingredientNameParts.join(" "), //making it into a single string
        itemQuantity: quantity,
        itemUnit: unit
    }
}


