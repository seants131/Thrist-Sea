import * as THREE from 'three';
import { State } from '../core/State.js';

export const Economy = {
    update(scene) {
        // Gathering Logic
        let totalMined = 0;
        const miningRadius = 10;

        State.buildings.forEach(building => {
            if (building.userData.type === 'GATHERING_POST') {
                // Check distance to each coal pile
                State.coalPiles.forEach(pile => {
                    const dist = building.position.distanceTo(pile.position);
                    if (dist < miningRadius) {
                        totalMined += 2;
                        // Optional: visual feedback could be added here
                    }
                });
            }
        });

        // Add mined coal
        State.coal += totalMined;

        // Consumption Logic
        const consumption = State.isNight ? 2 : 1;
        
        if (State.coal > 0) {
            State.coal -= consumption;
        }

        if (State.coal <= 0 && State.isPurifierRunning) {
            State.isPurifierRunning = false;
        } else if (State.coal > 0 && !State.isPurifierRunning) {
            // Automatically restart if coal is added
            State.isPurifierRunning = true;
        }

        // Depletion Mechanic: Every 300 ticks
        if (State.time > 0 && State.time % 300 === 0) {
            this.depleteResource(scene);
        }

        this.updateUI();
    },

    depleteResource(scene) {
        if (State.coalPiles.length > 0) {
            const pile = State.coalPiles.pop();
            scene.remove(pile);
            console.log("A coal pile has been depleted!");
        }
    },

    updateUI() {
        const coalEl = document.getElementById('coal-count');
        const statusEl = document.getElementById('status');
        const timeEl = document.getElementById('time-count');
        const phaseEl = document.getElementById('phase');

        if (coalEl) coalEl.innerText = Math.max(0, State.coal);
        if (timeEl) timeEl.innerText = State.time;
        if (phaseEl) {
            phaseEl.innerText = State.isNight ? "Night" : "Day";
            phaseEl.style.color = State.isNight ? "#5c6bc0" : "#ffeb3b";
        }
        
        if (statusEl) {
            if (State.isPurifierRunning) {
                statusEl.innerText = "Running";
                statusEl.style.color = "#4caf50";
            } else {
                statusEl.innerText = "Stopped";
                statusEl.style.color = "#f44336";
            }
        }
    }
};
