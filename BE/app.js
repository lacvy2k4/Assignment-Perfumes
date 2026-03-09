require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { default: mongoose } = require("mongoose");
var indexRouter = require('./routes/index');
const memberRouter = require("./routes/memberRouter");
const brandRouter = require("./routes/brandRouter")
const commentRouter = require("./routes/commentRouter")
const perfumeRouter = require("./routes/perfumeRouter")
const collectionRouter = require("./routes/collectionRouter")
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

var app = express();
const cors = require('cors');

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

// Swagger Schema Definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Store Perfume API',
      version: '1.0.0',
      description: 'API Documentation for Store Perfume',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Thư mục chứa các API routes để quét docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const connect = mongoose.connect(process.env.MONGO_URI);
connect.then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log(err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', require('./routes/api'));
app.use('/api/members', memberRouter);
app.use('/api/brands', brandRouter);
app.use('/api/comments', commentRouter);
app.use('/api/perfumes', perfumeRouter);
app.use('/api/collectors', collectionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
