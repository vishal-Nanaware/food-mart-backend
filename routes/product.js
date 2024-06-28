const express = require('express')
const router = express.Router()
const data = require("../mockdata.json")


router.post("/", (req,res)=>{
    let quary = req.body.quary

    res.json(data[quary])
    console.log("send")
})

router.post('/id',(req,res)=>{
    const id = req.query.id
    console.log(typeof id)
    let [category, pid] =[ Number(id.charAt(0)), Number(id.charAt(1))]
    console.log(`category ${category} pid ${pid}`)
    let product = data[category].find(item=> item.id === id)
    // console.log(product)
    res.json(product)
})

module.exports = router;