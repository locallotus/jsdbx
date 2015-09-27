var db = require('../LIB/JSDBX.js');

console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
var cName = 'test';
db.connect('DB/TEST', cName, function(err) {
    if(err) {
        console.log(err);
    } else {
        test();
    }
});

console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
var cName2 = 'test';
db.connect('DB/TEST', cName2, function(err) {
    if(err) {
        console.log('<DB> Error:', err);
    } else {
        test2();
    }
});

//--------------------------------------------------------------
function test() {
  console.log('<DB> Current Collection: ', db[cName].C_NAME);
  console.log('<DB> Current Records:', db[cName].count());

  insertTestRecords(100000, cName);

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  console.time(':: Create Index on age Time');
  db[cName].createIndex('age');
  console.timeEnd(':: Create Index on age Time');

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  console.time(':: Find One Time');
  db[cName].findOne({ age: 100 });
  console.timeEnd(':: Find One Time');

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  console.time(':: Find Any Time');
  db[cName].findAny({ name: 'Buffer50000', score: 99650 });
  console.timeEnd(':: Find Any Time');

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  console.time(':: Create Index on score Time');
  db[cName].createIndex('score');
  console.timeEnd(':: Create Index on score Time');

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  console.time(':: Find Any Time');
  db[cName].findAny({ name: 'Buffer50000', score: 99650 });
  console.timeEnd(':: Find Any Time');

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  console.time(':: Create Index on name Time');
  db[cName].createIndex('name');
  console.timeEnd(':: Create Index on name Time');

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  console.time(':: Find Any Time');
  db[cName].findAny({ nsame: 'Buffer50000', sscore: 99650 });
  console.timeEnd(':: Find Any Time');

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  db.disconnect(cName, function(err) {
      if(err) {
          console.error('<DB> Error:', err);
      } else {

      }
  });
}

//--------------------------------------------------------------
function test2() {
  console.log('<DB> Current Collection: ', db[cName2].C_NAME);
  console.log('<DB> Current Records:', db[cName2].count());

  insertTestRecords(10, cName2);

  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  db.disconnect(cName2, function(err) {
      if(err) {
          console.error(err);
      } else {

      }
  });
}

function insertTestRecords(x, cName) {
  console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
  console.time(':: Insert Time');
  for (var i = 0; i < x; i++) {
      db[cName].insert({
          name: 'Buffer' + i,
          surname: 'Underrun' + i,
          //password: crypto.randomBytes(8),
          score: i,
          teacher: 'Tim',
          city: 'Cape Town',
          age: Math.floor((Math.random() * 100) + 1)
      });
  };
  console.timeEnd(':: Insert Time');
  console.log('<DB> Records:', db[cName].count());
}
