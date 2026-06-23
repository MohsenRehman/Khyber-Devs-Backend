import dotenv from 'dotenv';
import path from 'path';

console.log('Current CWD:', process.cwd());
const result = dotenv.config();
console.log('Dotenv Config Result:', result);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
console.log('REDIS_URL:', process.env.REDIS_URL);
