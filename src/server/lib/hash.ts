import {createHash} from 'node:crypto';

export default function hash(input: string) {
  return createHash('sha256').update(input).digest('hex');
}
