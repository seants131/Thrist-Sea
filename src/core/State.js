export const State = {
    coal: 100,
    isPurifierRunning: true,
    buildings: [], // Now stores objects: { mesh, type }
    maxHydrationRadius: 25,
    time: 0,
    isNight: false,
    coalPiles: [],
    buildMode: null, // 'HOUSE', 'GATHERING_POST', or null
    costs: {
        HOUSE: 10,
        GATHERING_POST: 20
    }
};
