const supertest = require('supertest');
const app = require('../../app');
const User = require('../../app/src/models/user');
const { ChatRoom } = require('../src/models/chat');
// const q = require('request');


const request = app.request;


let user = new User({
    "_id": "65be53f828ce6648b35c693a",
    "index": 0,
    "uid": "1bfd1c45-ef2e-4b1d-e138-d7856215568c",
    "isActive": true,
    "avatar": "http://placehold.it/32x32",
    "password": "Password#154",
    "username": "jdoe_433",
    "age": 32,
    "name": "John Doe",
    "gender": "male",
    "email": "jdoe@exodoc.com",
    "phone": "+1 (457) 234-2031",
    "about": "Eu mollit do quis ea incididunt eiusmod consectetur eiusmod do. Esse labore exercitation excepteur esse id ut sint cillum. Adipisicing in laborum incididunt elit adipisicing aliqua sint laboris. Tempor ipsum enim reprehenderit dolor nostrud cillum est minim tempor. Aliqua nulla deserunt ex consectetur occaecat nisi voluptate. Deserunt id laboris mollit non deserunt aute occaecat in.\r\n"
});
  
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0ZjE2OWIxMS00NGVjLTQ2MWMtYjkwMy0wZWY5M2U4ZDA1ZDMiLCJyb2xlIjoidXNlciIsInNlY3JldCI6ImI1ZWEwOWFkOTIzZjRiZjRjN2JjOGUyMWYxN2Q0Y2U5YmU3MDExNjIyODk0MjQzNTA1ZDU5NWM2NjY0MzFkZWEiLCJpYXQiOjE3MDc1ODQ1NTQsImV4cCI6MTcwNzU5MzQxNH0.H88yw1YiX3-uCPc_KeHGOy3z3xJ6XRqfDNmn5Xa6OLU";

describe('/api/v1', () => {
  it('should return a status of 200 for the root route', (done) => {
      supertest(app).get('/api/v1')
        .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
      .expect(200, done);
  });
});

describe('/users', function() {
  beforeEach((done) => {
     User.prototype.delete().then(done()).catch(err => { console.log(err); done(); });
  })

  

  describe('POST /users/create', function() {
    it('should respond with JSON containing a jwt token and profile when authenticated', function(done) {
      
        supertest(app)
          .post('/api/v1/users/create')
          .set({Authorization:`Bearer ${token}`})
          .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
        .send(user)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          should.exist(res.body.token);
          should.exist(res.body.profile);
          done();
        });
    });
  });
});

//test for getting user details
describe("GET /users/:uid", function(){
   var userId;
   //create the user first
   beforeEach( function(done){
       user.save().then(v => {
           userId = v.uid;
    
       done();
       }).catch((err) => { 
         done(err);
     });
   })
    afterEach(User.prototype.deleteAll);

   it("should get information of a particular user by its Id",function(done){
       supertest(app)
         .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
     .get("/api/v1/users/"+userId)
     .expect(200)
     .expect('Content-Type','application/json')
     .end(function(err,res){
       if(err) throw err;
       else{
         User.findById(userId).exec((err,foundUser)=>{
           if(err)throw err;
           else{
             assert.deepEqual(foundUser,res.body);
             done();
           }
         })
       }
     })
   })
})

////////////////////////////////////////////////////////////////
//test for getting list of rooms
var room = new ChatRoom({
    name: "General Room1",
    imageUrl: "https://images.pexels.com/photos/11485777/pexels-photo-11485777.jpeg",
    description: "Soccer fans tseketseke",
});
room.save().then(()=>{
  describe("GET /chat-rooms", function() {
    it("should return a list of all available rooms ", function(done) {
        supertest(app)
          .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
        .get('/api/v1/chat-rooms')
        .expect(200)
        .expect('Content-type', 'application/json')
        .end(function(err, res) {
          if (err) throw err;
          var body = JSON.parse(res.text);
          assert(Array.isArray(body)); // should be an array
          assert(body.length > 0); // should not be empty
          done();
        });
    });
  });
});


///////////////////////////////////////////////////////////////////
//Testing POST to create a chat room
var createdRoomId = '';
describe("/POST api/v1/chat-rooms/create", function(){
  it("Should add a new chat room and respond with the created room object including id", function(done){
    const token = jwt.sign({username:"admin"}, process.env.JWT_SECRET , { expiresIn: "1h" });
    let userAgent = req => ({...req.headers['user-agent'], platform : req.platform || undefined} );
      supertest(app)
        .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
      .post("/api/v1/rooms")
      .set('Authorization' , `Bearer ${token}` )
          .field('name', 'New Room')
        .field('imageUrl', 'https://images.pexels.com/photos/11485777/pexels-photo-11485777.jpeg')
         .field('description','This is a test description')
         .field('platform', 'web')
       .send(userAgent)
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        assert(res.body.id);
        assert.equal(res.body.name,"New Room");
          assert.equal(res.body.imageUrl, 'https://images.pexels.com/photos/11485777/pexels-photo-11485777.jpeg');
          assert.equal(res.body.description, 'This is a test description');
          assert.equal(res.body.platform, 'web');
        done();
      })
  });
});


////////////////////////////////////////////////////////////////////
// Testing GET on specific room ID
describe('/GET api/v1/room/:roomId', ()=>{
   it('should get information of one existing room by its id ', done => {
       supertest(app)
         .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
       .get(`/api/v1/chat-rooms/${createdRoomId}`)
       .expect(200)
       .expect('Content-Type', /json/, done);
   });

   it('should not get information for non-existing room', done => {
     supertest(app)
       .get('/api/v1/rooms/999999999')
       .expect(404, done);
   });
})


///////////////////////////////////////////////////////////////////
// Testing PUT to update an existing room
var updatedName = "Updated Name";
var updatedImageUrl="http://updatedurl.jpg"
var updatedDescription='This is the updated description';

describe("/PUT /api/v1/chat-room/:id", function() {
    beforeEach(() => {
        return getToken().then(t => token=t).catch(done);
    });
    it("Should successfully update a room's info with valid data", function(done) {
        supertest(app)
            .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
            .put(`/api/v1/chat-rooms/${createdRoomId}?access_token=${token}`)
            .send({ name: updatedName , image : updatedImageUrl, description: updatedDescription})
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(res.body.name, updatedName);
                assert.propertyVal(res.body, 'image', updatedImageUrl);
                assert.propertyVal(res.body,'description', updatedDescription);
                createdRoomId = res.body._id; // store new id from response
                done();
            })
    });
});




////////////////////////////////////////////////////////////////////
//Test DELETE method on /room/:id 
describe("/DELETE /api/v1/chat-rooms.delete/:id", ()=>{
    it("Should delete the room that was just created ", done => {
        supertest(app)
            .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
           .delete(`/api/v1/chat-rooms/${createdRoomId}?access_token=${token}`)
           .expect(200, done);
    });
    
    it("Should not be able to delete a non-existent room", done => {
       let fakeID = mongoose.Types.ObjectId();
       supertest(app)
          .delete(`/api/v1/rooms/${fakeID}?access_token=${token}`)
          .expect(404, done);
    });

    it("Should not delete a room without an access token", done => {
        supertest(app)
          .set('x-api-key', 'bb3cc1505fdedb5b9403079035b8cc2096aa210c440c39bafce3bd16739e988a')
         .delete('/api/v1/chat-rooms/' + createdRoomId)
         .expect(403, done);
   });

    it('Should throw an error if user tries to delete another users room', function (done) {
        supertest(app)
          .delete(`/api/v1/rooms/${createdRoomId}?access_token=${token}`)
          .expect(403, done);
    });
})






/// HELPER FUNCTIONS ///
function createUserAndLogin() {
    return new Promise((resolve, reject)=>{
        //Create a test User and login as this user
        var userData = {
            username: "testuser" + Math.random(),
            password: "testpassword123",
            avatar: "http://placehold.it/32x32",
            username: "testuser_45",
            name: "Test User",
            gender: "male",
            email: "testuser@exodoc.com",
            phone: "+1 (111) 234-2031",
            
        };
        api.post('/auth/register')
            .send(userData)
            .end(function(err, res){
                if(err) console.log(err);
                
                expect(res.status).to.equal(200);
                resolve(res.body['access-token']);
            })
    })
    
}

// Helper Function that creates a Room with the given data and returns the ID of the newly created Room  
function createPrivateChatRoomWithData(roomData, callback) { 
    api.post("/api/v1/rooms")
       .set({Authorization:`Bearer ${token}`})
       .send(roomData)
       .end(function(err, res){
           if(err) throw err;
           expect(res.status).to.equal(200);
           expect(res.body).to.be.an("object");
           expect(res.body).to.include.keys("id","name", "isPrivate");
           callback(res.body.id);
       });
}