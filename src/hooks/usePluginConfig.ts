import { useQuery } from "@tanstack/react-query";

import { usePluginContextProvider } from "../components/PluginContextProvider";

export interface UsePluginConfigReturn {
  pluginEntity: any;
  bambooOrigin: string;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}

export const usePluginConfig = () => {
  const { apiBaseUrl, tag } = usePluginContextProvider();
  const apiOrigin = apiBaseUrl ? new URL(apiBaseUrl).origin : "";
  const internalBaseUrl = apiOrigin ? `${apiOrigin}/api/internal/v1` : "";

  const query = useQuery({
    queryKey: ["pluginConfig"],
    queryFn: async () => {
      const pluginResponse = await fetch(`${apiBaseUrl}/plugins/${tag}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      const pluginEntity = await pluginResponse.json();

      let bambooOrigin = "";
      try {
        const pluginProxyTag = pluginEntity?.proxyTag;
        const pluginProxiesResponse = await fetch(
          `${internalBaseUrl}/proxies`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const pluginProxies = await pluginProxiesResponse.json();
        const pluginProxy = pluginProxies.proxies?.find(
          (proxy: any) => proxy.tag === pluginProxyTag
        );
        const pluginProxyUrl = Object.keys(pluginProxy.urlConfigurations)[0];
        bambooOrigin = new URL(pluginProxyUrl).origin;
      } catch (e) {
        console.error("Error fetching plugin proxies:", e);
      }
      return {
        bambooOrigin,
        pluginEntity,
      }
    },
    enabled: !!apiBaseUrl,
    retry: false,
  });

  return {
    pluginEntity: query.data?.pluginEntity,
    bambooOrigin: query.data?.bambooOrigin,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}

export default usePluginConfig;
