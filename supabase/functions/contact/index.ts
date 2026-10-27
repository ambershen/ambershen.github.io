import {createHandler} from './handler.mjs';
Deno.serve(createHandler({env: name => Deno.env.get(name)}));
