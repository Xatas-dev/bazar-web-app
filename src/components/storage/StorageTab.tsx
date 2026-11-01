import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileIcon,
  Folder,
  FolderPlus,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function StorageUploadButton({ spaceId, canUpload = false, currentFolderId = null }: StorageUploadButtonProps) {
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
       className={cn('gap-2 rounded-full', !canUpload && 'opacity-50')}
     >
       {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
       <span>Загрузить</span>
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
   const name = window.prompt('Название папки');
   if (!name || !name.trim()) return;

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
   if (!window.confirm(`Удалить элемент "${fileName || 'безымянный'}"?`)) return;

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
   if (!draggedNodeId) return;
   await moveNodeToTarget(draggedNodeId, targetParentId);
   setDraggedNodeId(null);
  };

  if (isLoading) {
   return <StorageTabSkeleton />;
  }

  if (error) {
   return (
     <div className="rounded-lg border border-destructive bg-background p-6 text-destructive">
       <h3 className="text-lg font-semibold">Ошибка загрузки файлов</h3>
       <p className="text-sm text-muted-foreground">Не удалось загрузить файлы из хранилища. Пожалуйста, попробуйте позже.</p>
     </div>
   );
  }

  return (
   <div className="flex h-full min-h-0 flex-col gap-3">
     <div className="flex flex-wrap items-center justify-between gap-3">
       <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
         <button
           type="button"
           onClick={handleRootClick}
           draggable
           onDragOver={(event) => {
             event.preventDefault();
           }}
           onDrop={async (event) => {
             event.preventDefault();
             await handleDropOnFolder(null);
           }}
           className={cn(
             'rounded-full border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-accent',
             currentParentId === null && 'bg-primary/10 text-primary ring-1 ring-primary/20'
           )}
         >
           {currentSpaceName}
         </button>

         {folderTrail.length > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}

         {folderTrail.map((folder, index) => (
           <div key={folder.id} className="flex items-center gap-1.5">
             <button
               type="button"
               onClick={() => handleBreadcrumbClick(index)}
               draggable
               onDragOver={(event) => {
                 event.preventDefault();
               }}
               onDrop={async (event) => {
                 event.preventDefault();
                 await handleDropOnFolder(folder.id);
               }}
               className={cn(
                 'rounded-full border px-3 py-1.5 transition-colors hover:bg-accent',
                 index === folderTrail.length - 1
                   ? 'border-primary/30 bg-primary/10 text-primary ring-1 ring-primary/15'
                   : 'border-border bg-muted/30 text-muted-foreground'
               )}
             >
               {folder.name}
             </button>
             {index < folderTrail.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
           </div>
         ))}
       </div>

       <div className="flex items-center gap-2">
         <Button type="button" variant="outline" size="sm" onClick={handleCreateFolder} disabled={!canUpload}>
           <FolderPlus className="mr-2 h-4 w-4" />
           Создать папку
         </Button>
         <StorageUploadButton spaceId={spaceId} canUpload={canUpload} currentFolderId={currentParentId} />
       </div>
     </div>

     {files.length === 0 ? (
       <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
         <div className="flex flex-col items-center gap-3 py-12 text-center">
           <Folder className="h-10 w-10 opacity-60" />
           <p>{currentParentId ? 'Папка пустая' : 'Файлы и папки ещё не созданы'}</p>
         </div>
       </div>
     ) : (
       <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-6">
         {files.map((node) => {
           const nodeName = getNodeDisplayName(node);
           const isPendingDelete = pendingDeleteNodeIds.has(node.nodeId);
           const isCurrentUserFile = isOwnedByCurrentUser(node.author);
           const isFolder = node.type === 'FOLDER';

           return (
             <motion.div
               key={node.nodeId}
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full"
             >
               <div
                 draggable
                 onDragStart={() => setDraggedNodeId(node.nodeId)}
                 onDragEnd={() => setDraggedNodeId(null)}
                 onDragOver={(event) => {
                   if (isFolder) {
                     event.preventDefault();
                   }
                 }}
                 onDrop={async (event) => {
                   event.preventDefault();
                   if (isFolder) {
                     await handleDropOnFolder(node.nodeId);
                   }
                 }}
                 className={cn(
                   'group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-primary/40 hover:bg-accent/30',
                   isFolder && 'cursor-pointer',
                   isCurrentUserFile && 'bg-primary/5',
                   draggedNodeId === node.nodeId && 'opacity-60 ring-1 ring-primary/20'
                 )}
               >
                 <button
                   type="button"
                   onClick={() => (isFolder ? handleOpenFolder(node) : undefined)}
                   className="flex min-w-0 flex-1 items-center gap-3 text-left"
                 >
                   <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', isFolder ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground')}>
                     {isFolder ? <Folder className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
                   </div>
                   <div className="min-w-0">
                     <p className="truncate font-medium text-foreground">{nodeName}</p>
                     {!isFolder && (
                       <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                         <span>{formatBytes(node.size)}</span>
                         {node.uploadedAt && <span>• {formatUploadedAt(node.uploadedAt)}</span>}
                         <span>• от {getAuthorName(node.author)}</span>
                       </div>
                     )}
                     {isFolder && (
                       <p className="mt-1 text-xs text-muted-foreground">Папка</p>
                     )}
                   </div>
                 </button>

                 <div className="flex items-center gap-2">
                   {node.type === 'FILE' && (
                     <Button
                       type="button"
                       variant="ghost"
                       size="icon"
                       onClick={() => handleDownload(node.nodeId, node.nodeName ?? node.fileName ?? null, node.author)}
                       className={cn('h-9 w-9', !canDownload && !isCurrentUserFile && 'opacity-50')}
                       disabled={downloadUrlMutation.isPending || isPendingDelete}
                       title={`Скачать ${nodeName}`}
                     >
                       {downloadUrlMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                     </Button>
                   )}

                   <Button
                     type="button"
                     variant="ghost"
                     size="icon"
                     onClick={() => handleDeleteFile(node.nodeId, node.nodeName ?? node.fileName ?? null)}
                     className="h-9 w-9 text-destructive"
                     disabled={isPendingDelete}
                     title={`Удалить ${nodeName}`}
                   >
                     {isPendingDelete ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                   </Button>
                 </div>
               </div>
             </motion.div>
           );
         })}
       </div>
     )}

     {totalPages > 1 && (
       <div className="flex items-center justify-between">
         <p className="text-sm text-muted-foreground">
           Страница {currentPage + 1} из {totalPages}
         </p>
         <div className="flex gap-2">
           <Button
             variant="outline"
             size="sm"
             onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
             disabled={currentPage === 0}
           >
             <ChevronLeft className="h-4 w-4" />
           </Button>
           <Button
             variant="outline"
             size="sm"
             onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
             disabled={currentPage === totalPages - 1}
           >
             <ChevronRight className="h-4 w-4" />
           </Button>
         </div>
       </div>
     )}
   </div>
  );
};
