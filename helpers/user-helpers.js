const async = require('hbs/lib/async')
var db = require('../config/connection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { resolve } = require('promise')
var objectId = require('mongodb').ObjectId

module.exports = {

    getExamNames: () => {
        return new Promise(async (resolve, reject) => {
            let exams = await db.get().collection('exams').find().toArray()
            resolve(exams)
        })

    },
    loginCheck: (data) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}

            let user = await db.get().collection('users').findOne({ email: data.email })
            if (user) {
                bcrypt.compare(data.password, user.password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true
                        console.log("credentials are correct")
                        resolve(response)
                    } else {
                        console.log("Credentials do not match")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("user not found")
                resolve({ status: false })

            }
        })
    },
    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            console.log(userData)
            db.get().collection('users').insertOne(userData).then((response) => {

                resolve(response)
            })
        })
    },
    getExamData: (examId) => {
        return new Promise(async (resolve, reject) => {
            let exam = await db.get().collection('exams').findOne({ '_id': ObjectId(examId) })
            resolve(exam)
        })
    },
    getMcqs: (exam) => {
        return new Promise(async (resolve, reject) => {
            mcqs = await db.get().collection('mcqs').find({ 'examId': exam }).toArray()
            //console.log(mcqs)
            resolve(mcqs)
        })

    },
    calculateScore: (answerData) => {
        return new Promise(async (resolve, reject) => {
            mcqs = await db.get().collection('mcqs').find({ 'examId': exam }).toArray()
            let score = 0
            //console.log(answerData)
            mcqs.forEach(function myFunction(question) {
                //console.log(question.answer)
                id = question._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
                //console.log(id)
                //console.log(answerData[id])
                if (question.answer === answerData[id]) {
                    score++
                }

            }
            )

            //console.log(score)
            //console.log(answerData)
            resolve(score)
        })
    },
    saveScore: (score, userId, examId) => {
        //console.log(score, userId, examId)
        return new Promise((resolve, reject) => {
            let today = new Date();
            let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            let dateTime = date + ' ' + time;

            db.get().collection('results').insertOne({ userId, examId, score, dateTime })
            resolve()
        })

    },
    getScores: (user) => {
        return new Promise(async (resolve, reject) => {
            let scores = await db.get().collection('results').aggregate([
                {
                    $match: { 'userId': user }
                },
                {
                    $lookup: {
                        from: 'exams',
                        localField: 'examId',
                        foreignField: '_id',
                        as: 'exam'
                    }
                },
                {
                    $project:{
                        userId:1,dateTime:1,score:1,exam: '$exam.name'
                    }
                },
            ]).toArray()
            console.log(scores)
            resolve(scores)
        })
    }

}