const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs')
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
//this builderSchema converts schema written in form of strings into json format
const mongoose = require('mongoose');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

//in graphql we only haEventve one mai endpoint
// in graphqlHTTP we pass options which tells express-graphql where are our 
//schemas and where are resolvers
//schema will have schemas and rootValue will have resolvers


//14:43
app.use('/graphql',graphqlHTTP({
    // schema keyword is necessary in schema key
    //name of schema and events should be same
    // ! means non-nullable

    //In user password is nullable  so that password should not be returned in resolver
    //but in input password sholud not be nullable
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema{
            query:RootQuery
            mutation:RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
            .then(events => {
                return events.map(event => {
                    return {...event._doc,_id: event.id}
                });
            })
            .catch(err => {
                throw err;
            })
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: "5e7c51aaae327c2a4dae1fd0"
            })
            //this will save in database
            let createdEvent;
            return event
            .save()
            .then(result => {
                createdEvent = {...result._doc,_id: result._doc._id.toString()}
                return User.findById('5e7c51aaae327c2a4dae1fd0')
            })
            .then(user => {
                if(!user)
                throw new Error('No User Exists');
                user.createdEvents.push(event);
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err)
                throw err
            });
        },
        createUser: (args) => {
            return User
            .findOne({email: args.userInput.email})
            .then(user => {
                if(user)
                throw new Error('User already exist')
                return bcrypt.hash(args.userInput.password,12)
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                })
                return user.save();
            })
            .then(result => {
                return {...result._doc,password: null,_id: result.id}
            })
            .catch(err => {
                throw err
            })
        }
    },
    graphiql: true
}))


mongoose
    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-fw7ue.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,{useUnifiedTopology: true,useNewUrlParser: true } )
    .then(() => {
       app.listen(3000,()=>console.log(`listening on port 3000`));
    })
    .catch((err) => console.log(err));