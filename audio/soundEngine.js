export class SoundEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playTone(startFreq, endFreq, durationMs) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);

        if (endFreq !== startFreq) {
            osc.frequency.linearRampToValueAtTime(
                endFreq,
                this.ctx.currentTime + durationMs / 1000
            );
        }

        gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.2,
            this.ctx.currentTime + 0.02
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            this.ctx.currentTime + durationMs / 1000
        );

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + durationMs / 1000);
    }
}
