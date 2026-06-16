export class TeachingLayer {
    constructor() {
        this.stanceLabel = document.getElementById('stance-label');
        this.collapseLabel = document.getElementById('collapse-label');
        this.collapseText = document.getElementById('collapse-text');
        this.collapseGlyph = document.getElementById('collapse-glyph');
        this.gestureHints = document.getElementById('gesture-hints');
        this.energyValue = document.getElementById('energy-value');
        this.energyFill = document.getElementById('energy-fill');
        this.breathBadge = document.getElementById('breath-sync-badge');
        this.legendButton = document.getElementById('legend-button');
        this.legendOverlay = document.getElementById('legend-overlay');

        this.initLegend();
        this.showGestureHints();
    }

    showStance(stance) {
        if (!this.stanceLabel) return;
        this.stanceLabel.textContent =
            stance.charAt(0).toUpperCase() + stance.slice(1);
        this.stanceLabel.style.opacity = 1;
        setTimeout(() => (this.stanceLabel.style.opacity = 0), 1200);
    }

    showCollapse(mode) {
        if (!this.collapseLabel) return;

        const labels = {
            forced: 'Forced Collapse',
            premature: 'Premature Collapse',
            avoided: 'Avoided Collapse',
            appropriate: 'Appropriate Collapse'
        };

        const glyphs = {
            forced: '⟱',
            premature: '⟰',
            avoided: '⟳',
            appropriate: '⟴'
        };

        this.collapseText.textContent = labels[mode];
        this.collapseGlyph.textContent = glyphs[mode];

        this.collapseLabel.style.opacity = 1;
        setTimeout(() => (this.collapseLabel.style.opacity = 0), 1500);
    }

    updateEnergy(E) {
        if (!this.energyValue || !this.energyFill) return;
        this.energyValue.textContent = `E = ${E.toFixed(2)}`;
        this.energyFill.style.width = `${E * 100}%`;
    }

    showBreathSync() {
        if (this.breathBadge) this.breathBadge.style.opacity = 1;
    }

    hideBreathSync() {
        if (this.breathBadge) this.breathBadge.style.opacity = 0;
    }

    showGestureHints() {
        if (!this.gestureHints) return;
        this.gestureHints.style.opacity = 1;
        setTimeout(() => (this.gestureHints.style.opacity = 0), 3000);
    }

    initLegend() {
        if (!this.legendButton || !this.legendOverlay) return;
        this.legendButton.onclick = () => {
            this.legendOverlay.classList.toggle('active');
        };
    }
}
