import { useQuery } from "@tanstack/react-query";

export interface UseBambooPlansProps {
  bambooApiBaseUrl: string;
  expand?: string;
};

export const useBambooPlans = ({
  bambooApiBaseUrl,
  expand
}: UseBambooPlansProps) => {
  // Fetch the Bamboo plans using the provided API base URL and expand parameter
  const query = useQuery({
    queryKey: ["bambooPlans"],
    queryFn: async () => {
      const url = new URL(bambooApiBaseUrl);
      url.pathname = "/rest/api/latest/plan";
      if (expand) {
        url.searchParams.append("expand", expand);
      }
      console.log("Bamboo API URL:", url.toString());
    
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      return response.json();
    },
    enabled: !!bambooApiBaseUrl,
    retry: false,
  });

  return {
    plans: query.data?.plans ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}

export default useBambooPlans;
