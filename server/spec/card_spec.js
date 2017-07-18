const app = require("../");
const rp = require("request-promise");
const mongoose = require("mongoose");
const models = require("../models");
const User = models.User;
const Board = models.Board;
const List = models.List;
const Card = models.Card;
const helpers = require('./helpers');

describe("Card", () => {
  const {baseUrl, apiUrl, getJSON, log} = helpers;
  
  let server;
  let user;
  let board;
  let list;
  let token;

  /*  ===============
    Manage Server
  ================ */
  beforeAll(done => {
    server = app.listen(8888, () => {
      done();
    });
  });

  afterAll(done => {
    server.close();
    server = null;
    done();
  });

  /*  ===============
    Create Resources
  ================ */

  beforeEach(done => {
    User.create({
      email: "foobar@gmail.com",
      password: "password"
    }).then(result => {
      user = result;
      done();
    });
  });

  beforeEach(done => {
    Board.create({
      title: "Test Board",
      lists: [],
      users: [user.id]
    }).then(result => {
      board = result;
      done();
    });
  });

  beforeEach(done => {
    List.create({
      title: "Test List Title",
      description: "Test List Description",
      board: board.id,
      cards: []
    }).then(result => {
      list = result;
      done();
    });
  });
  
  beforeEach(done => {
    let loginOpts = {
      method: "POST",
      uri: `${baseUrl}/sessions`,
      form: {
        email: "foobar@gmail.com",
        password: "password"
      },
      json: true
    };

    rp(loginOpts).then(result => {
      token = result.token;
      done();
    });
  });

  /*  ===============
    User Tests
  ================ */
  describe("API", () => {
    let card;

    beforeEach(done => {
      Card.create({
        title: "Test Original Card Title",
        description: "Test Original Card Description",
        list: list.id,
        members: [user.id],
        activities: []
      }).then(result => {
        card = result;
        done();
      });
    });

    it("successfully creates a card", done => {
      Card.findById(card.id)
        .then(results => {
          expect(results.title).toBe("Test Original Card Title");
          done();
        })
        .catch(error => {
          expect(error).toBe(null);
          done()
        })
    });

    xit("creates a card through the api", done => {
      let options = {
        method: "POST",
        uri: `${apiUrl}/lists/${board.id}/card`,
        auth: {
          bearer: token
        },
        form: {
          title: "Test New Card Title",
          description: "Test New Card Description",
        },
        json: true,
        resolveWithFullResponse: true
      };

      rp(options)
        .then(res => {
          expect(res.statusCode).toBe(200);
          expect(res.body.data.title).toBe("Test New List Title");
          expect(res.body.data.description).toBe("Test New List Description");
          return Card.findById(res.body.data.id);
        })
        .then(result => {
          expect(result).toBeDefined();
          done();
        })
        .catch(error => {
          expect(error).toEqual(null);
          done();
        });
    });

    xit("updates a list title", done => {
      let options = {
        method: "PUT",
        uri: `${apiUrl}/lists/${list.id}`,
        auth: {
          bearer: token
        },
        form: {
          title: "Changed List Title"
        },
        json: true,
        resolveWithFullResponse: true
      };

      rp(options)
        .then(res => {
          expect(res.statusCode).toBe(200);
          expect(res.body.data.title).toBe("Changed List Title");
          expect(res.body.data.description).toBe("Test Original List Description");
          return List.findById(list.id);
        })
        .then(result => {
          expect(result.title).toBe("Changed List Title");
          expect(result.description).toBe("Test Original List Description");
          done();
        })
        .catch(error => {
          expect(error).toEqual(null);
          done();
        });
    });

    xit("updates a list description", done => {
      let options = {
        method: "PUT",
        uri: `${apiUrl}/lists/${list.id}`,
        auth: {
          bearer: token
        },
        form: {
          description: "Changed List Description"
        },
        json: true,
        resolveWithFullResponse: true
      };

      rp(options)
        .then(res => {
          expect(res.statusCode).toBe(200);
          expect(res.body.data.title).toBe("Test Original List Title");
          expect(res.body.data.description).toBe("Changed List Description");
          return List.findById(list.id);
        })
        .then(result => {
          expect(result.title).toBe("Test Original List Title");
          expect(result.description).toBe("Changed List Description");
          done();
        })
        .catch(error => {
          expect(error).toEqual(null);
          done();
        });
    });

    xit("deletes a list", done => {
      let options = {
        method: "DELETE",
        uri: `${apiUrl}/lists/${list.id}`,
        auth: {
          bearer: token
        },
        json: true,
        resolveWithFullResponse: true
      };

      rp(options)
        .then(res => {
          expect(res.statusCode).toBe(200);
          expect(res.body.message).toBe(
            "Resource successfully removed."
          );
          return List.findById(list.id);
        })
        .then(result => {
          expect(result).toEqual(null);
          done();
        })
        .catch(error => {
          expect(error).toEqual(null);
          done();
        });
    });
  });
});
