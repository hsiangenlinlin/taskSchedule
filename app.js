// The goal is to create a task management system that runs efficiently and stores tasks 
// in a MongoDB database to prevent data loss in case of server restarts. Each task should 
// include a name, date, callback function, and function parameters. When the date of a 
// task arrives, it should be completed promptly. To accomplish this, we will create two 
// simple callback functions, "sendMail" and "doPayment". The implementation should 
// prioritize speed and efficiency.

const mongoose = require('mongoose')
const Task = require('./Task')
const global = require('global/window')

const uri = 'mongodb://127.0.0.1:27017/taskDB'


async function connect() {
  try {
    mongoose.set("strictQuery", false)
    await mongoose.connect(uri)
    console.log('db connected')
  } catch (error){
      console.error(error)
  }
}


// Define callback functions for completing tasks
global.sendEmail = async function (params){
    console.log(`sending email from ${params.from} to ${params.to}. Title: ${params.title}, Content: ${params.content}`)
}

global.doPayment = async function (params){
    console.log(`Processing payment of ${params.amount} from ${params.from} to ${params.to}`)
}
// add tasks to the schedule
async function scheduleTask(date, callback, params){
  const task = new Task({ date, callback, params})
  await task.save()
  console.log(`Task "${callback}" scheduled for ${date}`)
}

async function executeTasks() {
  // Find tasks whose date has arrived
  const tasks = await Task.find({ date: { $lt: new Date() } });

  // Execute each task's callback function in tasks
  for (const task of tasks) {
    const callbackName = task.callback 
    const callback = global[callbackName]

    try {
      //const callback = new Function(callbackString);
      await callback(task.params)
      // Remove task after finish the task
      await task.deleteOne()
      console.log(`Task ${task._id} had been executed and deleted`)
    } catch (error) {
      console.error(`Error executing task ${task._id}: ${error}`)
    }
  }
}

async function implementation(){
  await connect()
  await scheduleTask(new Date('2023-02-19T15:47:00'), 'doPayment', { from: "Halil", to: "Ahmet", amount: 100 })
  await scheduleTask(new Date('2023-02-20T15:47:20'), 'sendEmail', {from:"from@example.com" ,to: "to@example.com", title: "Greeting", content:"how are you doing?"})
  //execute every 2 seconds
  setInterval(executeTasks, 2000)
  console.log(new Date())
}

implementation()


