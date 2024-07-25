import { Stack } from "expo-router";

export default function RootLayout() {



  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "black" },
        headerStyle: { backgroundColor: "black" },
        headerTitleStyle: { color: "white" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="scan" />
    </Stack>
  );
}
