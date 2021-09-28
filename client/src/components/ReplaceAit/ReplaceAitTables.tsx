import { message } from 'antd';
import React from 'react';
import { TsAitTable, TsAit } from '../../models/models';
import { ChooseAit } from './ChooseAit';
import { ChooseAitTable } from './ChooseAitTable';
import { EditAitTable } from './EditAitTable';

type ReplaceAitTablesProps = {
  aits: TsAit[];
  setAitToReplace: (aitTable: TsAit) => void;
};

export const ReplaceAitTables = (props: ReplaceAitTablesProps) => {
  const [ait, setAit]: [TsAit | undefined, any] = React.useState(undefined);
  const [table, setTable]: [TsAitTable | undefined, any] =
    React.useState(undefined);

  const onEditTableSubmit = (newTable: TsAitTable) => {
    const indexOfAit = ait!.tables.indexOf(table!);
    const updatedAitTables = ait!.tables;
    updatedAitTables[indexOfAit] = newTable;
    const updatedAit: TsAit = {
      ...ait!,
      tables: updatedAitTables,
    };
    setAit(updatedAit);
    props.setAitToReplace(updatedAit);
    setTable(undefined);
    message.success(`Table in AIT #${ait!.pid} updated!`);
  };

  return !ait ? (
    <ChooseAit aits={props.aits} onSelect={(ait: TsAit) => setAit(ait)} />
  ) : !table ? (
    <ChooseAitTable
      ait={ait}
      tables={(ait as TsAit).tables}
      onSelect={(table: TsAitTable) => setTable(table)}
      onCancel={() => setAit(undefined)}
    />
  ) : (
    <EditAitTable
      ait={ait}
      table={table}
      onSubmit={onEditTableSubmit}
      onCancel={() => setTable(undefined)}
    />
  );
};
