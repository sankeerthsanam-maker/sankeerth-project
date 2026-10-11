import test from 'node:test';
import assert from 'node:assert/strict';
import { applyShoppingAction } from '../../packages/widget/src/services/shoppingActions.ts';
import type { Cart } from '../../packages/widget/src/features/cart/useCart.ts';
function bag() { const added:string[]=[]; return { added, cart:{items:[],count:0,add:(id:string)=>added.push(id),change:()=>{},clear:()=>{}} as Cart }; }
test('voice and chat apply the requested product quantity',()=>{const b=bag();applyShoppingAction({type:'add',productId:'form',quantity:2},b.cart,()=>{});assert.deepEqual(b.added,['form','form']);});
test('mock checkout reuses an existing item without adding again',()=>{const b=bag();let step:string|undefined;applyShoppingAction({type:'checkout',productId:'form',addProduct:false},b.cart,s=>{step=s});assert.equal(step,'checkout');assert.deepEqual(b.added,[]);});
test('unknown products cannot produce a successful bag mutation',()=>{const b=bag();assert.throws(()=>applyShoppingAction({type:'add',productId:'missing'},b.cart,()=>{}));assert.deepEqual(b.added,[]);});
test('invalid quantity cannot partly modify the bag',()=>{const b=bag();assert.throws(()=>applyShoppingAction({type:'add',productId:'form',quantity:99},b.cart,()=>{}));assert.deepEqual(b.added,[]);});
