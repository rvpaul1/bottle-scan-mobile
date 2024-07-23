import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href={`/scan?id=6688496f4d481a21884bc8c2`}>Scan</Link>
    </View>
  );
}
