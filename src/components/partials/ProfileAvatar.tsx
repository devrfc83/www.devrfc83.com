import profile from '../../assets/images/profile.png'

type ProfileAvatarProps = {
  alt: string
  size?: 'lg' | 'md'
  className?: string
}

const sizeClasses = {
  lg: 'size-32 lg:size-48',
  md: 'size-32 lg:size-40',
} as const

const ProfileAvatar = ({ alt, size = 'lg', className = '' }: ProfileAvatarProps) => {
  return (
    <div className={`profile-avatar ${className}`.trim()}>
      <img
        src={profile}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover shadow-lg ring-4 ring-primary/40 ring-offset-2 ring-offset-base-100`}
      />
    </div>
  )
}

export default ProfileAvatar
