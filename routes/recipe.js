const express = require('express');
const Recipe = require('../models/Recipe');
const router = express.Router();


//GET to the recipe page
router.get("/api/add-recipes-34890645", function (req, res) {
    res.render('add-recipes');
});

router.post("/addRecipe", async function (req, res) {
    try {
        const { recipeId, title, chef, Instructions, mealType, cuisineType, prepTime, difficulty, servings, createdDate } = req.body;
        const ingredientInput = req.body.ingredients.join("\n"); // join all textarea lines
        const nameIngredients = splitWord(ingredientInput);
        const newRecipe = new Recipe({
            recipeId,
            userId: [req.body.userId],
            title,
            chef,
            ingredients: nameIngredients,
            Instructions,
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

router.get('/', async function (req, res) {
    try {
        const recipes = await Recipe.find({});
        res.render('view-recipes', { recipes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

function splitWord(input) {
    input = input.trim(); //remove the space, incase uer put it in
    const words = input.split(/,|\n/); //make the input into an array
    let ingredientNameParts = []; //this is to store actual words e.g eggs
    let number = 0;
    let unit = "";
    const units = ["g", "kg", "ml", "l"]; // unit

    for (let word of words) { // reference:https://www.w3schools.com/js/js_loop_forof.asp
        if (!isNaN(word) && word !== "") {   //NaN is not a Number reference: https://www.w3schools.com/jsref/jsref_isnan.asp
            number = parseInt(word)          //store in the number              
        } else if (units.includes(word.toLowerCase())) {
            unit = word
        } else {
            ingredientNameParts.push(word);
        }
    };

    return {
        ingredientName: ingredientNameParts.join(" "), //making it into a single string
        quantity: number,
        unit: unit
    }
}

module.exports = router;