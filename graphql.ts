import { GraphQLSchema, GraphQLObjectType, GraphQLInt } from "graphql";

/**
 * Construct a GraphQL schema and define the necessary resolvers.
 *
 * type Query {
 *   hello: String
 * }
 * type Subscription {
 *   greetings: String
 * }
 */

let count = 1;

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      count: {
        type: GraphQLInt,
        resolve: () => count++,
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: "Subscription",
    fields: {
      count: {
        type: GraphQLInt,
        subscribe: async function* () {
          while (true) {
            yield { count: count++ };
            await Bun.sleep(500);
          }
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      reset: {
        type: GraphQLInt,
        resolve: () => {
          count = 0;
          return count;
        },
      },
    },
  }),
});
