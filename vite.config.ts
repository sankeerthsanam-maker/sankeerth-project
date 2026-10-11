import {defineConfig} from 'vite'; export default defineConfig({publicDir:'apps/storefront/public',server:{fs:{strict:true},proxy:{'/api/voice':'http://127.0.0.1:8000'}},build:{outDir:'dist'}});
