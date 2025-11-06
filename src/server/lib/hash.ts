import {hashSync} from 'bcrypt';
import shasum from '#lib/shasum';

const rounds = 10;

export default function hash(data: string) {
  return hashSync(shasum(data), rounds);
}
