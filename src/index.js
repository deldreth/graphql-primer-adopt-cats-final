const { ApolloServer } = require("apollo-server");
const { importSchema } = require("graphql-import");
const { Prisma } = require("prisma-binding");
const path = require("path");

const resolvers = {
  Query: {
    location: (obj, args, context, info) => {
      return context.prisma.query.location(
        {
          where: { id: args.id }
        },
        info
      );
    },
    cat: (obj, args, context, info) => {
      return context.prisma.query.cat(
        {
          where: { id: args.id }
        },
        info
      );
    },
    getLocations: (obj, args, context, info) => {
      return context.prisma.query.locations({}, info);
    }
  },
  Mutation: {
    addCat: (obj, args, context, info) => {
      return context.prisma.mutation.createCat(
        {
          data: {
            name: args.input.name,
            age: args.input.age,
            weight: args.input.weight,
            breed: args.input.breed,
            location: {
              connect: {
                id: args.locationId
              }
            }
          }
        },
        info
      );
    },
    addLocation: (obj, args, context, info) => {
      return context.prisma.mutation.createLocation(
        {
          data: {
            name: args.input.name
          }
        },
        info
      );
    }
  },
  Subscription: {
    locationAdded: {
      subscribe: (obj, args, context, info) => {
        return context.prisma.subscription.location(
          {
            where: {
              mutation_in: ["CREATED", "UPDATED"]
            }
          },
          info
        );
      }
    },
    catAddedOrUpdated: {
      subscribe: (obj, args, context, info) => {
        return context.prisma.subscription.cat(
          {
            where: {
              mutation_in: ["CREATED", "UPDATED"],
              node: {
                location: {
                  id: args.locationId
                }
              }
            }
          },
          info
        );
      }
    }
  }
};

const typeDefs = importSchema(path.resolve("src/schema.graphql"));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: "/",
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: "src/generated/prisma.graphql",
      endpoint: "http://localhost:4466"
    })
  })
});

server.listen({ port: 4000 }).then(({ url, subscriptionsUrl }) => {
  console.log(
    `🐈  🐈  🐈  ready at ${url}, subscriptions at ${subscriptionsUrl}`
  );
});
