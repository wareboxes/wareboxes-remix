import {
  Button,
  Checkbox,
  Group,
  Input,
  Stack,
  TextInput,
} from "@mantine/core";
import { useEffect } from "react";
import { useDataAction } from "~/utils/hooks/useDataAction";

const generateOrderName = () => {
  return `${Math.floor(Math.random() * 10000000)}-${new Date().toISOString()}`;
};

export function OrderForm({
  action,
  onSubmit = () => {},
}: {
  action: string;
  onSubmit?: () => void;
}) {
  const adder = useDataAction({
    dataAction: action,
    notificationMessages: {
      successMessage: "Order created successfully",
    },
  });

  useEffect(() => {
    if (adder.data?.success) {
      onSubmit();
    }
  }, [adder.data?.success, onSubmit]);

  return (
    <adder.Form method="POST">
      <Stack>
        <Input type="hidden" name="action" value={action} required />
        {/* TODO: Base this on the user's current account */}
        <TextInput
          name="orderKey"
          label="Order Name"
          placeholder="Unique Order Name"
          defaultValue={generateOrderName()}
          withAsterisk
          maxLength={255}
        />
        <TextInput
          name="line1"
          label="Address Line 1"
          placeholder="Street Address"
          withAsterisk
          required
        />
        <TextInput
          name="line2"
          label="Address Line 2"
          placeholder="Apt #, Suite, etc."
        />
        {/* TODO: Add autocomplete here */}
        <Group grow>
          <TextInput
            name="city"
            label="City"
            placeholder="City"
            withAsterisk
            required
          />
          <TextInput
            name="state"
            label="State"
            placeholder="State"
            withAsterisk
            required
          />
          <TextInput
            name="postalCode"
            label="Postal Code"
            placeholder="Postal Code"
            withAsterisk
            required
          />
        </Group>
        <TextInput
          name="country"
          label="Country"
          placeholder="Country"
          withAsterisk
          defaultValue="United States"
          required
        />
        {/* <DateInput
          name="shipBy"
          label="Ship By Date"
          placeholder="Select date"
          minDate={new Date()}
        /> */}
        <Checkbox name="rush" label="Rush Order" defaultChecked={false} />
        <Button
          type="submit"
          color="green"
          fullWidth
          disabled={adder.submitting}
        >
          {adder.submitting ? "Creating Order..." : "Create Order"}
        </Button>
      </Stack>
    </adder.Form>
  );
}
