import { nprogress } from "@mantine/nprogress";
import { useNavigation } from "@remix-run/react";
import { useEffect } from "react";

type NavigationState = "idle" | "loading" | "submitting";

export default function useNavigationProgress() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleStateChange = (state: NavigationState) => {
      if (state === "loading") {
        nprogress.start();
      } else {
        nprogress.complete();
      }
    };

    handleStateChange(navigation.state);
    return () => nprogress.complete();
  }, [navigation.state]);
}
