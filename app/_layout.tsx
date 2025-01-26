import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
import Index from "./index";
import Scan from "./scan";

export default function RootLayout() {

  const Stack = createStackNavigator();

  return (

      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "black" },
          headerTitleStyle: { color: "white" },
        }}
      >
        <Stack.Screen name="football" component={Index}/>
        <Stack.Screen name="scan"  component={Scan}/>
      </Stack.Navigator>
  );
}
