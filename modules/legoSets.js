//AS TOLD
require('dotenv').config();

const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

  //creating the Theme model
  const Theme = sequelize.define(
    "Theme",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: Sequelize.STRING,
    },
    {
      createdAt: false,
      updatedAt: false,
    }
  );

  //creating the Set model
  const Set = sequelize.define(
    "Set",
    {
      set_num: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      name: Sequelize.STRING,
      year: Sequelize.INTEGER,
      num_parts: Sequelize.INTEGER,
      theme_id: Sequelize.INTEGER,
      img_url: Sequelize.STRING,
    },
    {
      //keep them inactive
      createdAt: false,
      updatedAt: false,
    }
  );
  
  Set.belongsTo(Theme, { foreignKey: "theme_id" });

  //initialize
  function initialize()
   {
    return new Promise((resolve, reject) => {
      sequelize.sync().then(() => 
        {
          resolve();
        })
        .catch((err) => 
        {
          //rejects it, and gives error
          reject(err);
        });
    });
  }

  //get all sets
  function getAllSets() 
  {
    return new Promise((resolve, reject) => 
    {
      //instead finds all of the themes
      Set.findAll({ include: [Theme] })
        .then((sets) => {
          resolve(sets);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  
  //get set by num
  function getSetByNum(number) 
  {
    return new Promise((resolve, reject) =>
     {
      Set.findOne({
        where: { set_num: number },
        include: [Theme],
      })
        .then((set) => 
        {
          if (set) {
            resolve(set);
          } else {
            reject(new Error("not getting the sets requested"));
          }
        })
        .catch((error) => 
        {
          reject(error);
        });
    });
  }
  
  //get set by theme
  function getSetsByTheme(theme) 
  {
    return new Promise((resolve, reject) => 
    {
      Set.findAll({
        include: [Theme],
        where: {
          "$Theme.name$": {
            [Sequelize.Op.iLike]: `%${theme}%`,
          },
        },
      })
        .then((sets) => 
        {
          if (sets.length > 0)
           {
            resolve(sets);
          } else {
            //displays error message
            reject(new Error("not getting the sets requested"));
          }
        })
        .catch((error) => 
        {
          reject(error);
        });
    });
  }

    //getting all themes
    function getAllThemes()
    {
     return new Promise((resolve, reject) => 
     {
       Theme.findAll()
         .then((themes) => 
         {
           resolve(themes);
         })
         .catch((error) =>
          {
           reject(error);
         });
     });
   }

  //adding set
  function addSet(setData) 
  {
    return new Promise((resolve, reject) => 
    {
      Set.create(setData)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  //editing set
  function editSet(number, data)
   {
    return new Promise((resolve, reject) => 
    {
      Set.update(data, {
        where: { set_num: number },
      })
        .then(() => {
          resolve();
        })
        .catch((error) => 
        {
          //using the error message as told
          reject(
            error.errors && error.errors.length > 0
              ? error.errors[0].message
              : "an updating error!"
          );
        });
    });
  }
  
  //deleting set
  function deleteSet(number) 
  {
    return new Promise((resolve, reject) =>
     {
      //uses set model..
      //using destroy to delete the set number
      Set.destroy({
        where: { set_num: number },
      })
        .then(() => {
          resolve();
        })

        //displays error message
        .catch((error) => {
          reject(error.errors[0].message);
        });
    });
  }

  //exporting
  module.exports =
   {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    addSet,
    getAllThemes,
    editSet,
    deleteSet,
  };