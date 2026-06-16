export class DualStateObserver {
    constructor(machine, energyFn, renderer, teaching) {
        this.machine = machine;
        this.energyFn = energyFn;
        this.renderer = renderer;
        this.teaching = teaching;

        this.systemState = {
            energy: 0.3,
            history: []
        };

        this.experientialState = {
            stance: this.machine.currentStance,
            collapseMode: this.machine.currentCollapseMode,
            isBreathSync: false,
            stiffness: this.renderer.stiffness || 0
        };
    }

    async tickEnergy() {
        const E = await this.energyFn.compute();

        this.systemState.energy = E;
        this.systemState.history = [...this.energyFn.history];

        this.renderer.updateEnergy(E);
        this.renderer.updateEnergyHistory(this.systemState.history);
        this.teaching.updateEnergy(E);

        const stiffness = Math.max(0, Math.min(1, (E - 0.3) / 0.5));
        this.experientialState.stiffness = stiffness;

        if (E > 0.7) {
            this.machine.setStance('protective');
        } else if (E < 0.3) {
            this.machine.setStance('stabilizing');
        }
    }

    handleStanceChange(stance) {
        this.experientialState.stance = stance;

        const collapseMap = {
            protective: 'forced',
            exploratory: 'avoided',
            commitment: 'premature',
            stabilizing: 'appropriate'
        };

        this.experientialState.collapseMode =
            collapseMap[stance] || 'appropriate';

        this.renderer.updateStance(stance);
        this.teaching.showStance(stance);
    }

    handleDrag(stance) {
        if (this.experientialState.isBreathSync) return;

        const stiffness = this.experientialState.stiffness || 0;
        const allowChance = 1 - stiffness;

        if (Math.random() < allowChance) {
            this.machine.setStance(stance);
        } else {
            this.renderer.updateStance(this.machine.currentStance);
        }
    }

    handleTap() {
        if (this.experientialState.isBreathSync) {
            this.renderer.exitBreathSync();
            this.teaching.hideBreathSync();
            this.experientialState.isBreathSync = false;
            return;
        }

        const mode = this.machine.currentCollapseMode;
        this.experientialState.collapseMode = mode;

        this.renderer.revealCollapseMode(mode);
        this.teaching.showCollapse(mode);
    }

    handleLongPress() {
        this.renderer.enterBreathSync();
        this.teaching.showBreathSync();
        this.experientialState.isBreathSync = true;
    }
}
