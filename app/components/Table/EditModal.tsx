import { Flex, Stack, Title } from "@mantine/core";
import { MRT_EditActionButtons, MRT_Row, MRT_TableInstance } from "mantine-react-table";

type EditModalProps<T extends Record<string, unknown>> = {
  table: MRT_TableInstance<T>;
  row: MRT_Row<T>;
  internalEditComponents: React.ReactNode;
  title?: string;
};

export function EditModal<T extends Record<string, unknown>>({
  table,
  row,
  internalEditComponents,
  title = "Edit",
}: EditModalProps<T>) {
  return (
    <Stack>
      <Title order={3}>{title}</Title>
      {internalEditComponents}
      <Flex justify="flex-end" mt="lg">
        <MRT_EditActionButtons variant="text" table={table} row={row} />
      </Flex>
    </Stack>
  );
}