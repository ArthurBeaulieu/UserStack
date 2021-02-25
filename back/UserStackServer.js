/* App requirements */
const express = require('express');
const handlebars = require('express-handlebars');
const i18n = require('i18n');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const { authMiddleware } = require('./middlewares');
const Logger = require('./utils/Logger');


global.Logger = new Logger({
  debug: true
});

global.Logger.info('Starting UserStack server...');
const mzk = express();
mzk.use(express.static('assets'));
mzk.use(cors({
  origin: 'http://localhost:3001'
}));
mzk.use(bodyParser.json());
mzk.use(bodyParser.urlencoded({ extended: true }));
mzk.use(cookieParser());


/* DB section */
const db = require('./models');
const dbConfig = require('./config/db.config');
const Role = db.role;


/* i18n */
i18n.configure({
  locales: ['en', 'fr'],
  cookie: 'locale',
  directory: path.join(__dirname, '../assets/locales'),
  defaultLocale: 'en'
});


/* Template engine */
mzk.set('view engine', 'handlebars');
mzk.set('views', `${__dirname}/views`);
mzk.engine('handlebars', handlebars({
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
mzk.use(i18n.init);


/* Routing */
require('./routes/app.routes')(mzk);
require('./routes/auth.routes')(mzk);
require('./routes/user.routes')(mzk);
require('./routes/admin.routes')(mzk);


db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    global.Logger.info('Connection to MongoDB successful');
    initial().then(() => {
      /* Server starting */
      mzk.listen(3000, () => {
        global.Logger.info('UserStack server is ready to operate!');
      });

      process.on('SIGINT', function() {
        global.Logger.info('Gracefully UserStack server');
        process.exit()
      });
    });
  })
  .catch(err => {
    global.Logger.error(`Unable to connect to the database : ${err}`);
    global.Logger.error('Gracefully UserStack server');
    process.exit();
  });


const initial = () => {
  return new Promise(resolve => {
    global.Logger.info('Check if the database model is complete');
    const promises = [];
    // Check user roles collection
    promises.push(new Promise(resolve => {
      Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
          global.Logger.info('UserStack model is up to date');
          new Role({
            name: 'user'
          }).save(err => {
            if (err) { global.Logger.error(`Unable to add User role to the roles collection : ${err}`); }
            global.Logger.info('User role has been added to the roles collection');
          });
          new Role({
            name: 'moderator'
          }).save(err => {
            if (err) { global.Logger.error(`Unable to add Moderator role to the roles collection : ${err}`); }
            global.Logger.info('Moderator role has been added to the roles collection');
          });
          new Role({
            name: 'admin'
          }).save(err => {
            if (err) { global.Logger.error(`Unable to add Admin role to the roles collection : ${err}`); }
            global.Logger.info('Admin role has been added to the roles collection');
          });
        }
        global.Logger.info('Roles collection is up to date');
        resolve();
      });
    }));
    Promise.all(promises).then(() => {
      global.Logger.info('Database model is complete');
      resolve();
    });
  });
};