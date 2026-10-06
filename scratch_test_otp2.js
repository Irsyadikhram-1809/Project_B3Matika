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
  
  // mock the db created_at to be 2 minutes ago to bypass the 60s limit
  console.log("=== Fast-forwarding time ===");
  await db.query("UPDATE otps SET created_at = created_at - INTERVAL '2 minutes' WHERE email='testbug@test.com'");
  
  console.log("=== Second Request (Resend after 2 mins) ===");
  await handler(req, makeRes());
  
  process.exit(0);
}
test();
