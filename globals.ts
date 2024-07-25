export const enum BottleStatus {
    AVAILABLE = "AVAILABLE",
    REFRIGERATOR = "REFRIGERATOR",
    IN_USE = "IN_USE",
    EMPTY = "EMPTY",
    FRESH = "FRESH",
}

export const enum BottleSectionTitles {
    IN_USE = "Bottles in Use",
    FRESH = "Bottles Out",
    REFRIGERATOR = "Bottles in Fridge",
    AVAILABLE = "Bottles Available to Fill",
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

export interface UpdateBottleRequestDto {
    status: BottleStatus;
    volInOunces: number;
    expirationTimestamp?: Date;
}

export interface DashboardData {
    lastFeed: Date;
    lastBottleFilled: Date;
    ozInFridge: number;
    bottlesInUse: GetBottleResponseDto[];
    bottlesOut: GetBottleResponseDto[];
    bottlesInFridge: GetBottleResponseDto[];
    bottlesAvailable: GetBottleResponseDto[];
}

export interface GetDashboardResponseDto {
    id: string;
    bottles: GetBottleResponseDto[];
    lastFeed: Date;
    lastBottleFilled: Date;
}

