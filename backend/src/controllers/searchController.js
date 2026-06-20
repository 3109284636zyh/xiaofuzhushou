import { searchContent } from '../services/searchService.js';
import { success } from '../utils/response.js';

export async function search(req, res) {
  const { q = '', type = 'all' } = req.query || {};
  const data = await searchContent({ q, type });
  return success(res, data);
}

export default { search };
