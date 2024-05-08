var express = require('express')
var app = express()

var router = express.Router()

router.use("/create", (req, res) => res.send("response 1"))
router.use("/:id", (req, res) => res.send(`Товар ${req.params.id}`))
router.use("/", (req, res) => res.send("response 2"))

app.use("/products", router)

app.use("/about", (req, res)=> res.send("О сайте"))
app.use("/", (req, res)=> res.send("Главная страница"))

var cb0 = function (req, res, next) {
    console.log('CB0')
    next();
};

var cb1 = function (req, res, next) {
    console.log('CB1')
    next();
};

var cb2 = function (req, res, next) {
    console.log('CB2');
    next()
};

app.get('/arr', [cb0, cb1, cb2], function(req, res, next){
    console.log("the response will be sent by the next function ...")
    next()
},
(req, res) => res.send('Hello Node')
)

app.listen(3000, function(){
    console.log("Example app listening on port 3000!")
})