const {Router} = require("express")
const router = Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs") //для хеширования паролей и сравнивания
const {check, validationResult} = require("express-validator") //для проверки корректности введенных пользователем данных
const jwt = require("jsonwebtoken") //регистрация
const config = require("config")

// /api/auth/register процесс регистрации
router.post(
    "/register", 
    [
        check("email", "Некорректный email").isEmail(),
        check("password", "Минимальная длина пароля 6 символов").isLength({min: 6})
    ],
    async (req, res) => {
    try {
        console.log('Body', req.body)
        const errors = validationResult(req) //отвалидировали входящие поля
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array(), message: "Некоректные данные при регистрации"})
        }

        const {email, password} = req.body

        const candidate = await User.findOne({email})

        if (candidate) {
            return res.status(400).json({message: "Такой пользователь уже существует"})
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email, password: hashedPassword})

        await user.save() //когда промис завершится будет означать что создали в бд данного человека

        res.status(201).json({message: "Пользователь создан"}) //отвечаем фронтенду

    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так"})
    }
})

// /api/auth/login
router.post("/login", 
    [
        check("email", "Введите корректный email").isEmail(),
        check("password", "Введите пароль").exists()
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req) //отвалидировали входящие поля
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array(), message: "Некоректные данные при входе в систему"})
        }

        const {email, password} = req.body

        const user = await User.findOne({email})

        if (!user) {
            return res.status(400).json({message: "Такой пользователь не существует"})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({message: "Неверный пароль, попробуйте снова"})
        }

        //если все проверки прошли то авторизация через jwt token (jsonwebtoken)
        const token = jwt.sign(
            {userId: user.id},
            config.get("jwtSecret"),
            {expiresIn: "1h"}
        )

        res.json({token, userId: user.id})

    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так"})
    }
})



module.exports = router
