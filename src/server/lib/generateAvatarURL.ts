export default function generateAvatarURL(user: {
  id: number;
  has_avatar?: boolean;
  avatar_version?: number;
  avatar?: string;
}) {
  const {id, has_avatar: hasAvatar, avatar_version: version} = user;
  delete user.has_avatar;
  delete user.avatar_version;

  if (hasAvatar) user.avatar = `/api/users/${id}/avatar?v=${version}`;
  else user.avatar = '/static/default_avatar.webp';

  return user;
}
