var express                 = require('express'),
    router                  = express.Router(),
    Campground              = require('../models/campground'),
    isLoggedInMiddleware    = require("../middleware/isLoggedIn"),
    campgroundAuthorization = require("../middleware/campgroundAuthorization");

//// Index Campgrounds ////
router.get("/", function(req, res){
    Campground.find({}, function(err,campgrounds){
       if(err){
         console.log(err);  
       }
       else{
         res.render("campgrounds/index", {campgrounds:campgrounds}) ;
       }
    });
});

//// Create Campground ////
router.post("/", isLoggedInMiddleware, function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var newCampground = {
      name: name, 
      image:image, 
      description:description,
      author : {
          id: req.user._id,
          username: req.user.username
      }
  };
  
  Campground.create(newCampground, function(err, campground) {
    if(err){
      console.log(err);
    }
    else{
      console.log("New campground added to db");
      res.redirect("/campgrounds");  
    }
  });
});

//// New Campground ////
router.get("/new", isLoggedInMiddleware, function(req, res){
    res.render("campgrounds/new"); 
});

//// SHOW Campground ////
router.get("/:id", function(req, res) {
   Campground.findById(req.params.id).populate("comments").exec(function(err, campground) {
       if(err){
         console.log(err);
       }
       else{
         console.log("found Campground: " + campground.name);
         res.render("campgrounds/show", {campground: campground});
       }
   }); 
});

//// EDIT Campground ////
router.get("/:id/edit", campgroundAuthorization, function(req, res) {
    Campground.findById(req.params.id, function(err,foundCampground){
        if(err){
           console.log("error finding campground to edit...");
           console.log(err);
        }
        else{
          res.render("campgrounds/edit",{campground:foundCampground});  
        }
    });
});

//// UPDATE Campground ////
router.put("/:id", campgroundAuthorization, function(req, res){
    var id         = req.params.id,
        campground = req.body.campground;
        
    Campground.findByIdAndUpdate(id, campground, function(err, campground){
      if (err){
        console.log("error while attempting to find campground");
        console.log(err);
        res.redirect("/campgrounds");
      }
      else{
        console.log("campground successfully updated");  
        res.redirect("/campgrounds/" + id );  
      }
    });    
});

//// DESTROY Campground ////
router.delete("/:id", campgroundAuthorization, function(req, res){
    var id= req.params.id;
    Campground.findByIdAndRemove(id,function(err){
        if(err){
          console.log("failed to delete campground...");
          console.log(err);
          res.redirect("/campgrounds");
        }
        else{
          console.log("campground successfully deleted");
          res.redirect("/campgrounds"); 
        }
    });
});





module.exports = router;

