const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists with absolute path
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory at:', uploadsDir);
    fs.mkdirSync(uploadsDir);
}

// Configure multer for all image types
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('Saving file to:', uploadsDir);
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        // Keep the original file extension
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + ext;
        console.log('Generated filename:', uniqueName);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Received file:', file.originalname, 'Type:', file.mimetype);
    // Accept common image formats
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP, BMP)'), false);
    }
};

const uploadMiddleware = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
});

const salt = bcrypt.genSaltSync(10);
const secret = 'mysecretkey';

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({credentials:true, origin:'http://localhost:3000'}));

// MongoDB connection
mongoose.connect('mongodb+srv://basilvshaiju:iPoKBLjijVR6fS7p@cluster0.av32c.mongodb.net/blog?retryWrites=true&w=majority')
.then(() => {
    console.log('Connected to MongoDB Atlas successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Register endpoint
app.post('/register', async (req,res) => {
    const {username,password} = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch(e) {
        console.error('Registration error:', e);
        res.status(400).json(e);
    }
});

// Login endpoint
app.post('/login', async (req,res) => {
    const {username,password} = req.body;
    try {
        const userDoc = await User.findOne({username});
        if (!userDoc) {
            return res.status(400).json('User not found');
        }
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
                if (err) throw err;
                res.cookie('token', token).json({
                    id:userDoc._id,
                    username,
                });
            });
        } else {
            res.status(400).json('wrong credentials');
        }
    } catch(err) {
        console.error('Login error:', err);
        res.status(500).json('Error during login');
    }
});

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    if (!token) {
        return res.status(401).json('no token');
    }
    jwt.verify(token, secret, {}, (err,info) => {
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    console.log('Received post request');
    const {token} = req.cookies;
    
    if (!token) {
        console.log('No authentication token found');
        return res.status(401).json('Not authenticated');
    }

    try {
        const {file} = req;
        console.log('File object:', file);
        
        if (!file) {
            console.log('No file provided in request');
            return res.status(400).json('No image file provided');
        }

        // Verify user from token
        jwt.verify(token, secret, async (err, info) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(401).json('Invalid token');
            }

            console.log('User verified:', info);
            const {title, summary, content} = req.body;
            console.log('Post data:', {title, summary, contentLength: content?.length});
            
            try {
                // Store only the filename in the database
                const postDoc = await Post.create({
                    title,
                    summary,
                    content,
                    cover: 'uploads/' + file.filename, // Update the path format
                    author: info.id,
                });
                
                console.log('Post created successfully:', postDoc);
                res.json(postDoc);
            } catch (error) {
                console.error('Error creating post in database:', error);
                res.status(500).json('Error creating post');
            }
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json('Error processing upload');
    }
});

app.get('/post', async (req,res) => {
    console.log('Received GET request for posts');
    try {
        console.log('Attempting to fetch posts from database...');
        const posts = await Post.find()
            .populate('author', ['username'])
            .sort({createdAt: -1});
        console.log('Successfully fetched posts:', posts);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
});

app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const postDoc = await Post.findById(id).populate('author', ['username']);
        if (!postDoc) {
            return res.status(404).json({ message: 'Post not found' }); // Return a JSON error message
        }
        res.json(postDoc); // Ensure this is valid JSON
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Error fetching post' }); // Return a JSON error message
    }
});

app.put('/post/:id', uploadMiddleware.single('file'), (req, res) => {
    const { id } = req.params;
    const { title, summary, content } = req.body;
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    jwt.verify(token, secret, async (err, info) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        try {
            const postDoc = await Post.findById(id);
            if (!postDoc) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Ensure the logged-in user is the author
            if (postDoc.author.toString() !== info.id) {
                return res.status(403).json({ message: 'You are not the author of this post' });
            }

            postDoc.title = title;
            postDoc.summary = summary;
            postDoc.content = content;

            if (req.file) {
                postDoc.cover = 'uploads/' + req.file.filename; // ✅ This saves relative path
            }

            await postDoc.save();
            res.json(postDoc);
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ message: 'Error updating post' });
        }
    });
});

app.delete('/post/:id', (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;
  
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
  
    jwt.verify(token, secret, async (err, info) => {
      if (err) return res.status(401).json({ message: 'Invalid token' });
  
      try {
        const postDoc = await Post.findById(id);
        if (!postDoc) {
          return res.status(404).json({ message: 'Post not found' });
        }
  
        // Only author can delete
        if (postDoc.author.toString() !== info.id) {
          return res.status(403).json({ message: 'Unauthorized to delete this post' });
        }
  
        await postDoc.deleteOne();
        res.json({ message: 'Post deleted successfully' });
      } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
      }
    });
  });
  


app.listen(4000, () => {
    console.log('Server running on port 4000');
});

//basilvshaiju
//iPoKBLjijVR6fS7p
//mongodb+srv://basilvshaiju:iPoKBLjijVR6fS7p@cluster0.av32c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0