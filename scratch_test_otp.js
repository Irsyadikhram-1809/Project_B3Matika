import 'dotenv/config';
import handler from './routes/auth/register/request.js';
import db from './routes/_lib/db.js';

async function test() {
  const req = {
    method: 'POST',
    body: { email: 'testbug@test.com', password: 'password123' }
  };
  
  const makeRes = () => {
    return {
      setHeader: function() {},
      status: function(c) { this.statusCode = c; return this; },
      json: function(d) { console.log("RES:", this.statusCode, d); return this; },
      end: function() { console.log("RES END"); return this; }
    };
  };

  console.log("=== First Request ===");
  await handler(req, makeRes());
  
  // wait a bit? No, let's pretend 60s passed
  // wait, what if the bug is that `otps` table has a unique constraint?
  console.log("=== Second Request (Resend) WITHOUT DELETING ===");
  // wait, the code ALREADY does `DELETE FROM otps`
  await handler(req, makeRes());
  
  process.exit(0);
}
test();
