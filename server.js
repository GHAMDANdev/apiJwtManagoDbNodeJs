
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());

// اتصال MongoDB
mongoose.connect('mongodb://localhost/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB mydatabase');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// تعريف مودل المستخدم باستخدام Mongoose
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number
});

// Create Account schema and model
const accountSchema = new mongoose.Schema({
    username: String,
    password: String
    
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Account = mongoose.model('Account', accountSchema);

// Middleware للتحقق من صحة JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, 'secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        req.user = user;
        next();
    });
}

// API to login and issue JWT
app.post('/api/login', cors(), async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate username and password
        const user = await User.findOne({ username, password });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }











        // Issue JWT
        const token = jwt.sign({ username }, 'secret-key');
        console.log(token);
        // Return token
        return res.json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



// API to create a new user
app.post('/api/users', (req, res) => {
    const { username, password } = req.body;

    // Create a new user
    const user = new User({ username, password });

    // Save the user to the database
    user.save()
        .then(() => {
            return res.json({ message: 'User created successfully' });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
});

















// API to add accounts
app.post('/api/accounts', authenticateToken, (req, res) => {
    const {username ,  password} = req.body;

    // Create a new account
    const account = new Account({ username , password });
    
    
    // Save the Account to the database
    account.save()
        .then(() => {
            return res.json({ message: 'Account added successfully' });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
});





// API محمية يمكن الوصول إليها بواسطة JWT
app.get('/api/protected', authenticateToken, (req, res) => {
    return res.json({ message: 'Protected API endpoint' });
});

// API to add product
app.post('/api/products', authenticateToken, (req, res) => {
    const { name, price } = req.body;

    // Create a new product
    const product = new Product({ name, price });

    // Save the product to the database
    product.save()
        .then(() => {
            return res.json({ message: 'Product added successfully' });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
});


// API to get all products
app.get('/api/products', authenticateToken, (req, res) => {
    Product.find()
        .then(products => {
            return res.json(products);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
});

// API to get a specific product by ID
app.get('/api/products/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;

    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            return res.json(product);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
});



// API to update a product by ID
app.put('/api/products/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;
    const { name, price } = req.body;

    Product.findByIdAndUpdate(productId, { name, price }, { new: true })
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            console.log(req.body);

            console.log({ name, price });
            return res.json({ message: 'Product updatedddddddddddddd successfully' });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
});

// API to delete a product by ID
app.delete('/api/products/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;

    Product.findByIdAndDelete(productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            return res.json({ message: 'Product deleted successfully' });
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});