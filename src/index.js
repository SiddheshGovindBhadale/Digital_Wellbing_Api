const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(`mongodb+srv://Siddhesh:Siddhesh3341@cluster0.cn61z.mongodb.net/Hi?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
}).then(() => {
  console.log("connection succesful")
}).catch((e) => {
  console.log("No connection with Database !!!")
  console.log(e)
})

// User Model
const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
});

// Middleware
app.use(bodyParser.json());
app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))
app.use(cors({
  origin: "*"
}))

//testing
app.get('/', async (req, res) => {
  try {
      res.status(200).json({ success: 'Api is running' });
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Registration Endpoint
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user with the same email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  // Save the user to the database
  try {
    await newUser.save();
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  // If user not found or password is incorrect
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Successful login
  res.status(200).json({ message: 'Login successful', userData: user });
});


// get user by id
app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
