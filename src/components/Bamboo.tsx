import type React from "react";
import {
  useMemo,
} from "react";

import {
  Loader,
  CardTitle,
} from "@cortexapps/react-plugin-ui";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  usePluginContextProvider,
} from "./PluginContextProvider";

import usePluginConfig from "../hooks/usePluginConfig";
import useBambooPlans from "../hooks/useBambooPlans";

import JsonView from "./JsonView";

import "../tableStyles.css";

export const Bamboo: React.FC = () => {
  const {
    bambooOrigin,
    isLoading: isLoadingConfig,
    isFetching: isFetchingConfig,
    // error: errorConfig,
  } = usePluginConfig();

  const bambooApiBaseUrl = bambooOrigin ? `${bambooOrigin}/rest/api/latest` : "";

  const {
    theme,
  } = usePluginContextProvider();

  const {
    plans,
    isLoading,
    isFetching,
    error,
  } = useBambooPlans({
    bambooApiBaseUrl,
    expand: "plans.plan",
  });

  const isAnythingLoading = isLoading || isFetching || isLoadingConfig || isFetchingConfig;

  const columnHelper = createColumnHelper<any>();
  const columns: any[]= [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("key", {
      header: "Key",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("projectName", {
      header: "Project Name",
      cell: (info) => info.getValue(),
    }),
  ];
  const data: any[] = useMemo(() => {
    return plans?.plan?.filter((plan: any) => plan.enabled)
      .map((plan: any) => {
        return {
          id: plan.id,
          key: plan.key,
          projectName: plan.projectName,
          link: plan.project?.link?.href,
        };
      });
  }, [plans]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isAnythingLoading) {
    return <Loader />;
  }
  if (error) {
    return <div>Error: {JSON.stringify(error)}</div>;
  }

  if (!bambooOrigin) {
    return (<div>
      <p>
        Bamboo host was not found. Please check the plugin configuration and make sure the plugin proxy is set up correctly.
      </p>
    </div>);
  }

  if (!data) {
    return <div>No plans found</div>;
  }
  return (
    <div>
      <CardTitle style={{ marginBottom: "2rem" }}>Bamboo Plans</CardTitle>
      <div style={{marginBottom: "2rem"}}>
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
            )})}
          </tbody>
        </table>
      </div>
      <CardTitle style={{ marginBottom: "2rem" }}>Bamboo Plans JSON</CardTitle>
      <JsonView
        data={plans}
        theme={theme}
      />
    </div>
  );
};

export default Bamboo;