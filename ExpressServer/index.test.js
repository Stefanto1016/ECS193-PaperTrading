const request = require('supertest');
const app = require('./index');
//const jest = require('jest');
//jest.setTimeout(100000);
jest.setTimeout(1000000000);
let testAccount = 'testingkey';
let testAccountNumber = 0;
let numIterations = 5;

beforeAll(async() => 
{
  //server = app.listen(8000);
});

afterAll(async () => 
{
  await request(app).get('/close');
});

test('Test Session Authentication', async () => {
  testAccountNumber = 0;
  let key;
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber }).then(response => 
  {
      expect(response.body).toEqual(false);
  });
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: 'something' }).then(response => 
  {
      expect(response.body).toEqual(false);
  });
  await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber }).then(response =>
  {
      key = response.text;
  });
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: 'something' }).then(response => 
  {
      expect(response.body).toEqual(false);
  });
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key });
  await request(app).put('/createAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key }).then(response => 
  {
      expect(response.body).toEqual(true);
  });
  await request(app).put('/closeConnection').send({ connectionKey: key });
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key }).then(response => 
  {
      expect(response.body).toEqual(false);
  });
});

test('Test Account Creation', async () => {
  testAccountNumber = 0;
  let key;
  await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber }).then(response =>
  {
      key = response.text;
  });
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key });
  await request(app).get('/hasAccount?userKey=${testAccount+testAccountNumber}&connectionKey=${key}').then(response => 
  {
      expect(response.body).toEqual(false);
  });
  await request(app).put('/createAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key });
  await request(app).get('/hasAccount?userKey=${testAccount+testAccountNumber}&connectionKey=${key}').then(response => 
  {
      expect(response.body).toEqual(false);
  });
  var userProfile = await request(app).get(`/getPortfolioData?userKey=${testAccount+testAccountNumber}&connectionKey=${key}`);
  const {__v, _id, ...rest } = userProfile.body;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = String((yesterday.getMonth() + 1) + "/" + yesterday.getDate() + "/" + yesterday.getFullYear());
  let portfolioData = {};
  portfolioData[yesterdayString] = 10000;
  expect(rest).toEqual(
    {
    email: testAccount+testAccountNumber,
    buyingPower: 10000,
    stocks: [],
    balance: portfolioData,
    watchList: []
    });
  await request(app).put('/closeConnection').send({ connectionKey: key});
});


test('Test Buying and Selling Stock', async () => {
  testAccountNumber = 0;
  let stockList;
  let userProfile;
  let key;
  await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber }).then(response =>
  {
      key = response.text;
  });
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key });
  await request(app).put('/createAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key });
  await request(app).get('/getStocks?heading=').then(response => 
  {
      stockList = response.body;
  });
  //for(let i = 0; i < stockList[0].length; i++)
  for(let i = 0; i < 10; i++)
  {
    var j = Math.floor(Math.random()*stockList.length);
    await request(app).post('/buyStock').send({ userKey: testAccount+testAccountNumber, stock: stockList[0][j][0], amount: 1, connectionKey: key });
    await request(app).get(`/getPortfolioData?userKey=${testAccount+testAccountNumber}&connectionKey=${key}&stock=${stockList[0][j][0]}`).then(response => 
    {
      let body = response.body;
      console.log(body);
      //expect(body[stocks][stockList[0][j][0]]).toEqual(1);
    });
    await request(app).get(`/getPortfolioData?userKey=${testAccount+testAccountNumber}&connectionKey=${key}`).then(response => 
    {
        userProfile = response.body;
    });
    expect(userProfile.stocks).toEqual({ [stockList[0][j][0]]: 1 });
    await request(app).post('/sellStock').send({ userKey: testAccount+testAccountNumber, stock: stockList[0][j][0], amount: 1, connectionKey: key  });
    await request(app).get(`/getPortfolioData?userKey=${testAccount+testAccountNumber}&connectionKey=${key}`).then(response => 
    {
        userProfile = response.body;
    });
    expect(userProfile.stocks).toEqual(undefined);
  }
  await request(app).put('/closeConnection').send({ connectionKey: key});
});


test(' Test Create Challenge', async () => {
  testAccountNumber = 0;
  let stockList;
  let key;
  await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber }).then(response =>
  {
      key = response.text;
  });
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key  });
  await request(app).put('/createAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key  });
  await request(app).put('/challengeCreatePersonalChallenge').send({ userKey: testAccount+testAccountNumber, connectionKey: key }).then(response => 
  {
      stockList = response.body;
  });
  console.log(stockList.stocks);
  await request(app).put('/closeConnection').send({ connectionKey: key});
});


test('Test Challenge Leaderboard', async () => {
  testAccountNumber = 0;
  let key;
  for(let i = 0; i < 10; i++)
  {
    testAccountNumber = i;
    await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber}).then(response =>
    {
        key = response.text;
    });
    await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key   });
    await request(app).put('/createAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key   });
    await request(app).get(`/challengeHasCompletedDaily?userKey=${testAccount+testAccountNumber}&connectionKey=${key}`).then(response => 
      {
          expect(response.body).toEqual({"isFinished": 0});
      });
    for(let i = 0; i < 13; i++)
    {
      await request(app).post('/challengeNextMonth').send({ userKey: testAccount+testAccountNumber, daily: 1, connectionKey: key  });
    }
    await request(app).get(`/challengeHasCompletedDaily?userKey=${testAccount+testAccountNumber}&connectionKey=${key}`).then(response => 
    {
        expect(response.body).toEqual({"isFinished": 1});
    });
    await request(app).get('/challengeGetLeaderboard').send({today: 1}).then(response => 
    {
        console.log(response.body);
    });
    await request(app).get(`/challengeGetUserLeaderboardPosition?userKey=${testAccount+testAccountNumber}&today=1&connectionKey=${key}`).then(response => 
    {
        console.log(response.body);
    });
    await request(app).put('/closeConnection').send({ connectionKey: key});
  }
});

test('Add Accounts for Personal Challenge', async () => {
  testAccountNumber = 0;
  let key;
  for(let i = 0; i < numIterations; i++)
  {
    await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber}).then(response =>
    {
        key = response.text;
    });
    testAccountNumber = i;
    await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key   });
    await request(app).put('/createAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key   });
    await request(app).put('/closeConnection').send({ connectionKey: key});
    console.log("created account " + testAccount+testAccountNumber);
  }
});

test('Test Personal Challenge', async () => {
  testAccountNumber = 0;
  let key;
  for(let i = 0; i < numIterations; i++)
  {
    testAccountNumber = i;
    await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber}).then(response =>
    {
        key = response.text;
    });
    testAccountNumber = i;
    await request(app).put('/challengeCreatePersonalChallenge').send({ userKey: testAccount+testAccountNumber, connectionKey: key}).then(response =>
    {
      expect(response.text.length).toBeGreaterThan(0);
    });
    await request(app).get(`/challengeGetStockData?userKey=${testAccount+testAccountNumber}&daily=0&connectionKey=${key}`).then(response => 
    {
      let body = response.body;
      console.log(body);
      //expect(body.length).toBeGreaterThan(0);
    });
    await request(app).post('/challengeBuyStock').send({ userKey: testAccount+testAccountNumber, stock: 0, amount: 1, connectionKey: key, daily: 0 });
    await request(app).get(`/challengeGetStocks?userKey=${testAccount+testAccountNumber}&daily=0&connectionKey=${key}`).then(response => 
    {
        expect(response.body[0]).toEqual(1);
    });
    await request(app).get(`/challengeGetBuyingPower?userKey=${testAccount+testAccountNumber}&daily=0&connectionKey=${key}`).then(response => 
    {
        //expect(response.body[0]).toBeLessThan(10000);
    });
    await request(app).get(`/challengeGetBalance?userKey=${testAccount+testAccountNumber}&daily=0&connectionKey=${key}`).then(response => 
      {
          //expect(response.body[0]).toEqual(10000);
      });
    await request(app).post('/challengeSellStock').send({ userKey: testAccount+testAccountNumber, stock: 0, amount: 1, connectionKey: key, daily: 0 });
    await request(app).get(`/challengeGetStocks?userKey=${testAccount+testAccountNumber}&daily=0&connectionKey=${key}`).then(response => 
      {
          //expect(response.body[0]).toEqual(0);
      });
    for(let j = 0; j < 13; j++)
    {
      await request(app).post('/challengeNextMonth').send({ userKey: testAccount+testAccountNumber, daily: 0, connectionKey: key  });
      await request(app).post('/challengeNextWeek').send({ userKey: testAccount+testAccountNumber, daily: 0, connectionKey: key  });
      await request(app).post('/challengeNextDay').send({ userKey: testAccount+testAccountNumber, daily: 0, connectionKey: key  });
    }
    await request(app).put('/closeConnection').send({ connectionKey: key});
  }
});

test('Remove Accounts for Personal Challenge', async () => {
  testAccountNumber = 0;
  let key;
  for(let i = 0; i < numIterations; i++)
  {
    await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber, connectionKey: key  }).then(response =>
    {
        key = response.text;
    });
    testAccountNumber = i;
    await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key   });
    await request(app).put('/closeConnection').send({ connectionKey: key, connectionKey: key  });
    console.log("removed account " + testAccount+testAccountNumber);
  }
});

/*test('Test Daily Update', async () => {
  await request(app).get('/update');
  console.log("checkpoint");
  jest.spyOn(global, 'Date').mockImplementation(() => new Date(-3));
  console.log("checkpoint");
  await request(app).get('/update');
  console.log("checkpoint");
  await request(app).get('/challengeGetLeaderboard?today=1').then(response => 
  {
      console.log(response.body);
      expect(response.body).toEqual([]);
  });
  console.log("checkpoint");
  global.Date.mockRestore();
  await request(app).get('/update');
  console.log("checkpoint");
});*/

test('Test WatchList', async () => {
  testAccountNumber = 0;
  let key;
  await request(app).put('/openConnection').send({ userKey: testAccount+testAccountNumber }).then(response =>
  {
      key = response.text;
  });
  await request(app).put('/removeAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key });
  await request(app).put('/createAccount').send({ userKey: testAccount+testAccountNumber, connectionKey: key });
  await request(app).get(`/getWatchList?userKey=${testAccount+testAccountNumber}&connectionKey=${key}`).then(response => 
  {
      expect(response.body).toEqual([]);
  });
  await request(app).post('/addWatchList').send({ userKey: testAccount+testAccountNumber, connectionKey: key, stock: "GOOG"  });
  await request(app).get(`/getWatchList?userKey=${testAccount+testAccountNumber}&connectionKey=${key}`).then(response => 
  {
      expect(response.body).toEqual(["GOOG"]);
  });
  await request(app).post('/removeWatchList').send({ userKey: testAccount+testAccountNumber, connectionKey: key, stock: "GOOG"  });
  await request(app).get(`/getWatchList?userKey=${testAccount+testAccountNumber}&connectionKey=${key}`).then(response => 
  {
      expect(response.body).toEqual([]);
  });
});

test('Test getHistoricalData', async () => {
  await request(app).get(`/getHistoricalData?stock=GOOG`).then(response => 
  {
    let data = response.body;
    console.log(data);
    expect(data.length).toBeGreaterThan(0);
  });
});






