import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className = "h-8 w-8" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get the initials from the user's name or email
  const getInitials = () => {
    if (user.user_metadata.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.email?.[0].toUpperCase() || "U";
  };

  return (
    <Avatar className={className}>
      {!imageError && user.user_metadata.avatar_url && (
        <AvatarImage
          src={user.user_metadata.avatar_url}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
