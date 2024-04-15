import { Container, Stack } from "@mantine/core";
import { json } from "@remix-run/node";

export async function loader(): Promise<Response> {
  return json({ message: "Hello, World!" });
}

export default function NotFound() {
  return (
    <Container className="flex justify-center items-center">
      <Stack align="center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-bold">Page not found</h2>
      </Stack>
    </Container>
  );
}
