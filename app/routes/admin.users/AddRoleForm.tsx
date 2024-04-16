import {
  Button,
  Center,
  ComboboxItem,
  Input,
  Loader,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { SelectRole as Role, SelectUser as User } from "~/utils/types/db/users";
import { ActionResponse } from "~/utils/types/actions";

interface Props {
  actionData?: ActionResponse;
  navState: string;
  row: User | null;
  filteredRoles: Role[];
}

export function AddRoleForm({
  actionData,
  navState,
  row,
  filteredRoles,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<ComboboxItem | null>(null);

  return (
    <Form action="/admin/users" method="POST">
      <Input type="hidden" name="intent" value="addUserRole" />
      <Input type="hidden" name="userId" value={row?.id} required />
      {actionData?.error && (
        <Center>
          <Stack gap="xs">
            <Text variant="error">{actionData.error}</Text>
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
        value={selectedRole ? selectedRole.value : ""}
        placeholder="Select role"
        searchable
        required
        onChange={(_value, option) => setSelectedRole(option)}
        nothingFoundMessage="No roles found"
      />
      <Center>
        <Button mt="sm" type="submit" disabled={navState === "submitting"}>
          {navState === "submitting" ? <Loader /> : "Add role"}
        </Button>
      </Center>
    </Form>
  );
}
