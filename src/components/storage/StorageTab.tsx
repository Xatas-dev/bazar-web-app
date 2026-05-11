import { useEffect, useRef, useState } from 'react';
import { useNodes, useDownloadUrl, useInitiateUpload } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileIcon, ChevronLeft, ChevronRight, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatBytes } from '@/lib/utils';
import { V1GetNodesAuthorResponse } from '@/types/storage';
import { getFileStatus } from '@/hooks/useStorage';
import { useQueryClient } from '@tanstack/react-query';

interface StorageTabProps {
  spaceId: number;
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

export const StorageTab: React.FC<StorageTabProps> = ({ spaceId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setCurrentPage(0);
  }, [spaceId]);

  const { data: nodesData, isLoading, error } = useNodes({
    spaceId,
    page: currentPage,
    pageSize
  });

  const downloadUrlMutation = useDownloadUrl();
  const initiateUploadMutation = useInitiateUpload();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDownload = async (nodeId: string, fileName: string | null) => {
    try {
      const response = await downloadUrlMutation.mutateAsync({ spaceId, nodeId });

      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = fileName || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: `File "${fileName || 'unnamed'}" downloaded successfully`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const getAuthorName = (author: V1GetNodesAuthorResponse | null) => {
    if (!author) return 'Unknown';
    const parts: string[] = [];
    if (author.firstName) parts.push(author.firstName);
    if (author.lastName) parts.push(author.lastName);
    return parts.length > 0 ? parts.join(' ') : 'Unknown';
  };

  // Validation rules
  const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
  const FORBIDDEN_EXT = ['exe', 'sh', 'bat', 'msi', 'bin', 'ps1', 'hta'];
  const MAX_NAME_LENGTH = 100;

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Poll возвращает объект с полями status и author (если есть)
  const pollFileStatus = async (spaceIdParam: number, nodeId: string): Promise<{ status: string; author?: V1GetNodesAuthorResponse | null }> => {
    const interval = 2000; // ms
    const maxAttempts = 60; // ~2 minutes

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await getFileStatus({ spaceId: spaceIdParam, nodeId });
        if (res?.status === 'UPLOADED') {
          return { status: 'UPLOADED', author: res.author ?? null };
        }
        if (res?.status === 'ERROR') {
          return { status: 'ERROR' };
        }
      } catch (e) {
        // ignore transient errors, continue polling
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    return { status: 'TIMEOUT' };
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input for next selection
    e.currentTarget.value = '';

    // Validations
    if (file.size > MAX_SIZE) {
      toast({ title: 'Error', description: 'Размер файла не может превышать 50 МБ', variant: 'destructive' });
      return;
    }

    const name = file.name || '';
    if (name.length > MAX_NAME_LENGTH) {
      toast({ title: 'Error', description: 'Длина имени файла не может превышать 100 символов', variant: 'destructive' });
      return;
    }

    const parts = name.split('.');
    const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    if (ext && FORBIDDEN_EXT.includes(ext)) {
      toast({ title: 'Error', description: 'Невозможно загрузить файл с таким расширением', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      const init = await initiateUploadMutation.mutateAsync({ spaceId, fileName: name, size: file.size });
      const uploadUrl = init.uploadUrl;
      const nodeId = init.nodeId;

      // PUT to S3 using fetch to avoid axios interceptors
      const contentType = file.type || 'application/octet-stream';
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      });

      if (!putRes.ok) {
        toast({
          title: 'Upload failed',
          description: 'Загрузка файла не удалась по техническим причинам',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Upload started', description: `File "${name}" uploaded to storage. Waiting for processing...` });

      // Poll status
      const result = await pollFileStatus(spaceId, nodeId);

      if (result.status === 'UPLOADED') {
        toast({ title: 'Success', description: `File "${name}" uploaded successfully` });

        // Insert temporary entry into cache to avoid full refresh
        const queryKey = ['nodes', spaceId, currentPage, pageSize];
        try {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;
            const newNode = {
              nodeId: nodeId,
              fileName: name,
              size: file.size,
              type: 'FILE',
              uploadedAt: new Date().toISOString(),
              author: result.author ?? null,
            };
            const newContent = [newNode, ...old.content];
            return {
              ...old,
              content: newContent,
              totalElements: (old.totalElements || 0) + 1,
            };
          });
        } catch (e) {
          // ignore cache update errors
        }
      } else if (result.status === 'ERROR') {
        toast({ title: 'Upload failed', description: 'Загрузка файла не удалась по техническим причинам', variant: 'destructive' });
      } else {
        toast({ title: 'Upload timeout', description: 'Не удалось получить статус загрузки. Попробуйте позже.', variant: 'destructive' });
      }
    } catch (err: any) {
      const message = err?.response?.data || err?.message || 'Failed to upload file';
      toast({ title: 'Error', description: String(message), variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Files</CardTitle>
          <CardDescription>
            Failed to load files from storage. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const files = nodesData?.content || [];
  const totalPages = nodesData?.totalPages || 0;
  const totalElements = nodesData?.totalElements || 0;

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
      <div className="flex justify-end">
        <Button onClick={onUploadClick} disabled={isUploading} className="mr-2">
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload
        </Button>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No files uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Files ({totalElements})</CardTitle>
              <CardDescription>
                Download files from this space
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((file) => {
                  const fileName = file.fileName?.trim() || 'Unnamed file';

                  return (
                    <div
                      key={file.nodeId}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{fileName}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>{formatBytes(file.size)}</span>
                            {file.uploadedAt && (
                              <>
                                <span>•</span>
                                <span>{formatUploadedAt(file.uploadedAt)}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>by {getAuthorName(file.author)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(file.nodeId, file.fileName)}
                        disabled={downloadUrlMutation.isPending}
                        className="flex-shrink-0 ml-2"
                      >
                        {downloadUrlMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
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
        </>
      )}
    </div>
  );
};
