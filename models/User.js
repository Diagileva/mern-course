const {Schema, model, Types} = require("mongoose")

const schema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    links: [{type: Types.ObjectId, ref: "Link"}] //связь модели пользователя с опр записями в базе данных
})

module.exports = model('User', schema) //модель юзер, которая работает пр заданной схеме