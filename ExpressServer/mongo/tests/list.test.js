const db = require('../database.js');
const list = require('../list.js');
const key = "TEST_LIST"

beforeAll(async () => await db.connect());

beforeAll(async () => await list.deleteList(key));

afterAll(async () => await db.disconnect());

describe('cacheInfo Tests', () => {

    it('addList Test', async () => {
        await list.addList(key, ["ETSY", "SHOP", "DIS", "ISRG", "SQ"]);
        const new_list = await list.getList(key);

        expect(new_list[0]).toBe("ETSY");
        expect(new_list[1]).toBe("SHOP");
        expect(new_list[2]).toBe("DIS");
        expect(new_list[3]).toBe("ISRG");
        expect(new_list[4]).toBe("SQ");
    })

    it('setList Test - 1', async () => {
        await list.setList(key, ["MELI", "PINS", "AMZN"]);
        const new_list = await list.getList(key);

        expect(new_list[0]).toBe("MELI");
        expect(new_list[1]).toBe("PINS");
        expect(new_list[2]).toBe("AMZN");
    })

    it('setList Test - 1', async () => {
        await list.setList(key, []);
        const new_list = await list.getList(key);

        expect(new_list).toStrictEqual([]);
    })

})