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
import { SelectRole as Role, SelectUser as User } from "~/utils/types/db/users";
import { UserActions } from "./Actions";

interface Props {
  navState: string;
  row: User | null;
  filteredRoles: Role[];
}

export function AddRoleForm({ row, filteredRoles }: Props) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const adder = useDataAction({
    dataAction: UserActions.AddUserRole,
    notificationMessages: {
      successMessage: "User role added successfully",
    },
  });

  return (
    <adder.Form
      method="POST"
      onSubmit={() => {
        setSelectedRole(null);
      }}
    >
      <Input type="hidden" name="action" value={UserActions.AddUserRole} required />
      <Input type="hidden" name="userId" value={row?.id} required />
      {adder.data?.error && (
        <Center>
          <Stack gap="xs">
            <Text variant="error">{adder.data.error}</Text>
          </Stack>
        </Center>
      )}
      <Select
        allowDeselect={false}
        name="roleId"
        data={filteredRoles.map((role) => ({
          value: role.id.toString(),
          label: role.name,
        }))}
        value={selectedRole}
        placeholder="Select role"
        searchable
        required
        onChange={setSelectedRole}
        nothingFoundMessage="No roles found"
      />
      <Center>
        <Button mt="sm" type="submit" disabled={adder.submitting}>
          {adder.submitting ? <Loader /> : "Add role"}
        </Button>
      </Center>
    </adder.Form>
  );
}
