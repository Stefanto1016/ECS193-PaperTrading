const db = require('../database.js');
const cache = require('../cache.js');

beforeAll(async () => await db.connect());
beforeAll(async () => await cache.deleteCacheStock("AAPL"));

afterAll(async () => await db.disconnect());

describe('cacheInfo Tests', () => {
    
    it('addCacheStock Test', async () => {
        await cache.addCacheStock("AAPL", [145, 134, 155, 100]);
        const stock = await cache.getHistory("AAPL");

        expect(stock[0]).toBe(145);
        expect(stock[1]).toBe(134);
        expect(stock[2]).toBe(155);
        expect(stock[3]).toBe(100);
    })

    it('updateCacheStock Test - 1', async () => {
        await cache.updateCacheStock("AAPL", [190]);
        const stock = await cache.getHistory("AAPL");

        expect(stock[0]).toBe(190);
    })

    it('updateCacheStock Test - 2', async () => {
        await cache.updateCacheStock("XOM", [190]);
        const stock = await cache.getHistory("XOM");

        expect(stock).toBe(undefined);
    })

    it('deleteCacheStock Test', async () => {
        await cache.deleteCacheStock("AAPL");
        const stock = await cache.getHistory("AAPL");

        expect(stock).toBe(undefined);
    })

})