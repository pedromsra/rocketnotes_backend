const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class NotesController{

    async create (request, response) {
        const { title, description, tags, links } = request.body;

        if (!title) {
            throw new AppError("Digite o título da nota");
        }

        if (!description) {
            throw new AppError("Digite a descrição da nota");
        }

        const user_id = request.user.id;

        //Quando cadastra vvvvvvvvvvvvvvvvvvvvvvvv usando const note_id = await.... alem de inserir em notes, tambem retorna o id da nota cadastrada
        const note_id = await knex("notes").insert({
            title,
            description,
            user_id
        });

        const linksInsert = links.map(link => {
            return {
                note_id,
                url: link,
            };
        });

        await knex("links").insert(linksInsert);

        const tagsInsert = tags.map(name => {
            return {
                note_id,
                user_id,
                name
            };
        });

        await knex("tags").insert(tagsInsert);

        return response.json();
    }

    async show(request, response) {
        const { id } = request.params;

        const note = await knex("notes").where({id}).first();
        const tags = await knex("tags").where({note_id:id}).orderBy("name");
        const links = await knex("links").where({note_id:id}).orderBy("created_at")

        return response.json({
            ...note,
            tags,
            links
        })
    }

    async delete(request, response) {
        const {id} = request.params;
        console.log(id)
        await knex("notes").where({id}).delete();

        return response.json()
    }

    async index(request, response) {
        const {title, tags} = request.query;

        const user_id = request.user.id;

        let notes;

        if (tags) {
            const filterTags = tags.split(',').map(tag => tag.trim());
            notes = await knex("tags")
            .select([
                "notes.id",
                "notes.title", //Buscando informações de notes, por isso o "notes."... (informação que terá na array de resultado)
                "notes.user_id"
            ])
            .where("notes.user_id", user_id)//informação dentro da innerJoin
            .whereLike("notes.title", `%${title}%`)//informação dentro da innerJoin
            .whereIn("name", filterTags) //informação dentro da innerJoin
            .innerJoin("notes", "notes.id", "tags.note_id")
            .groupBy("notes.id")
            .orderBy("notes.title");//Junto as informações de TAG e NOTE que compartilham de mesmo id (tag.note_id === note.id) dentro de um objeto de id igual a da TAG 

        } else {
            notes = await knex("notes")
            .where({user_id})
            .whereLike("title", `%${title}%`)
            .orderBy("title");
        }

        const userTags = await knex("tags").where({user_id});
        const notesWithTags = notes.map(note => {//fazendo map dos note.id(sem repetição)
            
            const noteTags = userTags.filter(tag => tag.note_id === note.id); //Variavel que vai receber as tags da note
            
            return { //retorna um elemento do vetor note+tags
                ...note,
                tags: noteTags
            }
            
        })

        return response.json(notesWithTags)
    }

}

module.exports = NotesController;