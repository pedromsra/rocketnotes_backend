const {hash, compare} = require('bcryptjs');

const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite");

class UsersController {
    //Um controller deve conter no máximo 5 métodos (funções)
    //1. index - GET para listar vários registros
    //2. show - GET para exibir um registro específico
    //3. create - POST para criar um registro
    //4. update - POST para atualizar um registro
    //5. delete - DELETE para remover um registro

    async create(request, response) {
        //Pega name, email e password do corpo da requisião (poderia ser um input)
        const {name, email, password} = request.body;
        //Conecta-se com o banco de dados
        const database = await sqliteConnection();
        //verifica se o email já é de algum usuário cadastrado
        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);
        if(checkUserExists) {
            throw new AppError("Email já cadastrado");
        }
        //Aplica criptografia na senha
        const hashedPassword = await hash(password, 8)
        //Adiciona os valores obtidos da requisição ao database
        await database.run(
            "INSERT INTO users (name, email, password) VALUES (?,?,?)", [name, email, hashedPassword]
        );
        //Após concluída as etapas de criação, retorna um http status 201
        return response.status(201).json();
    }

    async update(request, response) {
        const { name, email, password, oldPassword } = request.body;
        const user_id = request.user.id;

        const database = await sqliteConnection();
        
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);

        if(!user) {
            throw new AppError("Usuário não encontrado");
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){ //se o email que quero definir existe e não é no meu id, alerta que o email já está em uso
                throw new AppError("Email já está em uso");
        }

        user.name = name ?? user.name; //se tiver conteudo em name, usar name, se não, usar user.name (manter o name antigo)
        user.email = email ?? user.email; //nullish operator

        if (password && !oldPassword){
            throw new AppError("Você precis informar a senha antiga para definir a nova senha!");
        }

        if (password && oldPassword){
            const checkOldPassword = await compare(oldPassword, user.password);

            if(!checkOldPassword){
                throw new AppError("A senha antiga não confere")
            }

            user.password = await hash(password, 8)

        }

        await database.run(`
        UPDATE users SET 
        name = ?, 
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
        [user.name, user.email, user.password, user_id]
        );

        return response.status(200).json()

    }
}
module.exports = UsersController;