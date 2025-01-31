import { BottleStatus, GetBottleResponseDto, UpdateBottleRequestDto } from "@/globals";
import { useRoute } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native"

export default function Scan() {

    const [bottle, setBottle] = useState<GetBottleResponseDto>();
    const [oz, setOz] = useState<number>(0);
    const [isEditMode, setIsEditMode] = useState(false);

    const route = useRoute();
    const navigation = useNavigation();

    const { id } = route.params as { id: string } || {};

    const updateBottle = useCallback(async (requestDto: UpdateBottleRequestDto) => {
        if (!bottle) {
            return;
        }
        // TODO Handle failure gracefully
        const result = await fetch(
            `${process.env.EXPO_PUBLIC_BOTTLES_PROTOCOL}://${process.env.EXPO_PUBLIC_BOTTLES_HOST}/bottle-service/bottle/${bottle.id}`,
            {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(requestDto),
            }
        );
    }, [bottle]);

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
            if (bottle?.volInOunces !== undefined &&  bottle?.volInOunces > 0) {
                navigation?.setOptions({
                    headerRight: () => (
                        <Pressable 
                            onPress={() => {
                                if (isEditMode) {
                                    // Call the updateBottle endpoint with oz and current status
                                    updateBottle({
                                        volInOunces: oz,
                                        status: bottle.status,
                                    });
                                }
                                setIsEditMode(!isEditMode);
                            }}
                            className="mr-4"
                        >
                            <Text className="text-blue-500 text-lg">
                                {isEditMode ? 'Done' : 'Edit'}
                            </Text>
                        </Pressable>
                    ),
                });
            }
    }, [id, bottle, setBottle, navigation, isEditMode, updateBottle]);

    let options = <Text className="text-white">Loading...</Text>;

    if (bottle !== undefined) {
        options = (
            <BottleInfo
                bottle={bottle}
                isEditMode={isEditMode}
                oz={oz}
                setOz={setOz}
                updateBottle={updateBottle}
            ></BottleInfo>
        );
    }

    return (
        <View className="h-screen w-screen flex flex-col justify-center">
            <View className="flex w-full justify-center bg-black">
                {options}
            </View>
        </View>
    )
}

interface BottleInfoParams {
    bottle: GetBottleResponseDto;
    isEditMode: boolean;
    oz: number;
    setOz: (oz: number) => void;
    updateBottle: (requestDto: UpdateBottleRequestDto) => Promise<void>;
}

function BottleInfo(params: BottleInfoParams) {
    const {
        bottle,
        isEditMode,
        oz,
        setOz,
        updateBottle,
    } = params;

    const router = useRouter();

    useEffect(() => {
        isEditMode ? setOz(bottle.volInOunces) : setOz(bottle.capacityInOunces - bottle.volInOunces);
    }, [bottle.capacityInOunces, bottle.volInOunces, setOz, isEditMode]);

    const handleOzChange = useCallback((numberAsText: string) => {
        setOz(parseFloat(numberAsText));
    }, [setOz]);

    const clearBottle = useCallback(async () => {
        const requestDto = {
            volInOunces: 0,
            status: BottleStatus.AVAILABLE,
        } as UpdateBottleRequestDto;
        Alert.alert(
            "Clear Bottle",
            `Are you sure you want to clear ${bottle.nickname}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Clear",
                    onPress: async () => {
                        await updateBottle(requestDto);
                        router.back();
                    },
                    style: "destructive"
                }
            ]
        );
    }, [updateBottle, router]);

    const addOzToBottle = useCallback(async (status: BottleStatus, ozToAdd = 0, resetExpirationTimestamp = true) => {
        const requestDto = {
            volInOunces: bottle.volInOunces + oz + ozToAdd,
            status: status,
            expirationTimestamp: resetExpirationTimestamp ? getExpirationTimestampFromStatus(status) : undefined,
        } as UpdateBottleRequestDto;
        
        await updateBottle(requestDto);
        router.back();
    }, [oz, bottle, updateBottle, router]);

    return (
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
                {!isEditMode && bottle.capacityInOunces - bottle.volInOunces > 0 &&
                    (<View className="flex flex-row justify-between w-full">
                        <View className="flex flex-col justify-center w-1/2">
                            <Text className="w-full text-center text-white">Add (oz)?</Text>
                        </View>
                        <TextInput keyboardType="numeric" onChangeText={handleOzChange} id="fill" defaultValue={`${bottle.capacityInOunces - bottle.volInOunces}`} className="bg-slate-800 w-1/2 rounded-lg text-white text-center h-[50px] text-xl"></TextInput>
                    </View>)}
                {isEditMode &&
                    (<View className="flex flex-row justify-between w-full">
                        <View className="flex flex-col justify-center w-1/2">
                            <Text className="w-full text-center text-white">Oz</Text>
                        </View>
                        <TextInput keyboardType="numeric" onChangeText={handleOzChange} id="fill" defaultValue={`${bottle.volInOunces}`} className="bg-slate-800 w-1/2 rounded-lg text-white text-center h-[50px] text-xl"></TextInput>
                    </View>)}
                <View className="h-[40px]"></View>
                <View className="w-full">
                    <BottleInfoButtons
                        bottle={bottle}
                        isEditMode={isEditMode}
                        addOzToBottle={addOzToBottle}
                        clearBottle={clearBottle}
                    ></BottleInfoButtons>
                </View>
            </View>
        </ScrollView>
    );
}


interface BottleInfoButtonParams {
    bottle: GetBottleResponseDto;
    isEditMode: boolean;
    addOzToBottle: (status: BottleStatus, ozToAdd?: number, resetExpirationTimestamp?: boolean) => Promise<void>;
    clearBottle: () => Promise<void>;
}

function BottleInfoButtons(params: BottleInfoButtonParams) {
    const { addOzToBottle, bottle, isEditMode, clearBottle } = params;


    if (isEditMode) {
        return (
            <View className="w-full flex flex-row justify-between">
                <UpdateBottleButton
                    onPress={clearBottle}
                    buttonText="Clear Bottle"
                    color="bg-red-600"
                ></UpdateBottleButton>
            </View>
        );
    }

    switch (bottle.status) {
        case BottleStatus.AVAILABLE:
            return (
                <View className="w-full flex flex-row justify-between">
                    <UpdateBottleButton
                        onPress={() => addOzToBottle(BottleStatus.REFRIGERATOR)}
                        buttonText="Refrigerate"
                    ></UpdateBottleButton>
                    <View className="w-[30px]"></View>
                    <UpdateBottleButton
                        onPress={() => addOzToBottle(BottleStatus.FRESH)}
                        buttonText="Leave Out"
                    ></UpdateBottleButton>
                </View>
            );
        case BottleStatus.REFRIGERATOR:
            return (
                <View className="w-full flex flex-row justify-between">
                    <UpdateBottleButton
                        onPress={() => addOzToBottle(BottleStatus.IN_USE)}
                        buttonText="Feed"
                    ></UpdateBottleButton>
                    {bottle.capacityInOunces > bottle.volInOunces &&
                        <>
                            <View className="w-[30px]"></View>
                            <UpdateBottleButton
                                onPress={() => addOzToBottle(bottle.status, 0, false)}
                                buttonText="Add"
                            ></UpdateBottleButton>
                        </>}
                </View>
            );
        case BottleStatus.FRESH:
            return (
                <View className="w-full flex flex-row justify-between">
                    <UpdateBottleButton
                        onPress={() => addOzToBottle(BottleStatus.REFRIGERATOR)}
                        buttonText="Refrigerate"
                    ></UpdateBottleButton>
                    <View className="w-[30px]"></View>
                    <UpdateBottleButton
                        onPress={() => addOzToBottle(BottleStatus.IN_USE)}
                        buttonText="Feed"
                    ></UpdateBottleButton>
                </View>
            );
        case BottleStatus.IN_USE:
            return (
                <View className="w-full flex flex-row justify-between">
                    <UpdateBottleButton
                        onPress={() => addOzToBottle(BottleStatus.IN_USE, 1, false)}
                        buttonText="Add an Ounce"
                    ></UpdateBottleButton>
                    <View className="w-[30px]"></View>
                    <UpdateBottleButton
                        onPress={() => addOzToBottle(BottleStatus.AVAILABLE, -1 * bottle.volInOunces)}
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
    color?: string;
}

function UpdateBottleButton(params: UpdateBottleButtonParams) {
    const { onPress, buttonText, color = 'bg-lime-600' } = params;

    return <Pressable onPress={onPress} className={`${color} h-[80px] grow rounded-lg flex justify-center items-center`}>
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