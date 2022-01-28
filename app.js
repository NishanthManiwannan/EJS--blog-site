//jshint esversion:6

const express = require("express"),
  bodyParser = require("body-parser"),
  ejs = require("ejs");

const _ = require("lodash");

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//----------------------------------------------------------------------
//------------------- Connecting to mongo -----------------------------
//---------------------------------------------------------------------
const mongoos = require("mongoose");
mongoos.connect(
  "mongodb+srv://ManiNishanth:Gaps01MDB@blog.ymaer.mongodb.net/Blog",
  {
    useNewUrlParser: true,
  }
);

//----------------------- image upload --------------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cd) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cd(null, true);
  } else {
    cd(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const singleFileUpload = async (req, res, next) => {
  try {
    const fileSlice = req.file.path;
    const file = new blogList({
      title: req.body.titleField,
      description: req.body.postField,
      filename: req.file.originalname,
      filePath: fileSlice.slice(7),
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2), //0.00
    });

    file.save();
    res.redirect("/");
    console.log(file);

    res.status(201).send("file upload succeess");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const fileSizeFormatter = (bytes, decimal) => {
  if (bytes === 0) {
    return "0 Bytes";
  } else {
    const dm = decimal || 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return (
      parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) +
      "-" +
      sizes[index]
    );
  }
};
//------------------------------ mongo object schema ---------------------------------------
const blogListSchema = new mongoos.Schema(
  {
    title: {
      type: String,
      required: [true, "Title required"],
    },
    description: {
      type: String,
      require: [true, "Discription required"],
    },
    filename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//---------------- create mongo collection -------------------------
const blogList = mongoos.model("posts", blogListSchema);

app.post("/compose", upload.single("imges"), singleFileUpload);

app.get("/", function (req, res) {
  blogList.find({}, function (err, blogList) {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
        startingContant: homeStartingContent,
        filepath: blogList,
        blogData: blogList,
        blogLength: blogList.length,
      });
    }
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", { startingContant: contactContent });
});

app.get("/about", function (req, res) {
  res.render("about", { startingContant: aboutContent });
});

app.get("/compose", function (req, res) {
  res.render("compose", { startingContant: aboutContent });
});

app.get("/posts/:postId", function (req, res) {
  const requiredId = req.params.postId;

  blogList.findById(requiredId, function (err, blogData) {
    if (err) {
      console.log(err);
    } else {
      res.render("post", {
        // imgFile: blogData.imgFile,
        postTitle: blogData.title,
        postBlog: blogData.description,
      });
    }
  });
});

//=============================== without mongo db ============================
//array for save the blogs
// var blogArray = [];

//routes rendering
// app.get("/", function (req, res) {
//   res.render("home", {
//     startingContant: homeStartingContent,
//     blogData: blogArray,
//     blogLength: blogArray.length,
//   });
// });

// app.get("/contact", function (req, res) {
//   res.render("contact", { startingContant: contactContent });
// });

// app.get("/about", function (req, res) {
//   res.render("about", { startingContant: aboutContent });
// });

// app.get("/compose", function (req, res) {
//   res.render("compose", { startingContant: aboutContent });
// });

// app.get("/posts/:postName", function (req, res) {
//   const requiredTitle = _.lowerCase(req.params.postName);

//   blogArray.forEach(function (data) {
//     const arrayTitleSaved = _.lowerCase(data.blogTitle);

//     if (arrayTitleSaved === requiredTitle) {
//       res.render("post", {
//         imgFile: data.imgFile,
//         postTitle: data.blogTitle,
//         postBlog: data.blogPost,
//       });
//     } else {
//       console.log("fail");
//     }
//   });
// });

//post requestes
// app.post("/compose", function (req, res) {
//   var bolgObject = {
//     blogTitle: req.body.titleField,
//     blogPost: req.body.postField,
//     imgFile: req.body.img,
//   };

//   console.log(bolgObject);
//   blogArray.push(bolgObject);
//   res.redirect("/");
// });

//host server
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
