import {hashSync} from 'bcrypt';

const rounds = 10;

export default function hash(data: string) {
  return hashSync(data, rounds);
}
