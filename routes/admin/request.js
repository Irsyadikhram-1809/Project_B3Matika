import { errorResponse } from '../../_lib/auth.js';

export default function handler(req, res) {
  return errorResponse(res, 'Endpoint ini sudah usang (Deprecated). Gunakan alur token admin baru.', 410);
}
