import type React from "react";
import {
  useMemo,
} from "react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  CardTitle,
  Loader,
} from "@cortexapps/react-plugin-ui";

import {
  usePluginContextProvider,
} from "./PluginContextProvider";

import usePluginConfig from "../hooks/usePluginConfig";
// import useEntityDescriptor from "../hooks/useEntityDescriptor";
import useEntityCustomData from "../hooks/useEntityCustomData";
import useBambooBuildResults from "../hooks/useBambooBuildResults";

import JsonView from "./JsonView";

export const BambooEntityView: React.FC = () => {
  const context = usePluginContextProvider();
  const entityTag = context?.entity?.tag || "";
  const entityType = context?.entity?.type || "";
  const theme = context?.theme === "light" ? "light" : "dark";

  const {
    bambooOrigin,
    isLoading: isConfigLoading,
  } = usePluginConfig();

  const bambooApiBaseUrl = bambooOrigin ? `${bambooOrigin}/rest/api/latest` : "";

  const {
    customData,
    isLoading: isCustomDataLoading,
  } = useEntityCustomData({ entityTag });

  const {
    project,
    buildKey,
  } = useMemo(() => {
    const bambooConfig = customData.find(data => data.key === "bamboo");
    return {
      project: bambooConfig?.value?.config?.project || "",
      buildKey: bambooConfig?.value?.config?.buildKey || "",
    };
  }, [customData]);

  const {
    results,
    isLoading: isBuildResultsLoading,
  } = useBambooBuildResults({
    bambooApiBaseUrl,
    project,
    buildKey,
    expand: "results.result",
  });

  const columnHelper = createColumnHelper<any>();
  const columns: any[]= [
    columnHelper.accessor("buildResultKey", {
      header: "Key",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("buildStartedTime", {
      header: "Started At",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.accessor("buildDurationDescription", {
      header: "Duration",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("state", {
      header: "State",
      cell: (info) => info.getValue(),
    }),
  ];
  const data: any[] = useMemo(() => {
    if (!results) {
      return [];
    }
    return results.map((result: any) => {
        return {
          buildResultKey: result.buildResultKey,
          buildStartedTime: result.buildStartedTime,
          buildDurationDescription: result.buildDurationDescription,
          state: result.state,
        };
      });
  }, [results]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isLoading = isConfigLoading || isCustomDataLoading || isBuildResultsLoading;

  if (isLoading) {
    return (
      <Loader size="large" />
    );
  }

  if (!results) {
    return (
      <div>
        No build results found for the {entityType} {entityTag}.
      </div>
    );
  }

  return (
    <div>
      <CardTitle style={{ marginBottom: "2rem" }}>Bamboo Build Results</CardTitle>
      <div style={{ marginBottom: "2rem" }}>
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              const planLink = row.original?.link;
              return (<tr
                key={row.id}
                onClick={() => {
                  if (planLink) {
                    window.open(planLink, "_blank");
                  }
                }}
                style={{
                  cursor: planLink ? "pointer" : "default",
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <CardTitle style={{ marginBottom: "2rem" }}>Bamboo Build Results JSON</CardTitle>
      <JsonView
        data={results}
        theme={theme}
      />
    </div>
  );
};

export default BambooEntityView;