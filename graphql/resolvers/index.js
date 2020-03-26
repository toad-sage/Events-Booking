const bcrypt = require('bcryptjs')
const Event = require('../../models/event');
const User = require('../../models/user');

//here these function do not run into infinite loop because a function is not used until it is not called in query
const user = async userId => {
    try{
        const user = await User.findById(userId)
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this,user._doc.createdEvents)
        }
    }catch(err){
        console.log(err)
    }
}

const events = async eventIds => {
    try{
        const events = await Event.find({_id: {$in: eventIds} })
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this,event.creator)
            }
        })
    }catch(err){
        throw err;
    }
}

module.exports = {
    events: async () => {
        try{
            const events = await Event.find()
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this,event._doc.creator)
                }
            });
        }catch(err){
            console.log(err);
        }
        
    },
    createEvent: async (args) => {
        try {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: "5e7cc5326c002a49cc5edd17"
            })
            //this will save in database
            let createdEvent;
            const result = await event.save();
            createdEvent = {...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this,result._doc.creator)
            }
            const creator = await User.findById('5e7cc5326c002a49cc5edd17')
                if(!creator)
                throw new Error('No User Exists');
                creator.createdEvents.push(event);
    
            await creator.save();
    
                return createdEvent;
        } catch (error) {
            throw error
        }
    },
    createUser: async (args) => {
        try{
        const existingUser = await User.findOne({email: args.userInput.email})
            if(existingUser)
            throw new Error('User already exist')
        const hashedPassword = await bcrypt.hash(args.userInput.password,12)
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            })
        const result =  await user.save();

            return {...result._doc,password: null,_id: result.id,createdEvents: events.bind(this,result._doc.createdEvents)}
        }
        catch(err){
            throw err;
        }
    }
}