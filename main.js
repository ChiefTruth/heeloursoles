import { StanceStateMachine } from './state/stanceMachine.js';
import { EnergyFunction } from './state/energyFunction.js';
import { CompassRenderer } from './ui/compassRenderer.js';
import { TeachingLayer } from './ui/TeachingLayer.js';
import { GestureHandler } from './ui/gestureHandler.js';
import { SoundEngine } from './audio/soundEngine.js';
import { DualStateObserver } from './observer/DualStateObserver.js';

const machine = new StanceStateMachine();
const renderer = new CompassRenderer('compass-root');
const teaching = new TeachingLayer();
const energy = new EnergyFunction();
const sound = new SoundEngine();

renderer.setSoundEngine(sound);

const observer = new DualStateObserver(machine, energy, renderer, teaching);

// Wire stance changes into observer
machine.onStanceChange = (stance) => {
    observer.handleStanceChange(stance);
};

// Energy loop driven by observer
setInterval(async () => {
    await observer.tickEnergy();
}, 5000);

// Gestures routed through observer
new GestureHandler(
    document.getElementById('compass-root'),
    (stance) => observer.handleDrag(stance),
    () => observer.handleTap(),
    () => observer.handleLongPress()
);

// Initial stance render
observer.handleStanceChange(machine.currentStance);
