import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import {
  ApproveJoinRequestsResponse,
  JoinRequestsPageResponse,
  JoinRequestsSelectionRequest,
  RejectJoinRequestsResponse,
  SpaceJoinLinkResponse,
  SpaceJoinRequestResponse,
  SpacePreviewResponse,
} from '@/types/space';

const JOIN_REQUESTS_PAGE_SIZE = 20;

// API Functions
const getSpaceJoinLink = async (spaceId: number): Promise<SpaceJoinLinkResponse> => {
  const { data } = await axiosInstance.get<SpaceJoinLinkResponse>(`/v1/spaces/${spaceId}/join-link`);
  return data;
};

// Public endpoint: the page handles 404 (invalid invite) itself, so no global toast
const getSpacePreviewByCode = async (code: string): Promise<SpacePreviewResponse> => {
  const { data } = await axiosInstance.get<SpacePreviewResponse>(
    `/v1/spaces/by-code/${encodeURIComponent(code)}`,
    { skipErrorToast: true }
  );
  return data;
};

// 404 / 409 are shown inline on the join page, so no global toast
const createJoinRequest = async (code: string): Promise<SpaceJoinRequestResponse> => {
  const { data } = await axiosInstance.post<SpaceJoinRequestResponse>(
    `/v1/spaces/by-code/${encodeURIComponent(code)}/join-requests`,
    undefined,
    { skipErrorToast: true }
  );
  return data;
};

const getJoinRequests = async (spaceId: number, page: number): Promise<JoinRequestsPageResponse> => {
  const { data } = await axiosInstance.get<JoinRequestsPageResponse>(`/v1/spaces/${spaceId}/join-requests`, {
    params: { page, size: JOIN_REQUESTS_PAGE_SIZE },
  });
  return data;
};

const approveJoinRequests = async ({
  spaceId,
  ...body
}: { spaceId: number } & JoinRequestsSelectionRequest): Promise<ApproveJoinRequestsResponse> => {
  const { data } = await axiosInstance.post<ApproveJoinRequestsResponse>(
    `/v1/spaces/${spaceId}/join-requests/approve`,
    body
  );
  return data;
};

const rejectJoinRequests = async ({
  spaceId,
  ...body
}: { spaceId: number } & JoinRequestsSelectionRequest): Promise<RejectJoinRequestsResponse> => {
  const { data } = await axiosInstance.delete<RejectJoinRequestsResponse>(`/v1/spaces/${spaceId}/join-requests`, {
    data: body,
  });
  return data;
};

// Hooks

export const useSpaceJoinLink = (spaceId: number, enabled = true) => {
  return useQuery({
    queryKey: ['space-join-link', spaceId],
    queryFn: () => getSpaceJoinLink(spaceId),
    enabled: !!spaceId && enabled,
    staleTime: Infinity,
  });
};

export const useSpacePreview = (code: string | undefined) => {
  return useQuery({
    queryKey: ['space-preview', code],
    queryFn: () => getSpacePreviewByCode(code as string),
    enabled: !!code,
    retry: false,
  });
};

export const useCreateJoinRequest = () => {
  return useMutation({ mutationFn: createJoinRequest });
};

export const useJoinRequests = (spaceId: number, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ['join-requests', spaceId],
    queryFn: ({ pageParam }) => getJoinRequests(spaceId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total && lastPage.items.length > 0 ? lastPage.page + 1 : undefined;
    },
    enabled: !!spaceId && enabled,
    // The tab badge, the invite card and the tab itself mount at different moments; a short stale
    // window lets them share one fetch. Approve/reject invalidate the cache explicitly.
    staleTime: 30_000,
  });
};

type JoinRequestsCache = InfiniteData<JoinRequestsPageResponse, number>;

/**
 * Drops handled requests from the cached pages. Handling "all" empties the list;
 * otherwise only the given ids are removed and `total` shrinks accordingly.
 */
const removeFromJoinRequestsCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  spaceId: number,
  selection: JoinRequestsSelectionRequest
) => {
  queryClient.setQueryData<JoinRequestsCache>(['join-requests', spaceId], (old) => {
    if (!old) return old;
    if (selection.all) {
      return { pages: [{ ...old.pages[0], items: [], total: 0 }], pageParams: [old.pageParams[0]] };
    }
    const ids = new Set(selection.requestIds);
    const removed = old.pages.reduce((sum, page) => sum + page.items.filter((r) => ids.has(r.id)).length, 0);
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.filter((r) => !ids.has(r.id)),
        total: Math.max(0, page.total - removed),
      })),
    };
  });
};

export const useApproveJoinRequests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveJoinRequests,
    onSuccess: (_, { spaceId, ...selection }) => {
      removeFromJoinRequestsCache(queryClient, spaceId, selection as JoinRequestsSelectionRequest);
      // Pages are offset-based, so resync after the instant local update
      queryClient.invalidateQueries({ queryKey: ['join-requests', spaceId] });
      // Approved users are new members with the default role; the enriched list comes from the server
      queryClient.invalidateQueries({ queryKey: ['space-users', spaceId] });
    },
  });
};

export const useRejectJoinRequests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectJoinRequests,
    onSuccess: (_, { spaceId, ...selection }) => {
      removeFromJoinRequestsCache(queryClient, spaceId, selection as JoinRequestsSelectionRequest);
      queryClient.invalidateQueries({ queryKey: ['join-requests', spaceId] });
    },
  });
};
