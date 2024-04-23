/*********************************************************************************
 *  WEB322 – Assignment 05*
 * I declare that this assignment is my own work in accordance with Seneca's*
 *  Academic Integrity Policy:** https://www.senecacollege.ca/about/policies/academic-integrity-policy.html*
 * Name: _____Abbas Hussein_________________ 
 * Student ID: ___134246222___________ 
 * Date: _____4/10/2024_________
 * *********************************************************************************/

const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
//added
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});


app.get("/lego/sets", async (req,res)=>{

  let sets = [];

  try{    
    if(req.query.theme){
      sets = await legoData.getSetsByTheme(req.query.theme);
    }else{
      sets = await legoData.getAllSets();
    }

    res.render("sets", {sets})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
  
});


app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", {set})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
});

//FOR ADDING SET

app.get("/lego/addSet", (req, res) => {
  legoData
    .getAllThemes()
    //given
    .then((themeData) => {
      res.render("addSet", { themes: themeData });
    })
    .catch((error) => {
      res.send("Could not add a set");
    });
});

app.post("/lego/addSet", (req, res) => {
  legoData
  //as said
    .addSet(req.body)
    .then(() => {
      //redirects here
      res.redirect("/lego/sets");
    })
    .catch((error) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error.message}`,
      });
    });
});


//EDITING SET

//edited in the set and not sets
app.get("/lego/editSet/:num", (req, res) => 
{
  const num = req.params.num;
  //gets all theme,
  Promise.all([legoData.getSetByNum(num), legoData.getAllThemes()])
    .then(([set, themes]) => 
    {
      res.render("editSet", { themes: themes, set: set });
    })
    .catch((error) => 
    {
      //displays error message
      res.status(404).render("404", { message: error.message });
    });
});


app.post("/lego/editSet", (req, res) =>
 {
  legoData
    .editSet(req.body.set_num, req.body)
    .then(() => {
      //redirecting to sets
      res.redirect("/lego/sets");
    })

    //diplays following error message
    .catch((error) => 
    {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
    });
});

//DELETING SET
app.get("/lego/deleteSet/:num", (req, res) => 
{
  legoData
    .deleteSet(req.params.num)
    .then(() => {
      //once deleted, redirects it to the sets
      res.redirect("/lego/sets");
    })
    .catch((error) => 
    {
      //displays error message as told
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
    });
});

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});