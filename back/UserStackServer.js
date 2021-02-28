const logger = require('./utils/logger');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');
const path = require('path');
const handlebars = require('express-handlebars');
const db = require('./models');
const dbConfig = require('./config/db.config');
const utils = require('./utils/server.utils');


// Create Logger instance and attach it to the global object to make it available app-wide
global.Logger = new logger({
  debug: true
});


// Express configuration for server
global.Logger.info('Starting UserStack server...');
const app = express();
app.use(express.static('assets'));
app.use(cors({ origin: 'http://localhost:3001' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


// i18n translation configuration
global.Logger.info('Configuring i18n engine');
i18n.configure({
  locales: ['en', 'fr'],
  cookie: 'locale',
  directory: path.join(__dirname, '../assets/locales'),
  defaultLocale: 'en',
  objectNotation: true
});
app.use(i18n.init);


// Handlebars template engine configuration
global.Logger.info('Configuring template rendering engine');
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);
app.engine('handlebars', handlebars({
  defaultLayout: 'index',
  layoutsDir: `${__dirname}/views/layouts`,
  partialsDir: `${__dirname}/views/partials`,
  helpers: {
    i18n: () => {
      return i18n.__.apply(this, arguments);
    },
    __n: () => {
      return i18n.__n.apply(this, arguments);
    }
  }
}));


// App urls routing
global.Logger.info('Reading routes to be used by client');
require('./routes/app.routes')(app);
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/admin.routes')(app);


// Database connection and app starting
global.Logger.info('Connecting server to the database');
db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  global.Logger.info('Connection to MongoDB successful');
  // Perform initial sequence to check for proper collection
  utils.initSequence().then(() => {
    // Start listening for events on port 3000
    app.listen(3000, () => {
      global.Logger.info('UserStack server is ready to operate!');
    });
    // Add listener on kill process to properly log before exit
    process.on('SIGINT', () => {
      global.Logger.info('Gracefully stopping UserStack server');
      process.exit();
    });
  }).catch(err => {
    global.Logger.error(`Unable to update database model : ${err}`);
    global.Logger.error('Gracefully stopping UserStack server');
    process.exit();
  });
}).catch(err => {
  global.Logger.error(`Unable to connect to the database : ${err}`);
  global.Logger.error('Gracefully stopping UserStack server');
  process.exit();
});
