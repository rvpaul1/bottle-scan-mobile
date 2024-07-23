export const enum BottleStatus {
    AVAILABLE = "AVAILABLE",
    REFRIGERATOR = "REFRIGERATOR",
    IN_USE = "IN_USE",
    EMPTY = "EMPTY",
    FRESH = "FRESH",
}

export interface GetBottleResponseDto {
    id: string;
    nickname: string;
    status: BottleStatus;
    statusTimestamp: Date;
    expirationTimestamp: Date;
    volInOunces: number;
    capacityInOunces: number;
}

export interface DashboardDataDto {
    bottles: GetBottleResponseDto[];
}

export interface UpdateBottleRequestDto {
    status: BottleStatus;
    volInOunces: number;
    expirationTimestamp?: Date;
}

export interface DashboardData {
    lastFeed: Date;
    lastPump: Date;
    ozInFridge: number;
    bottlesInUse: GetBottleResponseDto[];
    bottlesOut: GetBottleResponseDto[];

}
