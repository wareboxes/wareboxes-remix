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
import { ActionResponse } from "./route.server";

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
      <input type="hidden" name="intent" value="addUserRole" />
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
        required
        onChange={(_value, option) => setSelectedRole(option)}
      />
      <Center>
        <Button mt="sm" type="submit" disabled={navState === "submitting"}>
          {navState === "submitting" ? <Loader /> : "Add role"}
        </Button>
      </Center>
    </Form>
  );
}
