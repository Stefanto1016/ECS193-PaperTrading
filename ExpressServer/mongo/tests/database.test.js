const db = require('../database.js');
const key_1 = "mongo_test_key_1";
const key_2 = "mongo_test_key_2"

beforeAll(async () => await db.connect());

beforeAll(async () => await db.deleteUser(key_1));

beforeAll(async () => await db.deleteUser(key_2));

beforeAll(async () => await db.clearLeaderboard());

afterAll(async () => await db.disconnect());

describe('userInfo Tests', () => {

    it('key_1: addUser Test', async () => {
        await db.addUser(key_1, 10000, {"TSLA": 2, "XOM" : 1}, {"5/31/2023": 45000, "5/30/2023": 43500, "5/29/2023": 35000}, []);
        const user = await db.getUser(key_1);

        expect(user.email).toBe(key_1);
    })

    it('key_1: getUser Test - 1', async () => {
        const user = await db.getUser(key_1);

        expect(user.buyingPower).toBe(10000);
        expect(user.stocks["TSLA"]).toBe(2);
        expect(user.stocks["XOM"]).toBe(1);
        expect(user.balance["5/31/2023"]).toBe(45000);
        expect(user.balance["5/30/2023"]).toBe(43500);
        expect(user.balance["5/29/2023"]).toBe(35000);
    })

    it('key_1: getUser Test - 2', async () => {
        const user = await db.getUser("fake_key_1");

        expect(user).toBe(null);
    })

    it('key_1: addStock Test', async () => {
        await db.addStock(key_1, {"GOOGL": 6});
        const user = await db.getUser(key_1);

        expect(user.stocks["GOOGL"]).toBe(6);
    })

    it('key_1: updateStock Test', async () => {
        await db.updateStock(key_1, "GOOGL", 9);
        const user = await db.getUser(key_1);

        expect(user.stocks["GOOGL"]).toBe(9);
    })

    it('key_1: deleteStock Test', async () => {
        await db.deleteStock(key_1, "XOM");
        const user = await db.getUser(key_1);

        expect(user.stocks["XOM"]).toBe(undefined);
    })

    it('key_1: stockQuantity Test - 1', async () => {
        const amount = await db.stockQuantity(key_1, "GOOGL")
    
        expect(amount).toBe(9);
    })

    it('key_1: stockQuantity Test - 2', async () => {
        const amount = await db.stockQuantity(key_1, "XOM")
    
        expect(amount).toBe(0);
    })

    it('key_1: getUserStockList Test - 1', async () => {
        const amount = await db.getUserStockList(key_1)
    
        expect(amount).toStrictEqual({"GOOGL": 9, "TSLA": 2});
    })

    it('key_1: getUserStockList Test - 2', async () => {
        await db.updateStock(key_1, "GOOGL", 400)
        await db.updateStock(key_1, "TSLA", 1)
        const amount = await db.getUserStockList(key_1)
    
        expect(amount).toStrictEqual({"GOOGL": 400, "TSLA": 1});
    })

    it('key_1: getBuyingPower Test', async () => {
        const amount = await db.getBuyingPower(key_1)
    
        expect(amount).toStrictEqual(10000);
    })

    it('key_1: updateBuyingPower Test - 1', async () => {
        await db.updateBuyingPower(key_1, 75000000)
        const amount = await db.getBuyingPower(key_1)
    
        expect(amount).toStrictEqual(75000000);
    })

    it('key_1: updateBuyingPower Test - 2', async () => {
        await db.updateBuyingPower(key_1, -10000)
        const amount = await db.getBuyingPower(key_1)
    
        expect(amount).toStrictEqual(-10000);
    })

    it('key_1: addBalance Test', async () => {
        await db.addBalance(key_1, {"6/3/2023" : 400000})
        const user = await db.getUser(key_1)
        const amount = user.balance["6/3/2023"];
        expect(amount).toBe(400000);
    })

    it('key_1: updateDate Test', async () => {
        await db.updateDate(key_1, "6/3/2023", 0)
        const user = await db.getUser(key_1)
        const amount = user.balance["6/3/2023"];
        expect(amount).toBe(0);
    })

    it('key_1: addWatchList Test', async () => {
        await db.addWatchList(key_1, "T")
        await db.addWatchList(key_1, "AAPL")
        await db.addWatchList(key_1, "WDAY")
        const watchlist = await db.getWatchList(key_1)
        
        expect(watchlist[0]).toStrictEqual("T");
        expect(watchlist[1]).toStrictEqual("AAPL");
        expect(watchlist[2]).toStrictEqual("WDAY");
    })

    it('key_1: removeWatchList Test', async () => {
        await db.removeWatchList(key_1, "T")
        const watchlist1 = await db.getWatchList(key_1)
        expect(watchlist1[0]).toStrictEqual("AAPL");

        await db.removeWatchList(key_1, "AAPL")
        const watchlist2 = await db.getWatchList(key_1)
        expect(watchlist2[0]).toStrictEqual("WDAY");

        await db.removeWatchList(key_1, "WDAY")
        const watchlist3 = await db.getWatchList(key_1)
        expect(watchlist3[0]).toStrictEqual(undefined)
    })

    it('key_1: addScore Test', async () => {
        //await db.addScore(key_1, 34343)
        const board = await db.getLeaderboard("202353");

        expect(board[0]["score"]).toBe(34343);
    })


    // different test key with different init
    it('key_2: addUser Test', async () => {
        // Testing to add a User with No Data
        await db.addUser(key_2, 0, {}, {}, []);
        const user = await db.getUser(key_2);

        expect(user.email).toBe(key_2);
        expect(user.buyingPower).toBe(0);
        expect(user.stocks).toBe(undefined);
        expect(user.balance).toBe(undefined);
        expect(user.watchList).toStrictEqual([]);
        
    })

    it('key_2: addStock Test', async () => {
        // Testing to add a User with No Data
        await db.addStock(key_2, {"AMZN" : 45});
        const user = await db.getUser(key_2);

        expect(user.stocks["AMZN"]).toBe(45);
    })

    it('key_2: updateBuyingPower Test', async () => {
        // Testing to add a User with No Data
        await db.updateBuyingPower(key_2, 678000);
        const user = await db.getUser(key_2);

        expect(user.buyingPower).toBe(678000);
    })

    it('key_2: addBalance Test', async () => {
        // Testing to add a User with No Data
        await db.addBalance(key_2, {"6/3/2023" : 485553});
        const user = await db.getUser(key_2);

        expect(user.balance["6/3/2023"]).toBe(485553);
    })

    
    it('key_2: addWatchList Test', async () => {
        // Testing to add a User with No Data
        await db.addWatchList(key_2, "ETSY");
        const wl = await db.getWatchList(key_2);

        expect(wl[0]).toBe("ETSY");
    })

})