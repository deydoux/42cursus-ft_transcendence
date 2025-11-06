import {createHash} from 'node:crypto';

export default function shasum(data: string) {
  return createHash('sha256').update(data).digest('hex');
}
