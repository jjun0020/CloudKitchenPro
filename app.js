const express = require('express');
const path = require('path');
const { connectToMongoDB } = require('./db/connection');
const roleRoutes = require('./routes/sever');

const app = express();
const PORT = process.env.PORT || 8080;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
})

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Bootstrap CSS
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));

// Serve Bootstrap JavaScript
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

// Home route
app.get('/', (req, res) => {
    res.render('add-role');
});

// Routes
app.use('/', roleRoutes);

// Connect to MongoDB and start server
async function startServer() {
    try {
        await connectToMongoDB();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();