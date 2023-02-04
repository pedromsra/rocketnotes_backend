const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

function ensureAuthenticated(request, response, next) {
    const authHeader = request.headers.authorization;

    if(!authHeader){
        throw new AppError("JWT Token não informado", 401)
    }

    const [, token] = authHeader.split(" ");

    try {
        const {sub: user_id} = verify(token, authConfig.jwt.secret) //sub: user_id é desestruturando de verify e renomeando (alies, passar a chamar de) para user_id

        request.user = {
            id: Number(user_id)
        }

        return next();
    } catch {
        throw new AppError("JWT Token invalido")
    }
}

module.exports = ensureAuthenticated;