import { useState, useEffect } from 'react';

import { CortexApi, CortexResource, CortexService, CortexUser, CortexDomain, PluginContextLocation } from '@cortexapps/plugin-core';

export interface IPluginContext {
  apiBaseUrl: string;
  entity: CortexDomain | CortexResource | CortexService | null;
  location: PluginContextLocation;
  tag: string | null;
  user: CortexUser;
  style: Record<string, string>;
  theme: string;
}

export const usePluginContext = (): IPluginContext => {
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'context') {
        setContext(event.data?.data);
      }
    };

    window.addEventListener('message', handleMessage);
    CortexApi.getContext().then((context) => {
      setContext(context);
    });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  return context;
};

export default usePluginContext;