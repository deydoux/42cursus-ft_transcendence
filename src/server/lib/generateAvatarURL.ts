export default function generateAvatarURL(user: {
  id: number;
  avatar_version?: number;
  avatar?: string;
}) {
  const {id, avatar_version: version} = user;
  delete user.avatar_version;

  if (version) user.avatar = `/api/users/${id}/avatar?v=${version}`;
  else user.avatar = '/static/default_avatar.webp';

  return user;
}
