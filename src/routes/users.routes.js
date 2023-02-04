const { Router, response } = require('express');

const multer = require("multer");
const uploadConfig = require("../configs/upload");

const UsersController = require("../controllers/UsersController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated")
const UserAvatarController = require("../controllers/UserAvatarController");

const userRoutes = Router();

const upload = multer(uploadConfig.MULTER);

const usersController = new UsersController();
const userAvatarController = new UserAvatarController();

// function myMiddleware(request, response, next){ //Serve para verificar as informações que estão na rota, antes de executar no controller
//     console.log("Você está dentro do MiddleWare");
//     console.log(request.body)

//     if(!request.body.isAdmin){
//         return response.json({ message: "user unauthorized" });
//     }

//     console.log("Foi para o controller");

//     next();
// };

// userRoutes.post("/" , myMiddleware, usersController.create);

userRoutes.post("/" , usersController.create);
userRoutes.put("/", ensureAuthenticated, usersController.update); //:id sera usado no params
userRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), userAvatarController.update);

module.exports = userRoutes;