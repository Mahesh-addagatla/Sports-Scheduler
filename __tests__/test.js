const request = require("supertest");

const db = require("../models/index");
const app = require("../app");
var cheerio = require("cheerio");

let server, agent;
function extractCsrfToken(res){
  var $= cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
const login =async (agent,username,password)=>{
  let res=await agent.get("/login");
  let csrfToken=extractCsrfToken(res);
  await agent.post("/session").send({
    email:username,
    password:password,
    _csrf:csrfToken,
  });
};
describe("Sports-Scheduler Application", function () {
    beforeAll(async () => {
      await db.sequelize.sync({ force: true });
      server = app.listen(4000, () => {});
      agent = request.agent(server);
    });
  
    afterAll(async () => {
      try {
        await db.sequelize.close();
        await server.close();
      } catch (error) {
        console.log(error);
      }
    });
    test("To check the admin signup function", async ()=>{
        let res=await agent.get("/signup");
        const csrfToken=extractCsrfToken(res);
        res=await agent.post("/create-player").send({
          firstName:"Test",
          lastName: "User A",
          email: "usera@test.com",
          password:"helloworld",
          player:"admin",
          _csrf: csrfToken,
          
        });
        expect(res.statusCode).toBe(302);
      });
    
      test("To check the player signup function", async ()=>{
        let res=await agent.get("/signup");
        const csrfToken=extractCsrfToken(res);
        res=await agent.post("/create-player").send({
          firstName:"Test",
          lastName: "User A",
          email: "usera@test.com",
          password:"helloworld",
          role:"player",
          _csrf: csrfToken,
        });
        expect(res.statusCode).toBe(302);
      });
    });