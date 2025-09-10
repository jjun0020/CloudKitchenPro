const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    recipeId: {
        type: String,
        default: generateUserId,
        unique: true,
        required: true,
        match: [/^R-\d{5}$/, 'Recipe Id must be R-XXXXX']
    },
    userId: [{ 
                type: mongoose.Schema.Types.ObjectId, //objectId is like a primary key
                ref: "Role" 
    }],
    title: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    chef: {
        type: String,
        required: true,
        minlength: [2, 'Chef must be at least 2 characters'],
        maxlength: [50, 'Chef cannot exceed 50 characters'],
        match: [/^[A-Za-z\s'-]+$/, 'Please enter a valid chef Name']
    },
    ingredients: [{
        type: [{
            ingredientName: { type: String, required: true },
            quantity: { type: Number, required: true },
            unit: { type: String, required: true }
        }],
        required: true,
        validate: [{
            validator: function (array) {
                return array.length >= 1 && array.length <= 20
            },
            message: "Instruction must contain 1 to 20 steps"
        }, {
            validator: function (array) {
                return array.every(step => step.ingredientName.length >= 3);
            },
            message: "Instructions must have at least 3 characters"
        }]
    }],
    instructions: [{
        type: [String], //array of string
        required: true,
        validate: [{
            validator: function(array){
                return array.length >= 1 && array.length <= 15
            },
            message: "Instruction must contain 1 to 15 steps"
        }, {
            validator: function(array){
                return array.every(step => step.length >= 10);
            },
            message: "Instructions must have at least 10 characters"
        }]
    }],
    mealType: {
        type: String,
        required: [true, 'mealType is required'],
        enum: {
            values: ['Dinner', 'Breakfast', 'Lunch', 'Snack'],
            message: 'Please select a valid meal Type'
        }
    },
    cuisineType: {
        type: String,
        required: [true, 'cuisineType is required'],
        enum: {
            values: ['Italian', 'Asian', 'Mexican'],
            message: 'Please select a valid cuisine Type'
        }
    },
    prepTime: {
        type: Number,
        minlength: [1, 'Prep time must be at least 1 min'],
        maxlength: [480, 'Prep time cannot exceed 480 min'],
    },
    difficulty: {
        type: String,
        required: [true, 'difficulty is required'],
        enum: {
            values: ['Easy', 'Medium', 'Hard'],
            message: 'Please select a valid cuisine Type'
        }
    },
    servings: {
        type: Number,
        minlength: [1, 'servings must be at least '],
        maxlength: [20, 'servings cannot exceed 20'],
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});



const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;

let id = 0;
function generateUserId() {
    id++
    let recipeId = id.toString().padStart(5, "0");
    return "R-" + recipeId;
};
