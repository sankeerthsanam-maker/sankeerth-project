import test from 'node:test';import assert from 'node:assert/strict';import {recommend,total} from '../../packages/shared/src/utils/shopping.ts';
test('budget and category filtering',()=>{const result=recommend('earbuds under 10000');assert.equal(result.length,2);assert.ok(result.every(p=>p.price<=10000&&p.category==='Earbuds'))});
test('noise cancelling filter',()=>assert.ok(recommend('noise cancelling headphones').every(p=>p.anc&&p.category==='Headphones')));
test('cart totals account for quantities',()=>assert.equal(total([{productId:'halo',quantity:2},{productId:'air',quantity:1}]),46700));
test('no budget matches returns empty',()=>assert.deepEqual(recommend('speakers under 100'),[]));
