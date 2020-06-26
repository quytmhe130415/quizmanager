
const Datastore = require("nedb");
const dbResult = new Datastore({
  filename: "./database/resultTest.db",
});

dbResult.loadDatabase(err=>{
    console.log(err);
});



// const result = {
//     name: 'user1',
//     date:'21-5-2020',
//     time:'15:54:24',
//     correct: 4,
//     total: 4,
// }

// addResult(result);

// function addResult(result) {
//   dbResult.insert(result, (err) => {
//     if (err) {
//       console.log(err);
//       return;
//     } 
//       console.log("Insert success!!!");
    
//   });
// }


async function a() {
    const b = await getResult();
    console.log(b);
  }
  
  a();

function getResult() {
  return new Promise((res, reject) => {
    dbResult
      .find({})
      .sort({ time: 1 })
      .exec(function (err, data) {
        if (err) {
          reject(err);
        }
        res(data);
      });
  });
}
