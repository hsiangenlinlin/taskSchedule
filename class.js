const mongoose = require('mongoose')
const Task = require('./Task')

class Schedule{
    constructor(uri){
        this.uri = uri
        
        //connect to DB once a class object is created
        this.connect(uri)
        // execute tasks that have been scheduled every 2 seconds
        setInterval(this.executeTasks.bind(this), 2000)
    }

    // connect to mongoDB
    async connect(uri) {
        try {
          mongoose.set("strictQuery", false)
          await mongoose.connect(uri)
          console.log('db connected')
        } catch (error){
            console.error(error)
        }
    }

    // Define callback functions for completing tasks
    async sendEmail(params){
        console.log(`sending email from ${params.from} to ${params.to}. Title: ${params.title}, Content: ${params.content}`)
    }

    async doPayment(params){
        console.log(`Processing payment of ${params.amount} from ${params.from} to ${params.to}`)
    }


    // add tasks to the schedule
    async scheduleTask(date, callback, params){
        const task = new Task({ date, callback, params})
        await task.save()
        console.log(`Task "${callback}" scheduled for ${date}`)
    }
    
    // set a task that will run every fixed period of time
    async scheduleTaskIntervally(interval, callback, params){
        setInterval(async () => {
            const task = new Task({callback, params})
            await task.save()
        }, interval)
        console.log(`Task ${callback} has been scheduled for every ${interval/1000} seconds`)
    }

    // A method to delete task by id
    async deleteTaskById(id){
        try{
            await Task.deleteOne({_id: id})
            console.log(`Task: ${id} has been deleted.`)
        }catch(e){
            console.error(e)
        }
    }

    async executeTasks() {
        // Find tasks whose date has arrived
        const tasks = await Task.find({ date: { $lt: new Date() } })

        // Execute each task's callback function in tasks
        for (const task of tasks) {
            const callback = task.callback
            if (typeof callback === 'function') {
                callback(task.params)
            }

            // Remove task after finish the task
            await task.deleteOne()
        }
    }

}


async function main(){
    const schedule = new Schedule('mongodb://127.0.0.1:27017/taskDB')
    await schedule.scheduleTask(new Date('2023-02-20T19:05:00'), schedule.doPayment, { from: "Halil", to: "Ahmet", amount: 100 })
    await schedule.scheduleTaskIntervally(3000, schedule.sendEmail, {from:"from@example.com" ,to: "to@example.com", title: "Greeting", content:"how are you doing?"})
    
    await schedule.deleteTaskById('63f24262f34b1a96437a12a9')
}

main()


