const express = require("express");
require("dotenv").config();
const cors = require("cors");

global.__basedir = __dirname;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Middleware
app.use(express.json());

const index = require('./routers/index');
const auth = require('./routers/auth');
const projects = require('./routers/projects');
const apis = require('./routers/apis');

app.use('/', index);
app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/all', apis);

app.use("/assets", express.static(__dirname + "public/assets"));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

