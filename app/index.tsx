import { BottleSectionTitles, BottleStatus, DashboardData, GetBottleResponseDto, GetDashboardResponseDto } from "@/globals";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { SectionList, Text, View } from "react-native";

export default function Index() {

  const [data, setData] = useState<DashboardData>();
  const [sectionData, setSectionData] = useState<{ title: string, data: GetBottleResponseDto[] }[]>([]);

  useEffect(() => {
    fetch(
      `http://${process.env.EXPO_PUBLIC_BOTTLES_HOST}/bottle-service/dashboard?bottleId=6688496f4d481a21884bc8c2`,
      {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    ).then((response: Response) => response.json() as unknown as GetDashboardResponseDto)
      .then((json: GetDashboardResponseDto) => {
        const dashboardData = getDashboardData(json);
        setData(dashboardData);
        const sectionData = createSectionData(dashboardData);
        setSectionData(sectionData);
      })
      .catch((e) => console.log('Error fetching response. ' + e));
  }, [setData, setSectionData]);

  return (
    // <View className="flex-1 justify-center items-center">
    <View className="bg-black h-full">
      <SectionList
        sections={sectionData}
        keyExtractor={(item, index) => item.id + index}
        extraData={data}
        renderItem={({ item }) => (<BottleSectionItem
          bottle={item}
        ></BottleSectionItem>)}
        renderSectionHeader={({section: {title, data}}) =>(
          <BottleSectionHeader
            text={title}
            render={data.length >= 1}
          >
          </BottleSectionHeader>
        )}
      >
      </SectionList>
      {/* <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href={`/scan?id=6688496f4d481a21884bc8c2`}>Scan</Link> */}
    </View>
  );
}

function BottleSectionItem(props: { bottle: GetBottleResponseDto }) {
  return <Text className="text-xl text-white">{props.bottle.nickname}</Text>;
}

function BottleSectionHeader(props: {text: string, render: boolean}) {
  return (
    <View className={`w-full ${props.render ? '' : 'hidden'}`}>
      <Text className="text-4xl text-white">{props.text}</Text>
    </View>
  );
}

function getDashboardData(dto: GetDashboardResponseDto) {
  const bottles = dto.bottles;
  bottles.sort((a, b) => new Date(b.statusTimestamp).getTime() - new Date(a.statusTimestamp).getTime());
  const ozInFridge = bottles.map(bottle => bottle.volInOunces).reduce((a, b) => a + b);
  const bottlesInUse = bottles.filter(bottle => bottle.status === BottleStatus.IN_USE);
  const bottlesOut = bottles.filter(bottle => bottle.status === BottleStatus.FRESH);
  const bottlesInFridge = bottles.filter(bottle => bottle.status === BottleStatus.REFRIGERATOR);
  const bottlesAvailable = bottles.filter(bottle => bottle.status === BottleStatus.AVAILABLE);

  return {
    lastFeed: dto.lastFeed,
    lastBottleFilled: dto.lastBottleFilled,
    ozInFridge,
    bottlesInUse,
    bottlesOut,
    bottlesInFridge,
    bottlesAvailable,
  } as DashboardData;
}

function createSectionData(dashboardData: DashboardData) {
  const bottlesInUseSectionData = {
    title: BottleSectionTitles.IN_USE,
    data: dashboardData.bottlesInUse,
  }
  const bottlesOutSectionData = {
    title: BottleSectionTitles.FRESH,
    data: dashboardData.bottlesOut,
  }
  const bottlesInFridgeSectionData = {
    title: BottleSectionTitles.REFRIGERATOR,
    data: dashboardData.bottlesInFridge,
  }
  const bottlesAvailableSectionData = {
    title: BottleSectionTitles.AVAILABLE,
    data: dashboardData.bottlesAvailable,
  }

  return [
    bottlesInUseSectionData,
    bottlesOutSectionData,
    bottlesInFridgeSectionData,
    bottlesAvailableSectionData,
  ]
}