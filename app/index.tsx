import { BottleSectionTitles, BottleStatus, DashboardData, GetBottleResponseDto, GetDashboardResponseDto } from "@/globals";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, SectionList, Text, View } from "react-native";
import React from "react";

export default function Index() {

  const [dashboardData, setData] = useState<DashboardData>();
  const [sectionData, setSectionData] = useState<{ title: string, data: GetBottleResponseDto[] }[]>([]);

  useFocusEffect(
    useCallback(() => {
      console.log(`${process.env.EXPO_PUBLIC_BOTTLES_PROTOCOL}://${process.env.EXPO_PUBLIC_BOTTLES_HOST}/bottle-service/dashboard?bottleId=${process.env.EXPO_PUBLIC_BOTTLES_ACCT_ID}`);
      fetch(
        `${process.env.EXPO_PUBLIC_BOTTLES_PROTOCOL}://${process.env.EXPO_PUBLIC_BOTTLES_HOST}/bottle-service/dashboard?bottleId=${process.env.EXPO_PUBLIC_BOTTLES_ACCT_ID}`,
        // `https://api.downscribble.com/bottle-service/dashboard?bottleId=66a41bf695a1ac5f071f3956`,
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
    }, [setData, setSectionData])
  );

  return (
    <View className="bg-black h-full">
      <AggregateDataView
        data={dashboardData}
      ></AggregateDataView>
      <SectionList
        sections={sectionData}
        keyExtractor={(item, index) => item.id + index}
        extraData={dashboardData}
        renderItem={({ item }) => (<BottleSectionItem
          bottle={item}
        ></BottleSectionItem>)}
        renderSectionHeader={({ section: { title, data } }) => (
          <BottleSectionHeader
            text={title}
            render={data.length >= 1}
          >
          </BottleSectionHeader>
        )}
      >
      </SectionList>
    </View>
  );
}

function AggregateDataView(props: { data?: DashboardData }) {
  const { data } = props;
  if (data === undefined) {
    return <></>;
  } else {
    return (
      <View className="flex flex-col justify-around h-[200px]">
        <Text className="text-white text-4xl text-center">Bottle Scan</Text>
        <Text className="text-white text-xl">Oz in the Fridge: {data.ozInFridge}</Text>
        <Text className="text-white text-xl">Last Feed: {new Date(data.lastFeed).toLocaleTimeString()}</Text>
        <Text className="text-white text-xl">Last Bottle Filled: {new Date(data.lastBottleFilled).toLocaleTimeString()}</Text>
        <View></View>
      </View>
    )
  };
}

function BottleSectionItem(props: { bottle: GetBottleResponseDto }) {
  const router = useRouter();
  return (
    <View className="h-[80px] bg-slate-900 px-[15px] flex-row justify-between items-center border-slate-300 border-solid border-b-[1px]">
      <Text className="text-xl text-white">{props.bottle.nickname}</Text>
      <Pressable className="w-[100px] h-3/5 bg-lime-600 rounded-lg flex-row justify-center items-center"
        onPress={() => router.push(`/scan?id=${props.bottle.id}`)}
      >
        <Text className="text-xl text-white">Info</Text>
      </Pressable>
    </View>
  );
}

function BottleSectionHeader(props: { text: string, render: boolean }) {
  return (
    <View className={`w-full pl-[15px] bg-slate-800 ${props.render ? '' : 'hidden'} border-solid border-[1px] border-slate-500`}>
      <Text className="text-2xl text-white">{props.text}</Text>
    </View>
  );
}

function getDashboardData(dto: GetDashboardResponseDto) {
  const bottles = dto.bottles;
  bottles.sort((a, b) => new Date(a.statusTimestamp).getTime() - new Date(b.statusTimestamp).getTime());
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