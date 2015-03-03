exports.partials = function(req, res){
    var filename = req.params.filename;
    if(!filename) return;  // might want to change this
    console.log("WE WANT " + filename);
    res.render("partials/" + filename );
};
