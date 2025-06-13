export default function serializeUserAvatar(user: {
  id: number;
  has_avatar?: boolean;
  avatar_version?: number;
  avatar?: string;
}) {
  const {id, has_avatar: hasAvatar, avatar_version: version} = user;

  delete user.has_avatar;
  delete user.avatar_version;

  user.avatar = hasAvatar
    ? `/api/users/${id}/avatar?v=${version}`
    : '/static/default_avatar.webp';
}
