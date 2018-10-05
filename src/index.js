const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
const { Prisma } = require('prisma-binding');
const path = require('path');

const resolvers = {
  Query: {
    location: (_, args, context, info) => {
      return context.prisma.query.location({
        where: { id: args.id }
      }, info);
    },
    cat: (_, args, context, info) => {
      return context.prisma.query.cat({
        where: { id: args.id }
      }, info);
    },
    getLocations: (_, args, context, info) => {
      return context.prisma.query.locations({}, info);
    }
  },
  Mutation: {
    addCat: (_, args, context, info) => {
      return context.prisma.mutation.createCat({
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
      }, info)
    },
    addLocation: (_, args, context, info) => {
      return context.prisma.mutation.createLocation({
        data: {
          name: args.input.name
        }
      }, info)
    }
  }
};

const typeDefs = importSchema(path.resolve('src/schema.graphql'));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'http://localhost:4466'
    })
  })
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
