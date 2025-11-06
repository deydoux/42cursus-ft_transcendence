import {compareSync} from 'bcrypt';
import shasum from '#lib/shasum';

export default function compareHash(data: string, hash: string) {
  return compareSync(shasum(data), hash);
}
