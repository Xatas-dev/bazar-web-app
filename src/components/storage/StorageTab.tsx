import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CornerLeftUp,
  Download,
  EllipsisVertical,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  FolderInput,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { confirmDialog, promptDialog } from '@/lib/dialogs';
import { StorageTabSkeleton } from './StorageTabSkeleton';
import { getDisplayName } from '@/lib/user-display';
import { notify } from '@/lib/notifications';
import { cn, formatBytes } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import { useSpaces } from '@/hooks/useSpaces';
import {
  getFileStatus,
  useCreateNode,
  useDeleteNode,
  useDownloadUrl,
  useInitiateUpload,
  useMoveNode,
  useNodes,
  useUploadUrl,
} from '@/hooks/useStorage';
import { V1GetNodesAuthorResponse, V1GetNodesResponse } from '@/types/storage';

interface StorageTabProps {
  spaceId: number;
  canUpload?: boolean;
  canDownload?: boolean;
  canDelete?: boolean;
}

interface StorageUploadButtonProps extends StorageTabProps {
  currentFolderId?: string | null;
  className?: string;
}

const formatUploadedAt = (dateString: string | null) => {
  if (!dateString) return '—';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
   day: 'numeric',
   month: 'long',
   hour: '2-digit',
   minute: '2-digit',
   hour12: false,
  })
   .format(date)
   .replace(' г. в ', ' в ')
   .replace(' в 0', ' в ');
};

const getNodeDisplayName = (node: V1GetNodesResponse) => {
  return (node.nodeName ?? node.fileName ?? 'Безымянный').trim() || 'Безымянный';
};

const FILE_KINDS: Array<{ icon: ComponentType<{ className?: string }>; extensions: string[] }> = [
  { icon: FileImage, extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic', 'bmp', 'avif'] },
  { icon: FileVideo, extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] },
  { icon: FileAudio, extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] },
  { icon: FileArchive, extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'] },
  { icon: FileSpreadsheet, extensions: ['xls', 'xlsx', 'csv', 'ods', 'numbers'] },
  { icon: FileCode, extensions: ['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py', 'java', 'kt', 'go', 'rs', 'sql', 'yaml', 'yml', 'xml', 'sh'] },
  { icon: FileText, extensions: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'ppt', 'pptx'] },
];

const getFileIcon = (name: string) => {
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() ?? '' : '';
  return FILE_KINDS.find((kind) => kind.extensions.includes(extension))?.icon ?? FileIcon;
};

const pluralizeItems = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} элемент`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} элемента`;
  return `${count} элементов`;
};

const pollFileStatus = async (spaceId: number, nodeId: string): Promise<{ status: string; errors?: any[] }> => {
  const interval = 2000;
  const maxAttempts = 60;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
   try {
     const res = await getFileStatus({ spaceId, nodeId });
     if (res?.status === 'UPLOADED') {
       return { status: 'UPLOADED' };
     }
     if (res?.status === 'ERROR') {
       return { status: 'ERROR', errors: res?.errors };
     }
   } catch {
     // ignore transient errors while polling
   }
   await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return { status: 'TIMEOUT' };
};

export function StorageUploadButton({ spaceId, canUpload = false, currentFolderId = null, className }: StorageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const initiateUploadMutation = useInitiateUpload();
  const uploadUrlMutation = useUploadUrl();
  const queryClient = useQueryClient();

  const onUploadClick = () => {
   if (!canUpload) {
     notify.error.forbidden();
     return;
   }
   fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];
   if (!file) return;

   e.currentTarget.value = '';
   setIsUploading(true);

   try {
     const createdNode = await initiateUploadMutation.mutateAsync({
       spaceId,
       fileName: file.name,
       size: file.size,
       parentId: currentFolderId,
     });

     if (createdNode.errors && createdNode.errors.length > 0) {
       createdNode.errors.forEach((error) => notify.error.generic(error.description));
       return;
     }

     const uploadInfo = await uploadUrlMutation.mutateAsync({
       spaceId,
       nodeId: createdNode.nodeId,
     });

     const putRes = await fetch(uploadInfo.uploadUrl, {
       method: 'PUT',
       headers: {
         'Content-Type': file.type || 'application/octet-stream',
       },
       body: file,
     });

     if (!putRes.ok) {
       notify.error.generic('Загрузка не удалась. Пожалуйста, попробуйте снова.');
       return;
     }

     const result = await pollFileStatus(spaceId, createdNode.nodeId);
     if (result.status === 'UPLOADED') {
       await queryClient.invalidateQueries({ queryKey: ['nodes', spaceId] });
       return;
     }

     if (result.status === 'ERROR') {
       if (result.errors && result.errors.length > 0) {
         result.errors.forEach((error) => notify.error.generic(error.description));
       } else {
         notify.error.generic('Обработка файла не удалась. Пожалуйста, попробуйте снова.');
       }
       return;
     }

     notify.error.timeout();
   } catch (err: any) {
     if (err?.response?.status === 400) {
       const errors = err.response.data;
       if (Array.isArray(errors) && errors.length > 0) {
         errors.forEach((error: any) => {
           if (error.description) notify.error.generic(error.description);
         });
       } else {
         notify.error.generic();
       }
     } else if (err?.response?.status !== 403) {
       notify.error.generic();
     }
   } finally {
     setIsUploading(false);
   }
  };

  return (
   <>
     <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
     <Button
       type="button"
       onClick={onUploadClick}
       disabled={isUploading || !canUpload}
       className={cn('h-10 gap-2 rounded-full px-4', !canUpload && 'opacity-50', className)}
     >
       {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
       {isUploading ? 'Загрузка…' : 'Загрузить'}
     </Button>
   </>
  );
}

export const StorageTab: React.FC<StorageTabProps> = ({ spaceId, canUpload = false, canDownload = false, canDelete = false }) => {
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [folderTrail, setFolderTrail] = useState<Array<{ id: string; name: string }>>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pendingDeleteNodeIds, setPendingDeleteNodeIds] = useState<Set<string>>(new Set());
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  // Folder (or breadcrumb; `root` for the space) currently highlighted as a drop target
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  // Node picked for "Переместить в…" (the touch-friendly alternative to drag-and-drop)
  const [moveNode, setMoveNode] = useState<V1GetNodesResponse | null>(null);
  const pageSize = 20;
  const queryClient = useQueryClient();
  const { user: currentUser } = useUser();
  const { data: spacesData } = useSpaces();
  const currentSpaceName = spacesData?.spaces.find((space) => space.id === spaceId)?.name ?? `Спейс #${spaceId}`;

  const { data: nodesData, isLoading, error } = useNodes({
   spaceId,
   parentId: currentParentId,
   page: currentPage,
   pageSize,
  });

  const downloadUrlMutation = useDownloadUrl();
  const deleteNodeMutation = useDeleteNode();
  const createNodeMutation = useCreateNode();
  const moveNodeMutation = useMoveNode();

  const files = useMemo(() => nodesData?.content || [], [nodesData]);
  const totalPages = nodesData?.totalPages || 0;

  const getAuthorName = (author: V1GetNodesAuthorResponse | null) => {
   return getDisplayName(author?.firstName ?? null, author?.lastName ?? null, 'Неизвестно');
  };

  const isOwnedByCurrentUser = (author: V1GetNodesAuthorResponse | null) => {
   if (!author || !currentUser) return false;

   const authorName = getDisplayName(author.firstName, author.lastName, '').trim().toLowerCase();
   const currentName = (currentUser.displayName || '').trim().toLowerCase();
   return authorName === currentName;
  };

  const handleOpenFolder = (node: V1GetNodesResponse) => {
   if (node.type !== 'FOLDER') return;
   setCurrentPage(0);
   setFolderTrail((prev) => [...prev, { id: node.nodeId, name: getNodeDisplayName(node) }]);
   setCurrentParentId(node.nodeId);
  };

  const handleBreadcrumbClick = (index: number) => {
   const nextTrail = folderTrail.slice(0, index + 1);
   setFolderTrail(nextTrail);
   setCurrentParentId(nextTrail.at(-1)?.id ?? null);
   setCurrentPage(0);
  };

  const handleRootClick = () => {
   setFolderTrail([]);
   setCurrentParentId(null);
   setCurrentPage(0);
  };

  const handleCreateFolder = async () => {
   const name = await promptDialog({
     title: 'Новая папка',
     placeholder: 'Название папки',
     confirmLabel: 'Создать',
   });
   if (!name) return;

   try {
     const created = await createNodeMutation.mutateAsync({
       spaceId,
       name: name.trim(),
       type: 'FOLDER',
       parentId: currentParentId,
     });

     if (created.errors && created.errors.length > 0) {
       created.errors.forEach((error) => notify.error.generic(error.description));
       return;
     }

     await queryClient.invalidateQueries({ queryKey: ['nodes', spaceId] });
   } catch (err: any) {
     if (err?.response?.status === 400 || err?.response?.status === 404) {
       notify.error.generic('Техническая ошибка. Попоробуйте позже');
     } else if (err?.response?.status !== 403) {
       notify.error.generic();
     }
   }
  };

  const handleDownload = async (nodeId: string, fileName: string | null, author: V1GetNodesAuthorResponse | null) => {
   if (!canDownload && !isOwnedByCurrentUser(author)) {
     notify.error.forbidden();
     return;
   }

   try {
     const response = await downloadUrlMutation.mutateAsync({ spaceId, nodeId });
     const link = document.createElement('a');
     link.href = response.downloadUrl;
     link.download = fileName || 'file';
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   } catch (err: any) {
     if (err?.response?.status !== 403) {
       notify.error.generic('Не удалось скачать файл. Пожалуйста, попробуйте снова.');
     }
   }
  };

  const handleDeleteFile = async (nodeId: string, fileName: string | null) => {
   if (!canDelete) {
     notify.error.forbidden();
     return;
   }

   if (pendingDeleteNodeIds.has(nodeId)) return;
   const confirmed = await confirmDialog({
     title: `Удалить «${fileName || 'безымянный'}»?`,
     description: 'Элемент будет удалён из хранилища спейса.',
     confirmLabel: 'Удалить',
     destructive: true,
   });
   if (!confirmed) return;

   setPendingDeleteNodeIds((prev) => {
     const next = new Set(prev);
     next.add(nodeId);
     return next;
   });

   try {
     await deleteNodeMutation.mutateAsync({ spaceId, nodeId });
   } catch (err: any) {
     if (err?.response?.status !== 403) {
       notify.error.generic('Не удалось удалить элемент. Пожалуйста, попробуйте снова.');
     }
   } finally {
     setPendingDeleteNodeIds((prev) => {
       const next = new Set(prev);
       next.delete(nodeId);
       return next;
     });
   }
  };

  const moveNodeToTarget = async (nodeId: string, targetParentId: string | null) => {
   if (!nodeId) return;

   const sourceParentId = currentParentId;
   const sourceKey = ['nodes', spaceId, sourceParentId, currentPage, pageSize] as const;
   const targetKey = ['nodes', spaceId, targetParentId, 0, pageSize] as const;

   try {
     const sourceData = queryClient.getQueryData<any>(sourceKey);
     const movedNode = sourceData?.content?.find((item: any) => item.nodeId === nodeId);

     await moveNodeMutation.mutateAsync({
       spaceId,
       nodeId,
       parentId: targetParentId,
     });

     if (sourceData) {
       queryClient.setQueryData(sourceKey, {
         ...sourceData,
         content: (sourceData.content || []).filter((item: any) => item.nodeId !== nodeId),
       });
     }

     if (movedNode && targetParentId !== sourceParentId) {
       const targetData = queryClient.getQueryData<any>(targetKey) || { content: [] };
       queryClient.setQueryData(targetKey, {
         ...targetData,
         content: [movedNode, ...(targetData.content || [])],
       });
     }
   } catch (err: any) {
     const status = err?.response?.status;
     if (status === 400 || status === 404) {
       notify.error.generic('Техническая ошибка. Попоробуйте позже');
     } else if (status === 409) {
       notify.error.generic('Этот узел нельзя перенести в выбранный!');
     } else if (status !== 403) {
       notify.error.generic();
     }
   }
  };

  const handleDropOnFolder = async (targetParentId: string | null) => {
   setDropTargetId(null);
   if (!draggedNodeId) return;
   await moveNodeToTarget(draggedNodeId, targetParentId);
   setDraggedNodeId(null);
  };

  const parentFolder = folderTrail.length > 0 ? folderTrail.at(-2) ?? null : undefined;
  const moveTargets = moveNode
   ? files.filter((node) => node.type === 'FOLDER' && node.nodeId !== moveNode.nodeId)
   : [];

  const handleMoveTo = async (targetParentId: string | null) => {
   if (!moveNode) return;
   const nodeId = moveNode.nodeId;
   setMoveNode(null);
   await moveNodeToTarget(nodeId, targetParentId);
  };

  // Folders first, then files; API order within each group
  const sortedNodes = [...files].sort((a, b) => Number(b.type === 'FOLDER') - Number(a.type === 'FOLDER'));

  const dropTargetProps = (targetId: string | null) => {
   const key = targetId ?? 'root';
   return {
     onDragOver: (event: React.DragEvent) => {
       if (!draggedNodeId || draggedNodeId === targetId) return;
       event.preventDefault();
       if (dropTargetId !== key) setDropTargetId(key);
     },
     onDragLeave: () => setDropTargetId((current) => (current === key ? null : current)),
     onDrop: async (event: React.DragEvent) => {
       event.preventDefault();
       await handleDropOnFolder(targetId);
     },
   };
  };

  if (isLoading) {
   return <StorageTabSkeleton />;
  }

  if (error) {
   return (
     <div className="mx-auto w-full max-w-4xl px-3 pt-2 sm:px-6">
       <div className="rounded-lg border border-destructive bg-[hsl(var(--panel-surface-muted))] p-6 text-destructive">
         <h3 className="text-lg font-semibold">Ошибка загрузки файлов</h3>
         <p className="text-sm text-muted-foreground">Не удалось загрузить файлы из хранилища. Пожалуйста, попробуйте позже.</p>
       </div>
     </div>
   );
  }

  const crumbClass = (active: boolean, isDropTarget: boolean) =>
   cn(
     'max-w-[9rem] shrink-0 truncate rounded-full px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[14rem]',
     active ? 'font-semibold text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
     isDropTarget && 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/40'
   );

  return (
   <div className="relative flex h-full min-h-0 flex-col">
     {/* Scrolls under the floating tab pill (top) and action bar (bottom), like the chat */}
     <div className="relative z-0 -mt-14 min-h-0 flex-1 overflow-y-auto overscroll-contain pt-14 message-fade-mask md:-mt-16 md:pt-16">
       <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 pb-28 sm:px-6 md:pb-32">
         {/* Path */}
         <nav aria-label="Путь" className="flex min-w-0 items-center gap-1 text-sm">
           {folderTrail.length > 0 ? (
             <Button
               type="button"
               variant="ghost"
               size="icon"
               className="h-9 w-9 shrink-0 rounded-full"
               onClick={() => (folderTrail.length > 1 ? handleBreadcrumbClick(folderTrail.length - 2) : handleRootClick())}
               aria-label="Назад"
             >
               <ArrowLeft className="h-4 w-4" />
             </Button>
           ) : (
             <span className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground" aria-hidden>
               <HardDrive className="h-4 w-4" />
             </span>
           )}
           <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
             <button
               type="button"
               onClick={handleRootClick}
               className={crumbClass(currentParentId === null, dropTargetId === 'root')}
               aria-current={currentParentId === null ? 'page' : undefined}
               {...dropTargetProps(null)}
             >
               {currentSpaceName}
             </button>
             {folderTrail.map((folder, index) => {
               const isLast = index === folderTrail.length - 1;
               return (
                 <div key={folder.id} className="flex shrink-0 items-center gap-0.5">
                   <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                   <button
                     type="button"
                     onClick={() => handleBreadcrumbClick(index)}
                     className={crumbClass(isLast, dropTargetId === folder.id)}
                     aria-current={isLast ? 'page' : undefined}
                     {...(isLast ? {} : dropTargetProps(folder.id))}
                   >
                     {folder.name}
                   </button>
                 </div>
               );
             })}
           </div>
         </nav>

         {sortedNodes.length === 0 ? (
           <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
             <div className="surface-panel-muted rounded-full p-4">
               {currentParentId ? (
                 <FolderOpen className="h-8 w-8 text-muted-foreground" />
               ) : (
                 <HardDrive className="h-8 w-8 text-muted-foreground" />
               )}
             </div>
             <div className="space-y-1">
               <h3 className="text-lg font-medium">{currentParentId ? 'Папка пустая' : 'Здесь пока пусто'}</h3>
               <p className="max-w-xs text-sm text-muted-foreground">
                 {canUpload
                   ? 'Загрузите файл или создайте папку — кнопки внизу.'
                   : 'Участники с правом загрузки ещё ничего не добавили.'}
               </p>
             </div>
           </div>
         ) : (
           <div className="surface-panel overflow-hidden rounded-lg">
             <ul className="divide-y divide-[hsl(var(--panel-border))]">
               {sortedNodes.map((node) => {
                 const nodeName = getNodeDisplayName(node);
                 const isPendingDelete = pendingDeleteNodeIds.has(node.nodeId);
                 const isCurrentUserFile = isOwnedByCurrentUser(node.author);
                 const isFolder = node.type === 'FOLDER';
                 const NodeIcon = isFolder ? Folder : getFileIcon(nodeName);
                 const rawName = node.nodeName ?? node.fileName ?? null;
                 const isDropTarget = isFolder && dropTargetId === node.nodeId;

                 return (
                   <li
                     key={node.nodeId}
                     draggable
                     onDragStart={() => setDraggedNodeId(node.nodeId)}
                     onDragEnd={() => {
                       setDraggedNodeId(null);
                       setDropTargetId(null);
                     }}
                     {...(isFolder ? dropTargetProps(node.nodeId) : {})}
                     className={cn(
                       'group flex items-center gap-1 pr-1 transition-colors hover:bg-accent/50 md:gap-2 md:pr-2',
                       isPendingDelete && 'pointer-events-none opacity-[var(--panel-disabled-opacity)]',
                       draggedNodeId === node.nodeId && 'opacity-[var(--panel-disabled-opacity)]',
                       isDropTarget && 'bg-primary/10 ring-1 ring-inset ring-primary/40'
                     )}
                   >
                     <button
                       type="button"
                       onClick={() => (isFolder ? handleOpenFolder(node) : handleDownload(node.nodeId, rawName, node.author))}
                       className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                       aria-label={isFolder ? `Открыть папку ${nodeName}` : `Скачать ${nodeName}`}
                     >
                       <span
                         className={cn(
                           'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                           isFolder
                             ? 'bg-primary/10 text-primary'
                             : isCurrentUserFile
                               ? 'bg-[hsl(var(--self-block))] text-[hsl(var(--self-block-foreground))]'
                               : 'bg-muted text-muted-foreground'
                         )}
                       >
                         <NodeIcon className="h-5 w-5" />
                       </span>
                       <span className="min-w-0 flex-1">
                         <span className="block truncate font-medium text-foreground">{nodeName}</span>
                         <span className="block truncate text-xs text-muted-foreground">
                           {isFolder
                             ? 'Папка'
                             : [
                                 formatBytes(node.size),
                                 node.uploadedAt ? formatUploadedAt(node.uploadedAt) : null,
                                 isCurrentUserFile ? 'вы' : getAuthorName(node.author),
                               ]
                                 .filter(Boolean)
                                 .join(' · ')}
                         </span>
                       </span>
                       {isFolder ? <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground md:hidden" aria-hidden /> : null}
                     </button>

                     {/* Pointer devices: actions appear on hover/focus */}
                     <div className="hidden shrink-0 items-center gap-1 transition-opacity md:flex [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
                       {!isFolder && (
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           onClick={() => handleDownload(node.nodeId, rawName, node.author)}
                           className={cn('h-9 w-9 rounded-full', !canDownload && !isCurrentUserFile && 'opacity-50')}
                           disabled={downloadUrlMutation.isPending}
                           title="Скачать"
                           aria-label={`Скачать ${nodeName}`}
                         >
                           <Download className="h-4 w-4" />
                         </Button>
                       )}
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         onClick={() => setMoveNode(node)}
                         className="h-9 w-9 rounded-full"
                         disabled={moveNodeMutation.isPending}
                         title="Переместить"
                         aria-label={`Переместить ${nodeName}`}
                       >
                         <FolderInput className="h-4 w-4" />
                       </Button>
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         onClick={() => handleDeleteFile(node.nodeId, rawName)}
                         className={cn('h-9 w-9 rounded-full text-destructive hover:text-destructive', !canDelete && 'opacity-50')}
                         title="Удалить"
                         aria-label={`Удалить ${nodeName}`}
                       >
                         {isPendingDelete ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                       </Button>
                     </div>

                     {/* Phones: one menu button */}
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="h-11 w-11 shrink-0 rounded-full md:hidden"
                           aria-label={`Действия: ${nodeName}`}
                         >
                           {isPendingDelete ? <Loader2 className="h-5 w-5 animate-spin" /> : <EllipsisVertical className="h-5 w-5" />}
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="min-w-52">
                         {!isFolder && (
                           <DropdownMenuItem
                             className="h-11 gap-3"
                             disabled={downloadUrlMutation.isPending}
                             onSelect={() => handleDownload(node.nodeId, rawName, node.author)}
                           >
                             <Download className="h-4 w-4" />
                             Скачать
                           </DropdownMenuItem>
                         )}
                         <DropdownMenuItem className="h-11 gap-3" onSelect={() => setMoveNode(node)}>
                           <FolderInput className="h-4 w-4" />
                           Переместить в…
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem
                           className="h-11 gap-3 text-destructive focus:text-destructive"
                           onSelect={() => handleDeleteFile(node.nodeId, rawName)}
                         >
                           <Trash2 className="h-4 w-4" />
                           Удалить
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </li>
                 );
               })}
             </ul>
           </div>
         )}
       </div>
     </div>

     {/* Floating frosted action bar, same place and material as the chat composer */}
     <div className="pointer-events-none absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 md:bottom-6">
       <div className="mx-auto w-full max-w-4xl px-3 md:px-6">
         <div className="surface-panel-muted pointer-events-auto flex items-center gap-2 rounded-lg p-1.5 pl-4">
           {totalPages > 1 ? (
             <div className="flex min-w-0 items-center gap-1">
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-9 w-9 rounded-full"
                 onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                 disabled={currentPage === 0}
                 aria-label="Предыдущая страница"
               >
                 <ChevronLeft className="h-4 w-4" />
               </Button>
               <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                 {currentPage + 1} / {totalPages}
               </span>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-9 w-9 rounded-full"
                 onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                 disabled={currentPage === totalPages - 1}
                 aria-label="Следующая страница"
               >
                 <ChevronRight className="h-4 w-4" />
               </Button>
             </div>
           ) : (
             <span className="min-w-0 truncate text-sm text-muted-foreground">
               {sortedNodes.length > 0 ? pluralizeItems(nodesData?.totalElements ?? sortedNodes.length) : 'Нет файлов'}
             </span>
           )}

           <div className="ml-auto flex shrink-0 items-center gap-1.5">
             <Button
               type="button"
               variant="ghost"
               className={cn('h-10 gap-2 rounded-full px-3', !canUpload && 'opacity-50')}
               onClick={handleCreateFolder}
               disabled={!canUpload || createNodeMutation.isPending}
               aria-label="Создать папку"
             >
               <FolderPlus className="h-4 w-4" />
               <span className="hidden sm:inline">Папка</span>
             </Button>
             <StorageUploadButton spaceId={spaceId} canUpload={canUpload} currentFolderId={currentParentId} />
           </div>
         </div>
       </div>
     </div>

     <Dialog open={!!moveNode} onOpenChange={(open) => !open && setMoveNode(null)}>
       <DialogContent className="w-[calc(100%-2rem)] gap-3 rounded-lg max-sm:top-[12%] max-sm:translate-y-0">
         <DialogHeader className="pr-6 text-left">
           <DialogTitle className="leading-snug">Переместить в…</DialogTitle>
           <DialogDescription className="truncate">
             {moveNode ? getNodeDisplayName(moveNode) : ''}
           </DialogDescription>
         </DialogHeader>
         <div className="-mx-2 flex max-h-[50dvh] flex-col gap-1 overflow-y-auto">
           {parentFolder !== undefined && (
             <Button
               type="button"
               variant="ghost"
               className="h-12 justify-start gap-3 px-3 font-normal"
               onClick={() => handleMoveTo(parentFolder?.id ?? null)}
             >
               <CornerLeftUp className="h-5 w-5 text-muted-foreground" />
               <span className="truncate">{parentFolder ? parentFolder.name : currentSpaceName}</span>
               <span className="ml-auto shrink-0 text-xs text-muted-foreground">уровнем выше</span>
             </Button>
           )}
           {moveTargets.map((folder) => (
             <Button
               key={folder.nodeId}
               type="button"
               variant="ghost"
               className="h-12 justify-start gap-3 px-3 font-normal"
               onClick={() => handleMoveTo(folder.nodeId)}
             >
               <Folder className="h-5 w-5 text-primary" />
               <span className="truncate">{getNodeDisplayName(folder)}</span>
             </Button>
           ))}
           {parentFolder === undefined && moveTargets.length === 0 && (
             <p className="px-3 py-6 text-center text-sm text-muted-foreground">
               Здесь нет папок. Создайте папку, чтобы переместить элемент.
             </p>
           )}
         </div>
       </DialogContent>
     </Dialog>
   </div>
  );
};
