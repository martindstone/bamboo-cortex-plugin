import { useQuery } from "@tanstack/react-query";

export interface UseBambooPlansProps {
  bambooApiBaseUrl: string;
  project: string;
  buildKey: string;
  expand?: string;
};

export const useBambooBuildResults = ({
  bambooApiBaseUrl,
  project,
  buildKey,
  expand
}: UseBambooPlansProps) => {
  const query = useQuery({
    queryKey: ["bamboBuildResults"],
    queryFn: async () => {
      const url = new URL(bambooApiBaseUrl);
      url.pathname = `/rest/api/latest/result/${project}-${buildKey}`;
      if (expand) {
        url.searchParams.append("expand", expand);
      }
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      return response.json();
    },
    enabled: !!bambooApiBaseUrl && !!project && !!buildKey,
    retry: false,
  });

  return {
    results: query.data?.results?.result ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}

export default useBambooBuildResults;
