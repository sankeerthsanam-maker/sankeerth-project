import { products } from '../mocks/products.ts';
import type { CartItem } from '../types/product.ts';
export function total(cart:CartItem[]){return cart.reduce((sum,item)=>sum+(products.find(p=>p.id===item.productId)?.price??0)*item.quantity,0)}
export function recommend(query:string){const q=query.toLowerCase(); const budget=q.match(/(?:under|below|budget(?: of)?)\s*(?:₹|rs\.?\s*)?([\d,]+)/); return products.filter(p=>(!budget||p.price<=Number(budget[1].replaceAll(',','')))&&(!/earbud|headphone|speaker/.test(q)||q.includes(p.category.toLowerCase().replace(/s$/,'')))&&(!/noise|anc/.test(q)||p.anc));}
