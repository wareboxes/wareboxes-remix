import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { withAuth } from "~/utils/permissions";
import { actionHandler, actionResponse } from "~/utils/types/actions";
import { AccountActions } from "./Actions";
import { AccountDeleteRestoreSchema, AccountUpdateSchema, deleteAccount, getAccounts, restoreAccount, updateAccount } from "~/utils/accounts";
import { getWarehouses } from "~/utils/locations";

const accountActionsHandlers = {
  [AccountActions.UpdateAccount]: handleUpdateAccount,
  [AccountActions.DeleteAccount]: handleDeleteAccount,
  [AccountActions.RestoreAccount]: handleRestoreAccount,
};


export async function loader({ request }: LoaderFunctionArgs) {
  await withAuth("admin", request);
  return {
    accounts: await getAccounts(true),
    warehouses: await getWarehouses(),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  await withAuth("admin", request);
  return actionHandler(
    request,
    accountActionsHandlers,
    actionResponse(false, "Invalid action")
  );
}

async function handleUpdateAccount(formData: FormData) {
  const result = AccountUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid account data", result.error.flatten())
    );
  }

  const { accountId, ...accountData } = result.data;
  const res = await updateAccount(accountId, accountData);
  return json(actionResponse(res));
}

async function handleDeleteAccount(formData: FormData) {
 const result = AccountDeleteRestoreSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid account data", result.error.flatten())
    );
  }

  const { accountId } = result.data;
  const res = await deleteAccount(accountId);
  return json(actionResponse(res));
}

async function handleRestoreAccount(formData: FormData) {
  const result = AccountDeleteRestoreSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid account data", result.error.flatten())
    );
  }

  const { accountId } = result.data;
  const res = await restoreAccount(accountId);
  return json(actionResponse(res));
}