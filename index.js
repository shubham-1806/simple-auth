const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const Token_Secret = "PleaseMakeABetterSecret";
var cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(cors());

const mongoString = "mongodb://localhost:27017/student_details";

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
    console.log(error);
});

database.once("connected", () => {
    console.log("Database Connected");
});

const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String,
    },
});

const Student = mongoose.model("Student", dataSchema);

const verify_token = (req, res, next) => {
    try{
        console.log(req.headers);
        let token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, Token_Secret, (err, payload) => {
            if (err) {
                res.status(401).send("Token Issue");
            } else {
                next();
            }
        });
    }catch(error){
        console.log(error);
        res.status(401).send("Token Issue");
    }
};

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "welcome!",
    });
});

app.post("/register", async (req, res) => {
    try {
        console.log(req.body);
        //see if already exists
        const student = await Student.findOne({ name: req.body.name });
        if (student) {
            return res.status(400).json({ message: "Student already exists" });
        }
        const new_student = await Student.create({
            name: req.body.name,
            password: req.body.password,
        });
        const token = jwt.sign({ name: new_student.name }, Token_Secret, {
            expiresIn: "7d",
        });
        return res.status(200).json({ token: token });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const student = await Student.findOne({
            name: req.body.name,
            password: req.body.password,
        });
        if (student) {
            const token = jwt.sign({ name: student.name }, Token_Secret, {
                expiresIn: "7d",
            });
            res.status(200).json({ token: token });
        } else {
            res.status(400).json({ message: "Invalid Credentials" });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

app.get("/students", verify_token, async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

app.listen(3000, () => {
    console.log(`Server Started at ${3000}`);
});
