import { useEffect, useRef, useState } from 'react';
import { useNodes, useDownloadUrl, useInitiateUpload, useDeleteNode } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Download, FileIcon, ChevronLeft, ChevronRight, Loader2, Upload, Trash2 } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { getDisplayName } from '@/lib/user-display';
import { notify } from '@/lib/notifications';
import { V1GetNodesAuthorResponse } from '@/types/storage';
import { getFileStatus } from '@/hooks/useStorage';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { motion } from 'framer-motion';
import { StorageTabSkeleton } from './StorageTabSkeleton';

interface StorageTabProps {
  spaceId: number;
  canUpload?: boolean;
  canDownload?: boolean;
  canDelete?: boolean;
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

export function StorageUploadButton({ spaceId, canUpload = false }: StorageTabProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const initiateUploadMutation = useInitiateUpload();
  const queryClient = useQueryClient();

  const onUploadClick = () => {
    if (!canUpload) {
      notify.error.forbidden();
      return;
    }
    fileInputRef.current?.click();
  };

  const pollFileStatus = async (spaceIdParam: number, nodeId: string): Promise<{ status: string; errors?: any[] }> => {
    const interval = 2000;
    const maxAttempts = 60;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await getFileStatus({ spaceId: spaceIdParam, nodeId });
        if (res?.status === 'UPLOADED') {
          return { status: 'UPLOADED' };
        }
        if (res?.status === 'ERROR') {
          return { status: 'ERROR', errors: res?.errors };
        }
      } catch (e) {
        // ignore transient errors, continue polling
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    return { status: 'TIMEOUT' };
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.currentTarget.value = '';

    setIsUploading(true);

    try {
      const init = await initiateUploadMutation.mutateAsync({ spaceId, fileName: file.name, size: file.size });
      
      // Проверяем ошибки от POST /api/v1/spaces/{spaceId}/nodes
      if (init.errors && init.errors.length > 0) {
        init.errors.forEach((error) => {
          notify.error.generic(error.description);
        });
        return;
      }

      const putRes = await fetch(init.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!putRes.ok) {
        notify.error.generic("Загрузка не удалась. Пожалуйста, попробуйте снова.");
        return;
      }

      const result = await pollFileStatus(spaceId, init.nodeId);
      if (result.status === 'UPLOADED') {
        await queryClient.invalidateQueries({ queryKey: ['nodes', spaceId] });
        return;
      }

      if (result.status === 'ERROR') {
        // Обработка ошибок из GET /api/v1/spaces/{spaceId}/nodes/{nodeId}/status
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error) => {
            notify.error.generic(error.description);
          });
        } else {
          notify.error.generic("Обработка файла не удалась. Пожалуйста, попробуйте снова.");
        }
        return;
      }

      notify.error.timeout();
    } catch (err: any) {
      if (err?.response?.status === 400) {
        const errors = err.response.data;
        if (Array.isArray(errors) && errors.length > 0) {
          errors.forEach((error: any) => {
            if (error.description) {
              notify.error.generic(error.description);
            }
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
      <button
        type="button"
        onClick={onUploadClick}
        disabled={isUploading}
        className={cn(
          "surface-panel-muted inline-flex min-w-32 items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-medium leading-none text-foreground transition-colors hover:bg-[hsl(var(--panel-surface-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !canUpload && "opacity-50"
        )}
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        <span>Загрузить</span>
      </button>
    </>
  );
}

export const StorageTab: React.FC<StorageTabProps> = ({ spaceId, canDownload = false, canDelete = false }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const [pendingDeleteNodeIds, setPendingDeleteNodeIds] = useState<Set<string>>(new Set());
  const { user: currentUser } = useUser();

  useEffect(() => {
    setCurrentPage(0);
    setPendingDeleteNodeIds(new Set());
  }, [spaceId]);

  const { data: nodesData, isLoading, error } = useNodes({
   spaceId,
   page: currentPage,
   pageSize
  });

  const downloadUrlMutation = useDownloadUrl();
  const deleteNodeMutation = useDeleteNode();

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
        notify.error.generic("Не удалось скачать файл. Пожалуйста, попробуйте снова.");
      }
    }
  };

  const handleDeleteFile = async (nodeId: string, fileName: string | null) => {
    if (!canDelete) {
      notify.error.forbidden();
      return;
    }
    if (pendingDeleteNodeIds.has(nodeId)) {
      return;
    }

    if (!confirm(`Удалить файл "${fileName || 'безымянный'}"?`)) {
      return;
    }

    setPendingDeleteNodeIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });

    try {
      await deleteNodeMutation.mutateAsync({ spaceId, nodeId });
    } catch (err: any) {
      if (err?.response?.status !== 403) {
        notify.error.generic("Не удалось удалить файл. Пожалуйста, попробуйте снова.");
      }
    } finally {
      setPendingDeleteNodeIds((prev) => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }
  };

  const getAuthorName = (author: V1GetNodesAuthorResponse | null) => {
    return getDisplayName(author?.firstName ?? null, author?.lastName ?? null, 'Неизвестно');
  };

  const normalizeName = (value: string | null | undefined) => value?.trim().toLowerCase() ?? '';

  const isOwnedByCurrentUser = (author: V1GetNodesAuthorResponse | null) => {
    if (!author || !currentUser) return false;

    return (
      normalizeName(author.firstName) === normalizeName(currentUser.firstName) &&
      normalizeName(author.lastName) === normalizeName(currentUser.lastName)
    );
  };

  if (isLoading) {
    return <StorageTabSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-[hsl(var(--panel-surface-muted))] p-6 text-destructive">
        <h3 className="text-lg font-semibold">Ошибка загрузки файлов</h3>
        <p className="text-sm text-muted-foreground">Не удалось загрузить файлы из хранилища. Пожалуйста, попробуйте позже.</p>
      </div>
    );
  }

  const files = nodesData?.content || [];
  const totalPages = nodesData?.totalPages || 0;

  return (
    <div className="relative z-0 flex h-full min-h-0 flex-col bg-transparent">
      {files.length === 0 ? (
        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3 text-center">
            <FileIcon className="h-12 w-12 opacity-50" />
            <p>Файлы ещё не загружены</p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 -mt-14 flex-1 min-h-0 overflow-y-auto pt-14 message-fade-mask sm:-mt-16 sm:pt-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 px-3 pb-24 scroll-pb-72 sm:px-6">
            {files.map((file) => {
                const fileName = file.fileName?.trim() || 'Безымянный файл';
                const isPendingDelete = pendingDeleteNodeIds.has(file.nodeId);
                const isCurrentUserFile = isOwnedByCurrentUser(file.author);

                return (
                  <motion.div
                    key={file.nodeId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                  <div
                    className={cn(
                      "group relative w-full max-w-3xl overflow-hidden transition-colors",
                      isCurrentUserFile
                        ? "rounded-lg bg-[hsl(var(--self-block))] text-[hsl(var(--self-block-foreground))]"
                        : "rounded-lg !bg-[hsl(var(--card))] text-foreground",
                    )}
                  >
                    <div className="relative flex items-center justify-between gap-3 p-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <FileIcon className={cn("h-5 w-5 flex-shrink-0", isCurrentUserFile ? "text-[hsl(var(--self-block-foreground)/0.8)]" : "text-muted-foreground")} />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate font-medium">{fileName}</p>
                          </div>
                          <div className={cn(
                            "flex flex-wrap gap-2 text-xs",
                            isCurrentUserFile ? "text-[hsl(var(--self-block-foreground)/0.8)]" : "text-muted-foreground"
                          )}>
                            <span>{formatBytes(file.size)}</span>
                            {file.uploadedAt && (
                              <>
                                <span>•</span>
                                <span>{formatUploadedAt(file.uploadedAt)}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>от {getAuthorName(file.author)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "h-10 w-10 rounded-md border-0 p-0 transition-colors hover:bg-[hsl(var(--panel-surface-strong))] hover:ring-1 hover:ring-[hsl(var(--panel-border-strong))]",
                            isCurrentUserFile &&
                              "text-[hsl(var(--self-block-foreground))] hover:bg-[hsl(var(--self-block-foreground)/0.2)] hover:ring-[hsl(var(--self-block-foreground)/0.3)] hover:text-[hsl(var(--self-block-foreground))]",
                            !canDownload && !isCurrentUserFile && "opacity-50"
                          )}
                          onClick={() => handleDownload(file.nodeId, file.fileName, file.author)}
                          disabled={downloadUrlMutation.isPending || isPendingDelete}
                          aria-label={`Скачать ${fileName}`}
                          title={`Скачать ${fileName}`}
                        >
                          {downloadUrlMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "h-10 w-10 rounded-md border-0 p-0 text-destructive transition-colors hover:bg-destructive/10 hover:ring-1 hover:ring-destructive/30 hover:text-destructive",
                            !canDelete && "opacity-50"
                          )}
                          onClick={() => handleDeleteFile(file.nodeId, file.fileName)}
                          disabled={isPendingDelete}
                          aria-label={`Удалить ${fileName}`}
                          title={`Удалить ${fileName}`}
                        >
                          {isPendingDelete ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {currentPage + 1} из {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
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
