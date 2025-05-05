export default function generateAvatarURL(user: {
  id: number;
  has_avatar: boolean;
  avatar_version: number;
}) {
  const {id, has_avatar: hasAvatar, avatar_version: version} = user;

  return {
    ...user,
    avatar: hasAvatar
      ? `/api/users/${id}/avatar?v=${version}`
      : '/static/default_avatar.webp',
  };
}
