require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const nodemailer = require("nodemailer")
const _ = require("lodash")

const mongoose = require("mongoose")
const app = express()
mongoose.set("strictQuery", true)
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
const blog_name = "blogsfromheart🎸"

// mongoose.connect(process.env.MONGO_URI)  // use this when deploying 👈
mongoose.connect('mongodb://127.0.0.1:27017/');

const blogSchema = new mongoose.Schema({
    heading_photo: String,
    heading_photo_alt: String,
    heading_data: String,
    post_link: String,

    img1_data: String,
    img1_alt: String,
    post1_data: String,

    img2_data: String,
    img2_alt: String,
    post2_data: String,

    img3_data: String,
    img3_alt: String,
    post3_data: String,

    current_date: String,
})

const Blog = mongoose.model("Blog", blogSchema)


app.get("/", async function (req, res) {
    try {
        const blogs = await Blog.find({}).exec();
        if (blogs.length === 0) {
            res.render("home", {
                data: blogs,
                page_title_name: blog_name,
            });
        } else {
            res.render("home", {
                data: blogs,
                page_title_name: blog_name,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/" + process.env.COMPOSE, (req, res) => {
    res.render("compose", {
        blogTitless: "Compose",
        page_title_name: "COMPOSE 📝",
    })
})

app.post("/" + process.env.COMPOSE, (req, res) => {
    const title_photo = req.body.title_photo
    const title_photo_ALT = req.body.title_photo_ALT

    const title = req.body.title
    const link = _.kebabCase(req.body.title)

    const img1 = req.body.img1_link
    const img1_ALT = req.body.img1_ALT
    const post1 = req.body.post1_text

    const img2 = req.body.img2_link
    const img2_ALT = req.body.img2_ALT
    const post2 = req.body.post2_text

    const img3 = req.body.img3_link
    const img3_ALT = req.body.img3_ALT
    const post3 = req.body.post3_text

    const cdate = req.body.current_DATE

    // Let's save the data coming from compose to database...✈️

    const new_post = new Blog({
        heading_photo: title_photo,
        heading_photo_alt: title_photo_ALT,
        heading_data: title,
        post_link: link,

        img1_data: img1,
        img1_alt: img1_ALT,
        post1_data: post1,

        img2_data: img2,
        img2_alt: img2_ALT,
        post2_data: post2,

        img3_data: img3,
        img3_alt: img3_ALT,
        post3_data: post3,

        current_date: cdate,
    })
    new_post.save()
    res.redirect("/")
})
app.get("/post", (req, res) => {
    res.redirect("/")
})


app.get("/post/:postName", async (req, res) => {
    const demand_postName = _.kebabCase(req.params.postName);

    try {
        const post = await Blog.find({ post_link: demand_postName }).exec();
        if (!post || post.length === 0) {
            res.render("404", { page_title_name: demand_postName });
        } else {
            const relatedPosts = await Blog.find({ post_link: { $ne: demand_postName } }).exec();

            res.render("post", {
                blogg_post: post,
                related_posts: relatedPosts,
                page_title_name: demand_postName,
            });
        }
    } catch (err) {
        console.error(err);
        res.render("404");
    }
});


app.get("/about", (req, res) => {
    res.render("about", { page_title_name: "About me 🧑‍🚀" })
})

app.get("/contact", (req, res) => {
    res.render("contact", {
        action: "/contact",
        page_title_name: "Contact me 🛰️",
    })
})

app.post("/contact", (req, res) => {
    const user_data = {
        name: req.body.user_name,
        email: req.body.user_email,
        message: req.body.user_message,
    }

    var transporter = nodemailer.createTransport({
        service: process.env.Email_provider,
        auth: {
            user: process.env.MY_EMAIL,
            pass: process.env.MY_PASS,
        },
    })
    var mailOptions = {
        from: process.env.MY_EMAIL,
        to: process.env.TO_EMAIL,
        subject: "Blog website new user 👉 " + user_data.name,
        text:
            "Client_name: " +
            user_data.name +
            "\n\n" +
            "Email: " +
            user_data.email +
            "\n\n" +
            "message: " +
            user_data.message,
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            res.render("failure", { Name: user_data.name })
        } else {
            res.render("success", { Name: user_data.name })
        }
    })
})

// ------------DELETE------------

app.get("/" + process.env.DELETE, (req, res) => {
    Blog.find({}, function (err, blogs) {
        if (!err) {
            res.render("delete", {
                blog_data: blogs,
                page_title_name: "DELETE ☣️",
            })
        }
    })
})

app.post("/" + process.env.DELETE, (req, res) => {
    const delete_id = req.body.wanna_delete_id
    console.log(delete_id)

    Blog.deleteOne({ _id: delete_id }, (err) => {
        if (!err) {
            console.log("successfully deleted the chosen blog post.")
        }
    })
    res.redirect("/" + process.env.DELETE)
})

//----------404 error handler----------

app.use((req, res, next) => {
    res.status(404)

    // respond with html page
    if (req.accepts("html")) {
        res.render("404", { url: req.url, page_title_name: "404 page ☄️" })
        return
    }

    // respond with json
    if (req.accepts("json")) {
        res.send({ error: "Not found" })
        return
    }
    res.type("txt").send("Not found")
})

// Define a 404 page
app.get("*", (req, res) => {
    res.status(404).render("404", {
        title: "404",
        message: "Page not found",
    })
})

app.listen(process.env.PORT || 5000, () => {
    console.log("Server started on port 5000")
})
