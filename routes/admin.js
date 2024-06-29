const express = require("express");
const Router = express.Router();
const user = require("../models/user");
const data = require("../mockdata.json")


Router.get("/",(req,res )=>{
    res.json(data)
} )

module.exports = Router;
