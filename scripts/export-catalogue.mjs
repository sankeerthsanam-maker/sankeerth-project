import {products} from '../packages/shared/src/mocks/products.ts';
import {writeFileSync} from 'node:fs';
writeFileSync(new URL('../apps/voice-service/catalogue.json',import.meta.url),JSON.stringify(products,null,2));
