import { BottleStatus, GetBottleResponseDto, UpdateBottleRequestDto } from "@/globals";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from "react-native"

export default function Scan() {

    const [bottle, setBottle] = useState<GetBottleResponseDto>();

    const route = useRoute();

    const { id } = route.params as { id: string } || {};

    useEffect(() => {
        fetch(
            `${process.env.EXPO_PUBLIC_BOTTLES_PROTOCOL}://${process.env.EXPO_PUBLIC_BOTTLES_HOST}/bottle-service/bottle/${id}`,
            // `https://api.downscribble.com/bottle-service/bottle/${id}`,
            {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        ).then((response: Response) => response.json())
            .then(json => setBottle(json as GetBottleResponseDto));
    }, [id, setBottle]);

    let options = <Text>Loading...</Text>;

    if (bottle !== undefined) {
        options = (
            <BottleInfo
                bottle={bottle}
            ></BottleInfo>
        );
    }

    return (
        <View className="h-screen w-screen flex flex-col justify-center">
            <View className="flex w-full justify-center">
                {options}
            </View>
        </View>
    )
}

interface BottleInfoParams {
    bottle: GetBottleResponseDto;
}

function BottleInfo(params: BottleInfoParams) {
    const {
        bottle,
    } = params;

    const router = useRouter();

    const [oz, setOz] = useState<number>(bottle.capacityInOunces - bottle.volInOunces);

    const handleOzChange = useCallback((numberAsText: string) => {
        setOz(parseFloat(numberAsText));
    }, [setOz]);

    const updateBottle = useCallback(async (status: BottleStatus, ozToAdd = 0, resetExpirationTimestamp = true) => {

        const requestDto = {
            volInOunces: bottle.volInOunces + oz + ozToAdd,
            status: status,
            expirationTimestamp: resetExpirationTimestamp ? getExpirationTimestampFromStatus(status) : undefined,
        } as UpdateBottleRequestDto;


        // TODO Handle failure gracefully
        const result = await fetch(
            `${process.env.EXPO_PUBLIC_BOTTLES_PROTOCOL}://${process.env.EXPO_PUBLIC_BOTTLES_HOST}/bottle-service/bottle/${bottle.id}`,
            // `https://api.downscribble.com/bottle-service/bottle/${bottle.id}`,
            {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestDto),
            }
        );
        router.back();
    }, [oz, bottle]);

    return (
        // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView className="bg-black flex flex-col h-full" keyboardShouldPersistTaps="handled">
                <View className="bg-black justify-center flex flex-col h-full items-center w-full px-[15px]">
                    <Text className="text-xl text-white">Bottle Info:</Text>
                    <View className="h-[40px]"></View>
                    <Text className="text-xs text-white">Name</Text>
                    <Text className="text-3xl text-white">{bottle.nickname}</Text>
                    <View className="h-[40px]"></View>
                    <Text className="text-xs text-white">Status</Text>
                    {bottle.status === BottleStatus.AVAILABLE &&
                        <Text className="text-xl text-white">empty (capacity {bottle.capacityInOunces} oz)</Text>}
                    {bottle.status === BottleStatus.REFRIGERATOR &&
                        <Text className="text-xl text-white">{bottle.volInOunces} oz in refrigerator (capacity {bottle.capacityInOunces} oz)</Text>}
                    {bottle.status === BottleStatus.IN_USE &&
                        <Text className="text-xl text-white">{bottle.volInOunces} oz currently feeding</Text>}
                    <View className="h-[40px]"></View>
                    {bottle.volInOunces > 0 && <>
                        <Text className="text-xl text-white">
                            Expires in <Timer countdownDate={new Date(bottle.expirationTimestamp)}></Timer>
                        </Text>
                        <View className="h-[40px]"></View></>}
                    {bottle.capacityInOunces - bottle.volInOunces > 0 &&
                        (<View className="flex flex-row justify-between w-full">
                            <View className="flex flex-col justify-center w-1/2">
                                <Text className="w-full text-center text-white">Fill (oz)?</Text>
                            </View>
                            <TextInput keyboardType="numeric" onChangeText={handleOzChange} id="fill" defaultValue={`${bottle.capacityInOunces - bottle.volInOunces}`} className="bg-slate-800 w-1/2 rounded-lg text-white text-center h-[50px] text-xl"></TextInput>
                        </View>)}
                    <View className="h-[40px]"></View>
                    <View className="w-full">
                        <BottleInfoButtons
                            bottle={bottle}
                            updateBottle={updateBottle}
                        ></BottleInfoButtons>
                    </View>
                </View>
            </ScrollView>
        // </TouchableWithoutFeedback>
    );
}


interface BottleInfoButtonParams {
    bottle: GetBottleResponseDto;
    updateBottle: (status: BottleStatus, ozToAdd?: number, resetExpirationTimestamp?: boolean) => Promise<void>;
}

function BottleInfoButtons(params: BottleInfoButtonParams) {
    const { updateBottle, bottle } = params;

    switch (bottle.status) {
        case BottleStatus.AVAILABLE:
            return (
                <View className="w-full flex flex-row justify-between">
                    <UpdateBottleButton
                        onPress={() => updateBottle(BottleStatus.REFRIGERATOR)}
                        buttonText="Refrigerate"
                    ></UpdateBottleButton>
                    <View className="w-[30px]"></View>
                    <UpdateBottleButton
                        onPress={() => updateBottle(BottleStatus.FRESH)}
                        buttonText="Leave Out"
                    ></UpdateBottleButton>
                </View>
            );
        case BottleStatus.REFRIGERATOR:
            return (
                <View className="w-full flex flex-row justify-between">
                    <UpdateBottleButton
                        onPress={() => updateBottle(BottleStatus.IN_USE)}
                        buttonText="Feed"
                    ></UpdateBottleButton>
                    {bottle.capacityInOunces > bottle.volInOunces &&
                        <>
                            <View className="w-[30px]"></View>
                            <UpdateBottleButton
                                onPress={() => updateBottle(bottle.status, 0, false)}
                                buttonText="Fill"
                            ></UpdateBottleButton>
                        </>}
                </View>
            )
        case BottleStatus.FRESH:
            return (
                <View className="w-full flex flex-row justify-between">
                    <UpdateBottleButton
                        onPress={() => updateBottle(BottleStatus.REFRIGERATOR)}
                        buttonText="Refrigerate"
                    ></UpdateBottleButton>
                    <View className="w-[30px]"></View>
                    <UpdateBottleButton
                        onPress={() => updateBottle(BottleStatus.IN_USE)}
                        buttonText="Feed"
                    ></UpdateBottleButton>
                </View>
            );
        case BottleStatus.IN_USE:
            return (
                <View className="w-full flex flex-row justify-between">
                    <UpdateBottleButton
                        onPress={() => updateBottle(BottleStatus.IN_USE, 1, false)}
                        buttonText="Add an Ounce"
                    ></UpdateBottleButton>
                    <View className="w-[30px]"></View>
                    <UpdateBottleButton
                        onPress={() => updateBottle(BottleStatus.AVAILABLE, -1 * bottle.volInOunces)}
                        buttonText="Finished"
                    ></UpdateBottleButton>
                </View>
            );
        default: throw new Error("Wrong");
    }
}

interface UpdateBottleButtonParams {
    onPress: () => Promise<void>;
    buttonText: string;
}

function UpdateBottleButton(params: UpdateBottleButtonParams) {
    const { onPress, buttonText } = params;

    return <Pressable onPress={onPress} className="bg-lime-600 h-[80px] grow rounded-lg flex justify-center items-center">
        <Text className="text-2xl text-white">{buttonText}</Text>
    </Pressable>;
}

function Timer(props: { countdownDate: Date; }) {
    const { countdownDate } = props;

    const [time, setTime] = useState<{ days: number, hours: number, minutes: number, seconds: number, }>();
    const [expired, setExpired] = useState<boolean>(false);

    useEffect(() => {
        setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate.getTime() - now;
            if (distance <= 0) {
                setExpired(true);
            } else {
                const days = Math.floor((distance) / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTime({ days, hours, minutes, seconds });
            }
        }, 1000)
    }, [countdownDate, setTime]);

    // TODO Add expired, format
    return time ? <Text>{time.days}d {time.hours}h {time.minutes}m {time.seconds}s</Text> : <></>;
}

function getExpirationTimestampFromStatus(status: BottleStatus): Date | null {
    switch (status) {
        case BottleStatus.FRESH: return fourHours(); break;
        case BottleStatus.IN_USE: return twoHours(); break;
        case BottleStatus.REFRIGERATOR: return fourDays(); break;
        default: return null;
    }
}

function twoHours(): Date {
    const twoHoursInMillis = 2 * 60 * 60 * 1000;
    return nowPlusTime(twoHoursInMillis);
}

function fourHours(): Date {
    const fourHoursInMillis = 4 * 60 * 60 * 1000;
    return nowPlusTime(fourHoursInMillis);
}

function fourDays(): Date {
    const fourDaysInMillis = 4 * 24 * 60 * 60 * 1000;
    return nowPlusTime(fourDaysInMillis);
}

function nowPlusTime(time: number): Date {
    const date = new Date(Date.now() + time);
    return date;
}