var express              = require('express'),
    router               = express.Router({mergeParams:true}),
    Campground           = require('../models/campground'),
    Comment              = require('../models/comment'),
    isLoggedInMiddleware = require("../middleware/isLoggedIn"),
    commentAuthorization = require("../middleware/commentAuthorization");


//// NEW Comment ////
router.get("/new", isLoggedInMiddleware,function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
       }
       else{
        console.log("Found Campground");
        res.render("comments/new",{campground:campground}); 
       }
    });

});

//// CREATE Comment ////
router.post("/", isLoggedInMiddleware ,function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       }
       else{
        console.log("Found Campground");
        
        Comment.create(req.body.comment, function(err, comment){
            if(err){
                console.log("error while attempting to add comment");
                console.log(err);
            }
            else{
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                comment.save();
                campground.comments.push(comment);
                campground.save();
                console.log("Succesfully added comment:" + comment.author.username);
                res.redirect("/campgrounds/" + campground._id);
            }
        });
       }
    });
});

//// EDIT Comments ////
router.get("/:comment_id/edit", commentAuthorization, function(req, res){
    var campgroundId = req.params.id;
    Comment.findById(req.params.comment_id, function(err,foundComment){
        if(err){
            console.log("error finding comment to edit...");
            console.log(err);
            res.redirect("back");
        }
        else{
            res.render("comments/edit",{comment:foundComment, campgroundId:campgroundId});  
        }
    }); 
});

//// UPDATE Comments ////
router.put("/:comment_id", commentAuthorization, function(req, res){
    var commentId    = req.params.comment_id,
        comment      = req.body.comment,
        campgroundId = req.params.id;
        
    Comment.findByIdAndUpdate(commentId, comment, function(err, Updatedcomment){
      if(err){
          console.log("error updating comment...");
          console.log(err);
      }
      else{
        console.log("comment successfully updated");  
        res.redirect("/campgrounds/" + campgroundId );   
      }
    });    
});

//// DELETE Comments ////
router.delete("/:comment_id", commentAuthorization, function(req,res){
    var commentId    = req.params.comment_id,
        campgroundId = req.params.id;
        
    Comment.findByIdAndRemove(commentId, function(err, comment){
        if(err){
            console.log("failed to delete comment...");
            console.log(err);
        }
        else{
            console.log("comment successfully deleted");
            req.flash('success', 'Comment was deleted')
            res.redirect("/campgrounds/" + campgroundId);
        }
    });

});

module.exports = router;