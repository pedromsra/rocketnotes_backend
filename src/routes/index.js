const {Router} = require("express");

const userRoutes = require("./users.routes")
const noteRoutes = require("./notes.routes")
const tagRoutes = require("./tags.routes")
const sessionsRoutes = require("./sessions.routes")

const routes = Router()

routes.use("/users", userRoutes)
routes.use("/notes", noteRoutes)
routes.use("/tags", tagRoutes)
routes.use("/sessions", sessionsRoutes)

module.exports = routes;