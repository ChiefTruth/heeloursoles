export class CompassRenderer {
    constructor(rootId) {
        this.root = document.getElementById(rootId);

        this.root.innerHTML = `
      <svg id="compass" viewBox="0 0 200 200"
           xmlns="http://www.w3.org/2000/svg"
           style="pointer-events:auto;">
        <defs>
          <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--core-inner)" />
            <stop offset="60%" stop-color="var(--core-mid)" />
            <stop offset="100%" stop-color="var(--core-outer)" />
          </radialGradient>

          <radialGradient id="auraGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--aura-color)" />
            <stop offset="100%" stop-color="rgba(0,0,0,0)" />
          </radialGradient>

          <pattern id="terrainPattern" x="0" y="0" width="0.25" height="0.25">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.08)" />
            <circle cx="6" cy="4" r="1" fill="rgba(255,255,255,0.06)" />
            <circle cx="3" cy="7" r="1" fill="rgba(255,255,255,0.05)" />
          </pattern>

          <filter id="auraBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>

          <pattern id="terrain-basin" x="0" y="0" width="0.25" height="0.25">
            <circle cx="4" cy="4" r="2" fill="rgba(255,255,255,0.06)" />
            <circle cx="8" cy="8" r="1.5" fill="rgba(255,255,255,0.04)" />
          </pattern>

          <pattern id="terrain-loop" x="0" y="0" width="0.25" height="0.25">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)" />
            <circle cx="6" cy="6" r="1" fill="rgba(255,255,255,0.05)" />
            <circle cx="10" cy="2" r="1" fill="rgba(255,255,255,0.05)" />
          </pattern>

          <pattern id="terrain-cliff" x="0" y="0" width="0.25" height="0.25">
            <rect x="0" y="0" width="12" height="2" fill="rgba(255,255,255,0.08)" />
            <rect x="0" y="6" width="12" height="2" fill="rgba(255,255,255,0.08)" />
          </pattern>

          <pattern id="terrain-funnel" x="0" y="0" width="0.25" height="0.25">
            <circle cx="6" cy="6" r="3" fill="rgba(255,255,255,0.07)" />
            <circle cx="6" cy="6" r="1" fill="rgba(255,255,255,0.12)" />
          </pattern>
        </defs>

        <circle id="plate" cx="100" cy="100" r="98"
          fill="var(--plate-bg)" stroke="rgba(255,255,255,0.05)" stroke-width="1" />

        <circle id="aura" cx="100" cy="100" r="85"
          fill="url(#auraGradient)" filter="url(#auraBlur)" />

        <circle id="core" cx="100" cy="100" r="65"
          fill="url(#coreGradient)" />

        <circle id="terrain" cx="100" cy="100" r="60"
          fill="url(#terrainPattern)" opacity="0.35" />

        <g id="needle-group" transform="translate(100,100)">
          <line id="needle" x1="0" y1="0" x2="0" y2="-55"
            stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
          <circle cx="0" cy="-55" r="3" fill="#ffffff" />
          <circle cx="0" cy="0" r="4" fill="#ffffff" opacity="0.9" />
        </g>

        <g id="markers" fill="rgba(255,255,255,0.18)"
           font-size="8" font-family="system-ui, sans-serif">
          <text x="100" y="22" text-anchor="middle">N</text>
          <text x="178" y="104" text-anchor="middle">E</text>
          <text x="22" y="104" text-anchor="middle">W</text>
          <text x="100" y="188" text-anchor="middle">S</text>
        </g>

        <circle id="breath-overlay"
          cx="100" cy="100" r="65"
          fill="rgba(255,255,255,0.0)"
          pointer-events="none"
        />

        <g id="collapse-reveal" opacity="0">
          <circle id="reveal-ring"
            cx="100" cy="100" r="75"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.15)"
            stroke-width="2"
          />

          <text id="reveal-label"
            x="100" y="95"
            text-anchor="middle"
            fill="white"
            font-size="12"
            opacity="0"></text>

          <text id="reveal-desc"
            x="100" y="115"
            text-anchor="middle"
            fill="rgba(255,255,255,0.8)"
            font-size="8"
            opacity="0"></text>
        </g>

        <g id="energy-history"></g>

      </svg>
    `;

        this.needleGroup = this.root.querySelector('#needle-group');
        this.core = this.root.querySelector('#core');
        this.aura = this.root.querySelector('#aura');
        this.terrain = this.root.querySelector('#terrain');
        this.breathOverlay = this.root.querySelector('#breath-overlay');

        this.stiffness = 0;
        this.isBreathSync = false;
        this.sound = null;

        this.showGestureHints();
    }

    updateStance(stance) {
        if (this.isBreathSync) return;

        const angles = {
            protective: 0,
            exploratory: 90,
            commitment: -90,
            stabilizing: 180
        };

        const breath = {
            protective: 0.7,
            exploratory: 1.0,
            commitment: 0.85,
            stabilizing: 1.3
        };

        const auraColors = {
            protective: 'rgba(255, 80, 80, 0.6)',
            exploratory: 'rgba(255, 200, 120, 0.6)',
            commitment: 'rgba(255, 150, 80, 0.6)',
            stabilizing: 'rgba(120, 220, 200, 0.6)'
        };

        const collapseMap = {
            protective: 'forced',
            exploratory: 'avoided',
            commitment: 'premature',
            stabilizing: 'appropriate'
        };

        const targetAngle = angles[stance];

        this.needleGroup.style.transform =
            `translate(100px, 100px) rotate(${targetAngle - 6}deg)`;

        setTimeout(() => {
            this.needleGroup.style.transform =
                `translate(100px, 100px) rotate(${targetAngle}deg)`;
        }, 80);

        this.setBreathSpeed(breath[stance]);

        this.aura.querySelector('stop').setAttribute(
            'stop-color',
            auraColors[stance]
        );

        const collapseMode = collapseMap[stance];
        this.setCollapseMode(collapseMode);
        this.setTerrainMode(collapseMode);
    }

    setBreathSpeed(multiplier) {
        this.core.style.animationDuration = `${6 * multiplier}s`;
        this.aura.style.animationDuration = `${6 * multiplier}s`;
    }

    setTerrainMode(mode) {
        switch (mode) {
            case 'forced':
                this.terrain.style.animation =
                    'terrain-jitter 0.25s infinite steps(2)';
                break;
            case 'premature':
                this.terrain.style.animation =
                    'terrain-spin-fast 4s linear infinite';
                break;
            case 'avoided':
                this.terrain.style.animation =
                    'terrain-spin-slow 12s linear infinite';
                break;
            case 'appropriate':
            default:
                this.terrain.style.animation =
                    'terrain-spin-gentle 20s linear infinite';
                break;
        }
    }

    setCollapseMode(mode) {
        const patterns = {
            appropriate: 'terrain-basin',
            avoided: 'terrain-loop',
            premature: 'terrain-cliff',
            forced: 'terrain-funnel'
        };

        const patternId = patterns[mode] || 'terrain-basin';

        this.terrain.style.transition = 'opacity 0.4s ease';
        this.terrain.style.opacity = 0;

        setTimeout(() => {
            this.terrain.setAttribute('fill', `url(#${patternId})`);
            this.terrain.style.opacity = 0.35;
        }, 400);
    }

    updateEnergy(E) {
        const intensity = 0.5 + E * 0.5;
        this.aura.style.opacity = intensity;

        const brightness = 1 + E * 0.3;
        this.core.style.filter = `brightness(${brightness})`;

        const speed = 1 + E * 2;
        this.terrain.style.animationDuration =
            `calc(var(--terrain-base-duration, 20s) / ${speed})`;

        this.updateTheme(E);

        const stiffness = Math.max(0, Math.min(1, (E - 0.3) / 0.5));
        this.setStiffness(stiffness);
    }

    updateEnergyHistory(history) {
        const group = this.root.querySelector('#energy-history');
        group.innerHTML = '';

        const cx = 100;
        const cy = 100;
        const radius = 92;
        const total = history.length;

        history.forEach((value, i) => {
            const angle = (i / total) * 360;
            const rad = (angle - 90) * (Math.PI / 180);

            const x1 = cx + radius * Math.cos(rad);
            const y1 = cy + radius * Math.sin(rad);
            const x2 = cx + (radius + 4) * Math.cos(rad);
            const y2 = cy + (radius + 4) * Math.sin(rad);

            const opacity = 0.2 + value * 0.8;
            const color = `rgba(${Math.floor(120 + value * 135)}, ${Math.floor(
                200 - value * 80
            )}, ${Math.floor(255 - value * 200)}, ${opacity})`;

            const line = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'line'
            );
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-linecap', 'round');

            group.appendChild(line);
        });
    }

    enterBreathSync() {
        this.isBreathSync = true;

        this.core.style.animationDuration = '8s';
        this.aura.style.animationDuration = '8s';

        const syncColor = 'rgba(120, 220, 255, 0.7)';
        this.aura.querySelector('stop').setAttribute('stop-color', syncColor);

        this.terrain.style.animation =
            'terrain-spin-gentle 30s linear infinite';

        this.needleGroup.style.transition =
            'transform 2.5s cubic-bezier(0.4, 0.0, 0.2, 1)';

        this.core.style.filter = 'brightness(1.25)';

        this.breathOverlay.style.animation =
            'breath-sync-pulse 8s ease-in-out infinite';
        this.breathOverlay.style.opacity = 1;

        this.root.classList.add('breath-sync');
        this.core.style.transition = 'filter 1.2s var(--ease-aura)';
        this.aura.style.transition = 'filter 1.2s var(--ease-aura)';
    }

    exitBreathSync() {
        this.isBreathSync = false;

        this.setBreathSpeed(1.0);
        this.terrain.style.animation = '';
        this.core.style.filter = '';

        this.needleGroup.style.transition =
            'transform 1.2s var(--ease-needle)';

        this.breathOverlay.style.animation = '';
        this.breathOverlay.style.opacity = 0;

        this.root.classList.remove('breath-sync');
        this.core.style.transition = '';
        this.aura.style.transition = '';
    }

    revealCollapseMode(mode) {
        const reveal = this.root.querySelector('#collapse-reveal');
        const ring = this.root.querySelector('#reveal-ring');
        const label = this.root.querySelector('#reveal-label');
        const desc = this.root.querySelector('#reveal-desc');

        const labels = {
            forced: 'Forced Collapse',
            premature: 'Premature Collapse',
            avoided: 'Avoided Collapse',
            appropriate: 'Appropriate Collapse'
        };

        const descriptions = {
            forced: 'pressure exceeds capacity',
            premature: 'action before readiness',
            avoided: 'circling without descent',
            appropriate: 'release at the right moment'
        };

        label.textContent = labels[mode];
        desc.textContent = descriptions[mode];

        reveal.style.opacity = 1;
        ring.style.transform = 'scale(1.25)';
        label.style.opacity = 1;
        desc.style.opacity = 1;

        setTimeout(() => this.hideCollapseReveal(), 2500);

        this.playCollapseTone(mode);
    }

    hideCollapseReveal() {
        const reveal = this.root.querySelector('#collapse-reveal');
        const ring = this.root.querySelector('#reveal-ring');
        const label = this.root.querySelector('#reveal-label');
        const desc = this.root.querySelector('#reveal-desc');

        reveal.style.opacity = 0;
        ring.style.transform = 'scale(1)';
        label.style.opacity = 0;
        desc.style.opacity = 0;
    }

    updateTheme(E) {
        const root = document.documentElement;

        root.classList.remove('low-energy', 'high-energy');

        if (E < 0.35) {
            root.classList.add('low-energy');
        } else if (E > 0.7) {
            root.classList.add('high-energy');
        }

        root.classList.add('theme-shift');
        setTimeout(() => root.classList.remove('theme-shift'), 800);
    }

    setStiffness(value) {
        this.stiffness = value;

        const duration = 1.2 + value * 1.8;
        this.needleGroup.style.transition =
            `transform ${duration}s var(--ease-needle)`;

        if (value > 0.7) this.root.classList.add('locked');
        else this.root.classList.remove('locked');
    }

    setSoundEngine(engine) {
        this.sound = engine;
    }

    playCollapseTone(mode) {
        if (!this.sound) return;

        const tones = {
            appropriate: () => this.sound.playTone(220, 220, 250),
            avoided: () => this.sound.playTone(440, 440, 180),
            premature: () => this.sound.playTone(330, 220, 220),
            forced: () => this.sound.playTone(180, 90, 260)
        };

        const fn = tones[mode];
        if (fn) fn();
    }

    showGestureHints() {
        // visual hint handled by TeachingLayer; renderer stays semantic/visual
    }
}
