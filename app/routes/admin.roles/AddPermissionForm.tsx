import {
  Button,
  Center,
  Input,
  Loader,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { useDataAction } from "~/utils/hooks/useDataAction";
import { SelectPermission as Permission } from "~/utils/types/db/users";
import { RoleActions } from "./Actions";
import { ExtendedRole } from "./route";

export function AddPermissionForm({
  row,
  filteredPermissions,
}: {
  row: ExtendedRole | null;
  filteredPermissions: Permission[];
}) {
  const [selectedPermission, setSelectedPermission] = useState<string | null>(
    null
  );
  const adder = useDataAction({
    dataAction: RoleActions.AddRolePermission,
    notificationMessages: {
      successMessage: "Role permission added successfully",
    },
  });
  return (
    <adder.Form
      method="POST"
      onSubmit={() => {
        setSelectedPermission(null);
      }}
    >
      <Input
        type="hidden"
        name="action"
        value={RoleActions.AddRolePermission}
        required
      />
      <Input type="hidden" name="roleId" value={row?.id} required />
      {adder.data?.error && (
        <Center>
          <Stack gap="xs">
            <Text variant="error">{adder.data.error}</Text>
          </Stack>
        </Center>
      )}
      <Select
        allowDeselect={false}
        name="permissionId"
        data={filteredPermissions.map((permission) => ({
          value: permission.id.toString(),
          label: permission.name.toString().toUpperCase(),
        }))}
        value={selectedPermission}
        placeholder="Select permission"
        searchable
        required
        onChange={setSelectedPermission}
        nothingFoundMessage="No permissions found"
      />
      <Center>
        <Button mt="sm" type="submit" disabled={adder.submitting}>
          {adder.submitting ? <Loader /> : "Add permission"}
        </Button>
      </Center>
    </adder.Form>
  );
}
