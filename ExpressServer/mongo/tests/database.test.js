const db = require('../database.js');
const key = "mongo_test_key";

beforeAll(async () => await db.connect());

beforeAll(async () => await db.deleteUser(key));

afterAll(async () => await db.disconnect());

describe('userInfo Tests', () => {

    it('addUser Test', async () => {
        await db.addUser(key, 10000, {"TSLA": 2, "XOM" : 1}, {"5/31/2023": 45000, "5/30/2023": 43500, "5/29/2023": 35000}, []);
        const user = await db.getUser(key);

        expect(user.email).toBe(key);
    })

    it('getUser Test - 1', async () => {
        const user = await db.getUser(key);

        expect(user.buyingPower).toBe(10000);
        expect(user.stocks["TSLA"]).toBe(2);
        expect(user.stocks["XOM"]).toBe(1);
        expect(user.balance["5/31/2023"]).toBe(45000);
        expect(user.balance["5/30/2023"]).toBe(43500);
        expect(user.balance["5/29/2023"]).toBe(35000);
    })

    it('getUser Test - 2', async () => {
        const user = await db.getUser("fake_key");

        expect(user).toBe(null);
    })

    it('addStock Test', async () => {
        await db.addStock(key, {"GOOGL": 6});
        const user = await db.getUser(key);

        expect(user.stocks["GOOGL"]).toBe(6);
    })

    it('updateStock Test', async () => {
        await db.updateStock(key, "GOOGL", 9);
        const user = await db.getUser(key);

        expect(user.stocks["GOOGL"]).toBe(9);
    })

    it('deleteStock Test', async () => {
        await db.deleteStock(key, "XOM");
        const user = await db.getUser(key);

        expect(user.stocks["XOM"]).toBe(undefined);
    })

    it('stockQuantity Test - 1', async () => {
        const amount = await db.stockQuantity(key, "GOOGL")
    
        expect(amount).toBe(9);
    })

    it('stockQuantity Test - 2', async () => {
        const amount = await db.stockQuantity(key, "XOM")
    
        expect(amount).toBe(0);
    })

    it('getUserStockList Test - 1', async () => {
        const amount = await db.getUserStockList(key)
    
        expect(amount).toStrictEqual({"GOOGL": 9, "TSLA": 2});
    })

    it('getUserStockList Test - 2', async () => {
        await db.updateStock(key, "GOOGL", 400)
        await db.updateStock(key, "TSLA", 1)
        const amount = await db.getUserStockList(key)
    
        expect(amount).toStrictEqual({"GOOGL": 400, "TSLA": 1});
    })

    it('getBuyingPower Test', async () => {
        const amount = await db.getBuyingPower(key)
    
        expect(amount).toStrictEqual(10000);
    })

    it('updateBuyingPower Test - 1', async () => {
        await db.updateBuyingPower(key, 75000000)
        const amount = await db.getBuyingPower(key)
    
        expect(amount).toStrictEqual(75000000);
    })

    it('updateBuyingPower Test - 2', async () => {
        await db.updateBuyingPower(key, -10000)
        const amount = await db.getBuyingPower(key)
    
        expect(amount).toStrictEqual(-10000);
    })

    it('addBalance Test', async () => {
        await db.addBalance(key, {"6/3/2023" : 400000})
        const user = await db.getUser(key)
        const amount = user.balance["6/3/2023"];
        expect(amount).toBe(400000);
    })

    it('updateDate Test', async () => {
        await db.updateDate(key, "6/3/2023", 0)
        const user = await db.getUser(key)
        const amount = user.balance["6/3/2023"];
        expect(amount).toBe(0);
    })

    it('addWatchList Test', async () => {
        await db.addWatchList(key, "T")
        await db.addWatchList(key, "AAPL")
        await db.addWatchList(key, "WDAY")
        const watchlist = await db.getWatchList(key)
        
        expect(watchlist[0]).toStrictEqual("T");
        expect(watchlist[1]).toStrictEqual("AAPL");
        expect(watchlist[2]).toStrictEqual("WDAY");
    })

    it('removeWatchList Test', async () => {
        await db.removeWatchList(key, "T")
        const watchlist1 = await db.getWatchList(key)
        expect(watchlist1[0]).toStrictEqual("AAPL");

        await db.removeWatchList(key, "AAPL")
        const watchlist2 = await db.getWatchList(key)
        expect(watchlist2[0]).toStrictEqual("WDAY");

        await db.removeWatchList(key, "WDAY")
        const watchlist3 = await db.getWatchList(key)
        expect(watchlist3[0]).toStrictEqual(undefined)
    })



})