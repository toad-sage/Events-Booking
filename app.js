const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
//this builderSchema converts schema written in form of strings into json format
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());

// for cross origin refernce
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

//in graphql we only haEventve one mai endpoint
// in graphqlHTTP we pass options which tells express-graphql where are our 
//schemas and where are resolvers
//schema will have schemas and rootValue will have resolvers

app.use(isAuth);

app.use('/graphql',graphqlHTTP({
    // schema keyword is necessary in schema key
    //name of schema and events should be same
    // ! means non-nullable

    //In user password is nullable  so that password should not be returned in resolver
    //but in input password sholud not be nullable
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}))


mongoose
    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-fw7ue.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,{useUnifiedTopology: true,useNewUrlParser: true } )
    .then(() => {
       app.listen(8000,()=>console.log(`listening on port 8000`));
    })
    .catch((err) => console.log(err));