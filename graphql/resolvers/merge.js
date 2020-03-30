const DataLaoder = require('dataloader');

const User = require('../../models/user')
const Event = require('../../models/event')
const {dateToString} = require('../../helpers/date')
//here these function do not run into infinite loop because a function is not used until it is not called in query
const eventLoader = new DataLaoder( (eventIds) => {
    return events(eventIds);
})

const userLoader = new DataLaoder((userIds) => {
    return User.find({_id: {$in: userIds}});
})

const user = async userId => {
    try{
        const user = await userLoader.load(userId.toString())
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: () => eventLoader.loadMany(user._doc.createdEvents.toString())
        }
    }catch(err){
        console.log(err)
    }
}

const events = async eventIds => {
    try{
        const events = await Event.find({_id: {$in: eventIds} })
        return events.map(event => {
            return transformEvent(event)
        })
    }catch(err){
        throw err;
    }
}

const singleEvent = async eventId => {
    try{
        const event = await eventLoader.load(eventId.toString());
        return event;
    }catch(err){
        throw err;
    }
}

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this,event.creator)
    }
}

const transformBooking = booking => {
    return {
        ...booking._doc,
        _id:booking.id,
        user: user.bind(this,booking._doc.user),
        event: singleEvent.bind(this,booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
}

exports.events = events
exports.transformEvent = transformEvent
exports.transformBooking = transformBooking