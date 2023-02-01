//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

mongoose.connect("mongodb+srv://admin-NabazNinja:ninja12345@cluster0.k883yqc.mongodb.net/CarDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("succesfully connected !!");
  }
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const carsSchema = {
  name: String,
  rating: Number,
  review: String
};

const Car = mongoose.model("Car", carsSchema);


const Car1 = new Car({
  name: "BMW",
  rating: 7,
  review: "keshi Qwrsa !"
});

const Car2 = new Car({
  name: "KIA",
  rating: 5,
  review: "mazaya !"
});

const defaultCars = [Car1, Car2];

const listSchema = {
  name: String,
  cars: [carsSchema],
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  Car.find({}, function (err, foundCars) {

    if (foundCars.length === 0) {

      Car.insertMany(defaultCars, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("cars sccesfuly inserted default cars to the DB !");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Cars",
        newListItems: foundCars
      });
    }
  });

});

app.get("/:costumeListName", function (req, res) {
  const costumeListName = _.capitalize(req.params.costumeListName);

  List.findOne({
    name: costumeListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: costumeListName,
          cars: defaultCars,
        });

        list.save();
        res.redirect("/" + costumeListName);
      } else {

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.cars
        });
      }
    }
  });

});



app.post("/", function (req, res) {

  const carName = req.body.newItem;
  const listName = req.body.list;

  const AddedCar = new Car({
    name: carName,
  });

  if (listName === "Cars") {
    AddedCar.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {
      foundList.cars.push(AddedCar);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});


app.post("/delete", function (req, res) {
  const checkedCarID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Cars") {

    Car.findByIdAndRemove(checkedCarID, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("The car has sccesfuly been removed form the Collection!");
        res.redirect("/");
      }
    });
  } else {
   List.findOneAndUpdate({name:listName},{$pull:{cars:{_id:checkedCarID}}},function(err,foundList){
    if(!err){
      console.log("The CostumeListCar has sccesfuly been removed form the Collection!");
      res.redirect("/"+listName);
    }
   });
  }

});


app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
  console.log("Server started sccesfuly");
});