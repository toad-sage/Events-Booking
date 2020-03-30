const Event = require('../../models/event');
const User = require('../../models/user');
const {transformEvent} = require('./merge')

module.exports = {
    events: async () => {
        try{
            const events = await Event.find()
            return events.map(event => {
                console.log(event)
                return transformEvent(event);
            });
        }catch(err){
            console.log(err);
        }
        
    },
    createEvent: async (args,req) => {

        if(!req.isAuth){
            throw new Error('UnAuthenticated');
        }

        // console.log(req)

        try {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: req.userId
            })
            //this will save in database
            let createdEvent;
            const result = await event.save();
            createdEvent = transformEvent(result);
            const creator = await User.findById(req.userId)
                if(!creator)
                throw new Error('No User Exists');
                creator.createdEvents.push(event);
    
            await creator.save();
    
                return createdEvent;
        } catch (error) {
            throw error
        }
    }
}