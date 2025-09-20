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
    const { userId, email, fullName, role } = req.query; // pass in query
    const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
    console.log("Email:", email);
    console.log("FullName:", fullName);
    console.log("UserId", userId);
    res.status(200).render('admin-home', { email, fullName, userId, role, countUser, countRecipe, countInventory, home, navBarColor, roleName, invNav });
});

// This is displaying the chef page, in the here section will diplay their email and fullName
// and their created recipe, diaplay ingredient
router.get('/api/chef-page-34890645',async function (req, res) {
    const countChef = await Role.countDocuments({ role: "Chef" });  //countDocuments is for counting the total in the database reference: https://www.geeksforgeeks.org/mongodb/mongoose-countdocuments-function/
    const countRecipe = await Recipe.countDocuments({});
    const countInventory = await Inventory.countDocuments({});
    const { userId, email, fullName, role } = req.query; // pass in query
    const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
    let aRole = await Role.findOne({userId});
    if (!aRole){
        return res.status(400).send("Invalid user for the chef page");
    }
    console.log("aRole", aRole)
    const chefOwnRecipe = await Recipe.find({userId: aRole._id}); //this is the objectId of the current chef
    console.log("chefOwnRecipe",chefOwnRecipe)
    const sharedInventory = await Inventory.find({})
    console.log("sharedInventory",sharedInventory)
    res.status(200).render('chef-home', { email, fullName, userId, countChef, countRecipe, countInventory, home, navBarColor, roleName, role, invNav, chefOwnRecipe, sharedInventory });
});

router.get('/api/manager-page-34890645',async function (req, res) {
    const countManger = await Role.countDocuments({role: "Manager"})
    const countInventory = await Inventory.countDocuments({});
    const { userId, email, fullName, role} = req.query; //  pass in query
    const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
    res.status(200).render('manager-home', {
        email, fullName, userId, countManger, countInventory, role, home, navBarColor, roleName, invNav })
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
        const {email, password} = req.body;
        const user = await Role.findOne({email});

        if(!user){
            return res.status(400).render("login", { error: "Account not found" }); //send the 400 to the back-end and error to the front-end
        }

        if(user.password != password){
            return res.status(400).render("login", { error: "Invalid password" }); //send the 400 to the back-end and error to the front-end
            
        }

        if(user.role === 'Admin'){
            return res.status(200).redirect(`/api/admin-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&&userId=${encodeURIComponent(user.userId)}&&role=${encodeURIComponent(user.role)}`); //this make sure the email is pass through
        } else if (user.role === 'Chef'){
            return res.status(200).redirect(`/api/chef-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&userId=${encodeURIComponent(user.userId)}&&role=${encodeURIComponent(user.role)}`)
        } else if (user.role === 'Manager'){
            return res.status(200).redirect(`/api/manager-page-34890645?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(user.fullName)}&userId=${encodeURIComponent(user.userId)}&&role=${encodeURIComponent(user.role)}`)
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
        const { userId, email, fullName, role } = req.query; // pass in query
        const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
        console.log("userIdForViewRecipe", userId);
        console.log("emailForViewRecipe", email);
        console.log("fullNameForViewRecipe", fullName);

        //This is for the chef own recipe
        let aRole = await Role.findOne({ userId });
        if (!aRole) {
            return res.status(400).send("Invalid user for the chef page");
        }
        console.log("aRole", aRole)
        const chefOwnRecipe = await Recipe.find({ userId: aRole._id }); //this is the objectId of the current chef
        console.log("chefOwnRecipe", chefOwnRecipe)

        //This will other other chef recipe, except their own
        const otherRecipes = await Recipe.find({
            userId: { $ne: aRole._id }  //ne is for not equal reference: https://www.mongodb.com/docs/manual/reference/operator/query/ne/
        }).populate('userId') // populate tells to recplace the ObjectId in userId with all of the data

        res.render('view-recipes', { otherRecipes, userId, email, role, fullName, home, navBarColor, roleName, invNav, chefOwnRecipe });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//GET to the recipe page
router.get("/api/add-recipes-34890645", function(req, res) {
    const { userId, email, fullName, role } = req.query; // pass in query
    const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
    console.log("userIdForAddRecipe", userId);
    console.log("emailForAddRecipe", email);
    console.log("fullNameForAddRecipe", fullName);
    res.status(200).render('add-recipes', { userId, email, fullName, role, home, navBarColor, roleName, invNav });
});

router.post("/addRecipe", async function (req, res) {
    try {
        console.log(req.body.userId);
        let aRole = await Role.findOne({ userId: req.body.userId});
        console.log(aRole)
        if (!aRole) {
            return res.status(400).send("Invalid user"); // stop here if not found
        }
        const {title, chef, instructions, mealType, cuisineType, prepTime, difficulty, servings, createdDate } = req.body;
        const instructionsSpilt = instructions.split(/,|\n/);
        const ingrdientsSpilt = req.body.ingredients.split(/\n|,/).map(item => splitWord(item.trim()));
        const newRecipe = new Recipe({
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

        res.status(200).redirect(`/api/view-recipes-34890645?userId=${req.body.userId}&&fullName=${req.body.fullName}&&email=${req.body.email}&&role=${req.body.role}`)
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
        const { userId, email, fullName, role } = req.query; // pass in query
        const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
        console.log("userIdForViewRecipe", userId);
        console.log("emailForViewRecipe", email);
        console.log("fullNameForViewRecipe", fullName);

        //This is for the chef own recipe
        let aRole = await Role.findOne({ userId });
        if (!aRole) {
            return res.status(400).send("Invalid user for the chef page");
        }
        console.log("aRole", aRole)
        const chefOwnRecipe = await Recipe.find({ userId: aRole._id }); //this is the objectId of the current chef
        console.log("chefOwnRecipe", chefOwnRecipe)
        res.status(200).render('recipe-delete', { chefOwnRecipe, userId, email, fullName, role, home, navBarColor, roleName, invNav });
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

        const { userId, email, fullName, role} = req.query;
        res.status(200).redirect(`/api/view-recipes-34890645?userId=${userId}&&fullName=${fullName}&&email=${email}&&role=${role}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//GET edit recipe
router.get('/:id/edit', async (req, res) => {
    try {
        const { userId, email, fullName, role } = req.query; // pass in query

        const { home, navBarColor, roleName } = allRoleNavBar(role, userId, email, fullName);
        
        const recipe = await Recipe.findById(req.params.id);

        console.log(recipe)
        if (!recipe) {
            return res.status(404).send('recipe not found in edit id');
        }
        res.status(200).render('edit-recipe', { recipe, userId, email, fullName, role, message:'', error: '', home,navBarColor, roleName});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.post("/:id/update", async function (req, res) {
    const { userId, email, fullName, role } = req.body;
    const { home, navBarColor, roleName } = allRoleNavBar(role, userId, email, fullName);
    let recipe;
    try {
        recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).send('Recipe in update not found');

        const aRole = await Role.findById(recipe.userId);
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

     if (!updateRecipe) {
         return res.status(200).render('edit-recipe', { recipe, userId, email, fullName, role, message: '', error: 'Update failed', home, navBarColor, roleName })
     } 
        return res.status(200).render('edit-recipe', { recipe: updateRecipe, userId, email, fullName, role, message: 'Update successful', error: '', home, navBarColor, roleName })
     
        
    } catch (error) {
        console.error(error);

        let errorMessage = 'Sever Error';
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            errorMessage =`Validation Error: ${errors.join(', ')}`;
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            errorMessage =`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        }

        res.status(200).render('edit-recipe', { recipe, userId, email, fullName, role, message: '', error: errorMessage, home, navBarColor, roleName });
        
    }
});

//GET update page in recipe
router.get('/api/update-recipes-34890645',async function(req,res){
    try {
        const { userId, email, fullName, role } = req.query; // pass in query
        const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
        const recipes = await Recipe.find({})
        res.render('update-recipe', { 
            recipes, 
            recipe: null, 
            message: '', 
            userId, 
            email, 
            fullName,
            role,
            home,
            navBarColor,
            roleName,
            invNav
     })
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
        const { home, navBarColor, roleName, invNav } = allRoleNavBar(req.body.role, req.body.userId, req.body.email, req.body.fullName);

        if(!recipeId){
            return res.status(200).render('update-recipe', { 
                recipes,
                recipe: null, 
                message: 'Please enter Id', 
                userId: req.body.userId || null,
                email: req.body.email || null, 
                fullName: req.body.fullName || null,
                role: req.body.role || null,
                home,
                navBarColor,
                roleName,
                invNav
             });
                
        }
        const recipe = await Recipe.findOne({recipeId: recipeId}) //by recipe by id, it will display one recipe

        if (!recipe) {
            return res.status(200).render('update-recipe', {
                recipes,
                recipe: null, 
                message: 'Recipe not found', 
                userId: req.body.userId || null,
                email: req.body.email || null,
                fullName: req.body.fullName || null,
                role: req.body.role || null,
                home,
                navBarColor,
                roleName,
                invNav
             });
        } 

        let aRole = await Role.findOne({userId: req.body.userId });
        if (!aRole) {
            return res.status(400).send("Invalid user for the update recipe page");
        }
        
        // if the userId in the recipe does not match the ObjectId in the role
        if(!recipe.userId.includes(aRole._id)){
            return res.status(200).render('update-recipe', {
                recipes,
                recipe: null, 
                message: 'You are not the owner of this recipe',
                userId: req.body.userId || null,
                email: req.body.email || null,
                fullName: req.body.fullName || null,
                role: req.body.role || null,
                home,
                navBarColor,
                roleName,
                invNav
            });
        } else {
            return res.status(200).render('update-recipe', {
                recipes,
                recipe: recipe,
                message: '',
                userId: req.body.userId || null,
                email: req.body.email || null,
                fullName: req.body.fullName || null,
                role: req.body.role || null,
                home,
                navBarColor,
                roleName,
                invNav
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//HD Task 1
//recipe integration 
router.get('/api/recipe-integration-34890645', async function(req,res){
    try{
        const inventories = await Inventory.find({});
        const recipes = await Recipe.find({});
        const { userId, email, fullName, role } = req.query;
        const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
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
        res.status(200).render('recipe-integration', { recommendRecipe, userId, email, fullName, recipes, inventories, home, navBarColor, roleName, role, invNav })
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
        const { userId, email, fullName, role } = req.query; //  pass in query
        const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
        const inventories = await Inventory.find({});

        const totalValueAggregate = await Inventory.aggregate([
            {
                $group: {
                    _id: null,
                    totalInventoryValue: { $sum: { $multiply: ["$quantity", "$cost"] } } //the sum is for adding up all of the ingredient refernce: https://www.mongodb.com/docs/manual/reference/operator/aggregation/sum/
                    // multiply is for quantity * cost reference: https://www.mongodb.com/docs/manual/reference/operator/aggregation/multiply/
                }
            },
        ]);

        // Number convert in to a Js number
        //|| 0 ensure that if the value os undefined it will set to 0
        // totalValue now is a js number can use toFixed()
        // [0] first and only element of the array, need the zero because aggregate always return an array
        const totalValue = Number(totalValueAggregate[0]?.totalInventoryValue || 0);
        console.log(totalValue)
        res.status(200).render('view-inventory', { inventories, userId, email, fullName, role, home, navBarColor, roleName, invNav, totalValue });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// GET add inventory form
router.get("/api/add-inventories-34890645", function (req, res) {
    try {
        const { userId, email, fullName, role } = req.query; //pass in query
        const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);
        res.status(200).render('add-inventory', { userId, email, fullName, role, home, navBarColor, roleName, invNav });
    } catch(error){
        console.error(error);
        res.status(500).send('Server Error');
    }
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
        res.status(200).redirect(`/api/view-inventory-34890645?userId=${req.body.userId}&&fullName=${req.body.fullName}&&email=${req.body.email}&&role=${req.body.role}`);
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
        const { userId, email, fullName, role } = req.query; //pass in query

        const { home, navBarColor, roleName } = allRoleNavBar(role, userId, email, fullName);

        const inventory = await Inventory.findById(req.params.id);

        console.log(inventory)
        if (!inventory) {
            return res.status(404).send('Inventory in edit not found');
        }
        res.status(200).render('edit-inventory', { inventory, userId, email, fullName, role, roleName, navBarColor, home, message: '', error: '' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.post("/inventories/:id/update", async function (req, res) {
    const { userId, email, fullName, role } = req.body;
    const { home, roleName, navBarColor } = allRoleNavBar(role, userId, email, fullName);
    let inventory;
    try {
        inventory = await Inventory.findById(req.params.id)
        if (!inventory) return res.status(404).send('Inventory in update not found');
        
        const aRole = await Role.findById(inventory.userId);
        if (!aRole) return res.status(400).send("Invalid user error in update");
        const { inventoryId, ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost, stock, createdDate } = req.body;
        
        const duplicateName = await Inventory.findOne({ingredientName: ingredientName})

        if(duplicateName){
            return res.status(200).render('edit-inventory', { inventory, userId, email, fullName, role, roleName, navBarColor, home, message: '', error: 'IngredientName already exist' })
        }
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
            return res.status(200).render('edit-inventory', { inventory, userId, email, fullName, role, roleName, navBarColor, home, message: '', error: 'Update Fail' })
        }
            return res.status(200).render("edit-inventory", { inventory: updateInventory, userId, email, fullName, role, roleName, navBarColor, home, message: 'Update Successfully', error: '' });

    } catch (error) {

        console.error(error);

        let errorMessage = 'Sever Error';
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            errorMessage = `Validation Error: ${errors.join(', ')}`;
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            errorMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        }

        res.status(200).render("edit-inventory", { inventory, userId, email, fullName, role, roleName, navBarColor, home, message: '', error: errorMessage, home, navBarColor, roleName })
    }
});

// POST delete inventory
router.post('/inventories/:id/delete', async (req, res) => {
    try {
        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);

        if (!deletedInventory) {
            return res.status(404).send('Inventory in delete not found');
        }

        res.status(200).redirect(`/api/view-inventory-34890645?userId=${req.body.userId}&&email=${req.body.email}&&fullName=${req.body.fullName}&&role=${req.body.role}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


///////////////////////////////
//         REPORT           //
//////////////////////////////
router.get('/api/report-34890645', async function(req,res){
    try {
        const { userId, email, fullName, role } = req.query; //pass in query
        const { home, navBarColor, roleName, invNav } = allRoleNavBar(role, userId, email, fullName);

        // track the most View
        const mostView = await Recipe.aggregate([
            {$sort: {view: - 1}}, // Order the most view(-1) to least view
            {$project: {title: 1, views: 1}} // the title is for display the name of the recipe and the views of that recipe
        ]);

        //track most created
        const mostCreated = await Recipe.aggregate([
            {
                $group: {
                    _id: '$userId', //group all recipes done by this ObjectId and store in _id
                    totalRecipeMade: {$sum: 1}
                }
            },
            {$sort: {totalRecipeMade: -1}},
            {$project: {userId: '$_id', totalRecipeMade: 1, _id: 0 }}
        ]);

        res.status(200).render('report', { userId, email, fullName, role, home, navBarColor, roleName, invNav });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
})



module.exports = router;
    
//This function is for spliting the word,quantity and unit in the recipe ingredients
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

//Because each role their own link page and their own color
function allRoleNavBar(role, userId, email, fullName){
    let home, navBarColor, roleName, invNav;
    switch (role) {
        case 'Manager':
            home = `/api/manager-page-34890645?userId=${userId}&&email=${email}&&fullName=${fullName}&&role=${role}`
            navBarColor = '#5eb572';
            roleName = 'Manager';
            invNav = '#5eb572';
            break;
        case 'Chef':
            home = `/api/chef-page-34890645?userId=${userId}&&email=${email}&&fullName=${fullName}&&role=${role}`
            navBarColor = '#273befff';
            roleName = 'Chef';
            invNav = '#273befff';
            break;
        case 'Admin':
            home = `/api/admin-page-34890645?userId=${userId}&&email=${email}&&fullName=${fullName}&&role=${role}`
            navBarColor = 'rgb(170, 100, 236)';
            roleName = 'Admin';
            invNav = 'rgb(170, 100, 236)';
            break;
        default:
            navBarColor = '#000000'
    }
    return { home, navBarColor, roleName, invNav }
}


