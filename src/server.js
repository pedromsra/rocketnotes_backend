require("dotenv/config");
require("express-async-errors");
const migrationsRun = require("./database/sqlite/migrations");
const AppError = require("./utils/AppError");
const uploadConfig = require("./configs/upload");
const cors = require("cors"); //para que o backend possa atender as requsiçãoes do front end

const express = require("express");

const routes = require("./routes"); //routes

const app = express();

app.use(cors());

app.use(express.json());

app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER))

app.use(routes) //routes

migrationsRun()

app.use(( error, request, response, next ) => {
    if(error instanceof AppError){
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        });
    };

    console.log(error);

    return response.status(500).json({
        status: "error",
        message: "Internal server error"
    })

});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));