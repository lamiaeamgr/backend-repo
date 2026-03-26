const request = require("supertest");
const app = require("../app");
const Item = require("../models/Item");

describe("Items API", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("GET /items returns list of items", async () => {
    jest.spyOn(Item, "find").mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ _id: "1", name: "Notebook" }])
    });

    const response = await request(app).get("/items");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("POST /items validates missing name", async () => {
    const response = await request(app).post("/items").send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Name is required");
  });
});
