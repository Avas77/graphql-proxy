import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { RESTDataSource } from "@apollo/datasource-rest";
import axios from "axios";

class MoviesAPI extends RESTDataSource {
  baseURL = "https://jsonplaceholder.typicode.com/";

  getMovie() {
    return axios.get(`${this.baseURL}/posts`).then((res) => res.data);
  }
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type User {
    id: ID!
    name: String
  }

  type Post {
    userId: ID!
    id: ID!
    title: String
    body: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
   type Query {
    user(id: ID!): User
    movie: [Post]
  }
`;

const users = [
  {
    id: 1,
    name: "Kate Chopin",
  },
  {
    id: 2,
    name: "Paul Auster",
  },
];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    user(parent, args, contextValue, info) {
      const userFound = users.filter((user) => {
        const sendBack = user.id == args.id;
        console.log(user.id, sendBack);
        return sendBack;
      });
      console.log(userFound);
      return userFound[0];
    },
    movie: async (_, args, { dataSources }) => {
      return dataSources.moviesAPI.getMovie();
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => {
    const { cache } = server;
    return {
      // We create new instances of our data sources with each request,
      // passing in our server's cache.
      dataSources: {
        moviesAPI: new MoviesAPI({ cache }),
      },
    };
  },
});

console.log(`🚀  Server ready at: ${url}`);
