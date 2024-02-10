const crypto = require('crypto');

const { createClient } = require('redis');
const retry = require('retry');


class TestFunctions{
  constructor() { 
      this. algorithm = 'aes-192-cbc';
      this.password = '2001MyForever';
  }
    
    //creating a room list
    createRoomList1 (v) {
        let roomList = [];
        for (let room of v) {
            let exist = this.checkRoomExist(roomList, room.roomid)
            if (exist) {
                let index = roomList.findIndex(v => v.roomid === room.roomid);
                roomList[index].participants.push(room.memberid);
            }
            else {
                roomList.push(
                    {
                        "roomid": room.roomid,
                        "name": room.name,
                        "description": room.description,
                        "imageurl": room.imageurl,
                        "createdat": room.createdat,
                        "participants": [room.memberid]
                    }
                );
            }
        }
        return roomList;
    }

    checkRoomExist(l, r) {
        return (l) ?
        l.find(v => v.roomid === r) :
        null;
    }


    generateKey() {
        //
        let x = require('crypto').randomBytes(24).toString('hex');

        this.createRefreshTokenSecret(x)

  }

  createRefreshTokenSecret(password) {
   // We will first generate the key, as it is dependent on the algorithm.
          // In this case for aes192, the key is 24 bytes (192 bits).
          crypto.scrypt(password, 'salt', 24, (err, key) => {
            if (err) throw err;
            // After that, we will generate a random iv (initialization vector)
            crypto.randomFill(new Uint8Array(16), (err, iv) => {
              if (err) throw err;

                
                console.info(key)
              // Create Cipher with key and iv
              const cipher = crypto.createCipheriv(this.algorithm, key, iv);

              let encrypted = '';
              cipher.setEncoding('hex');

              cipher.on('data', (chunk) => encrypted += chunk);
              cipher.on('end', () => console.log('===>', encrypted));// Prints encrypted data with key

              cipher.write('some clear text data');
              cipher.end();
            });
          });

          crypto.randomFill(new Uint8Array(16), (err, iv) => {
              if (err) throw err;

                
              let key = crypto.randomBytes(24);
              // Create Cipher with key and iv
              const cipher = crypto.createCipheriv(this.algorithm, key, iv);
              let c = 'ce37824f13ee444318ba2544520c50cc183b474e2784577a338fb3e15eb6c3c4b40a4927bfe529c5e60ad87cd5af510ed0c16831d158df0abd2fbc01714fa724';
          
              const fkey = crypto.scryptSync(c.toString(), 'salt', 64);
              console.info(fkey);

              let encrypted = '';
              cipher.setEncoding('hex');

              cipher.on('data', (chunk) => encrypted += chunk);
              cipher.on('end', () => console.log('************ ', encrypted));// Prints encrypted data with key

              cipher.write('some clear text data');
              cipher.end();
          });
      }

}





const client = createClient();

client.connect().then(()=>{
    console.log("Connected to database");
    setTimeout(()=>process.exit(),5000);
}).catch(err => console.error(err));

async function getClient(){
    // let client = 'rtk_a3e3f35a9491ef1d95dfa48b5d0db4bbbc00fb6390e835c753c8c16ae63c49bd';
  // await client.set('key', 'value');
  let key = 'rtk_c91d8156ba34af8118485a37be59b24145d7e49e3dc2004ff0afcd4a85d001a2'
    const value = await client.get(key)
    
let v = await client.keys('*')
  // await client.del(key);
  // v.map(async (k) => await client.del(k));
  console.info(v);
}
// await client.set('key', 'value');
// const value = await client.get('key');
// await client.disconnect();


getClient();

// const v = new TestFunctions();

// v.generateKey();


 
