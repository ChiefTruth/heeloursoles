export class StanceStateMachine {
    constructor() {
        this.currentStance = 'stabilizing';
        this.currentCollapseMode = 'appropriate';
        this.onStanceChange = () => { };
    }

    setStance(stance) {
        this.currentStance = stance;

        const collapseMap = {
            protective: 'forced',
            exploratory: 'avoided',
            commitment: 'premature',
            stabilizing: 'appropriate'
        };

        this.currentCollapseMode = collapseMap[stance] || 'appropriate';

        this.onStanceChange(stance);
    }
}
