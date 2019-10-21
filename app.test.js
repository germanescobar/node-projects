const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./app");
const User = require("./User");

beforeEach(async () => {
  // antes de cada prueba limpiamos todas las colecciones para iniciar con una
  // base de datos en blanco
  for (var i in mongoose.connection.collections) {
    await mongoose.connection.collections[i].remove({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

const signIn = async (credentials) => {
  const agent = request.agent(app);
  await agent.post('/login')
      .set('Content-Type', 'application/json')
      .send(credentials);

  return agent;
}

describe("GET /", () => {
  test("responds with success code", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
});

describe("GET /projects", () => {
  test("responds with error if not authenticated", async () => {
    const response = await request(app).get("/projects");
    expect(response.statusCode).toBe(401);
  });

  test("responds with success code if authenticated", async () => {
    const credentials = { email: "pedro@gmail.com", password: "test1234" };
    const user = await User.create(credentials);
    const agent = await signIn(credentials);

    const response = await agent.get("/projects");
    expect(response.statusCode).toBe(200);
  });

  test("responds with projects if authenticated", async () => {
    const credentials = { email: "pedro@gmail.com", password: "test1234" };
    const user = await User.create(credentials);
    const agent = await signIn(credentials);

    // crear 1 proyecto en la base de datos

    const response = await agent.get("/projects");
    // verificar que el arreglo tenga 1 proyecto
    expect(response.body.length).toBe(1);

    // verificar que el proyecto tenga la información que creamos antes
  });
});

describe("POST /projects", () => {
  test("responds with error if not authenticated", () => {

  });

  test("responds with 422 if project is invalid (no name)", () => {

  });

  test("responds with 200 if project is created", () => {

  });
})
