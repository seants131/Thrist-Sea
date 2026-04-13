import { State } from '../core/State.js';

export const Economy = {
    update() {
        if (State.coal > 0) {
            State.coal -= 1;
            this.updateUI();
        }

        if (State.coal <= 0 && State.isPurifierRunning) {
            State.isPurifierRunning = false;
            this.updateUI();
        }
    },

    updateUI() {
        const coalEl = document.getElementById('coal-count');
        const statusEl = document.getElementById('status');

        if (coalEl) coalEl.innerText = Math.max(0, State.coal);
        
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
