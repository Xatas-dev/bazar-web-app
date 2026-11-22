import { AvatarEditor } from "@/components/AvatarEditor";
import { useUploadSpaceAvatar } from "@/hooks/useSpaces";

interface SpaceAvatarEditorProps {
  spaceId: number;
  name: string;
  avatarUrl?: string | null;
  canEdit: boolean;
  onNoPermission: () => void;
}

export function SpaceAvatarEditor({ spaceId, name, avatarUrl, canEdit, onNoPermission }: SpaceAvatarEditorProps) {
  const uploadMutation = useUploadSpaceAvatar();
  return (
    <AvatarEditor
      name={name}
      avatarUrl={avatarUrl}
      upload={(file) => uploadMutation.mutateAsync({ spaceId, file })}
      isUploading={uploadMutation.isPending}
      editLabel="Изменить аватар спейса"
      successDescription="Новый аватар спейса сохранён."
      canEdit={canEdit}
      onNoPermission={onNoPermission}
    />
  );
}
