export class GestureHandler {
    constructor(rootElement, onDragStance, onTap, onLongPress) {
        this.root = rootElement;
        this.onDragStance = onDragStance;
        this.onTap = onTap;
        this.onLongPress = onLongPress;

        this.dragging = false;
        this.longPressTimeout = null;

        this.initEvents();
    }

    initEvents() {
        this.root.addEventListener('pointerdown', (e) => this.startPress(e));
        this.root.addEventListener('pointermove', (e) => this.move(e));
        this.root.addEventListener('pointerup', () => this.endPress());
        this.root.addEventListener('pointerleave', () => this.cancelPress());
    }

    startPress(e) {
        this.dragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        this.longPressTimeout = setTimeout(() => {
            this.longPressTimeout = null;
            this.root.classList.add('longpress');
            setTimeout(() => this.root.classList.remove('longpress'), 800);
            this.onLongPress();
        }, 600);
    }

    move(e) {
        if (!this.dragging) return;

        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        let stance = 'stabilizing';

        if (angle >= -45 && angle < 45) stance = 'exploratory';
        else if (angle >= 45 && angle < 135) stance = 'protective';
        else if (angle >= -135 && angle < -45) stance = 'commitment';
        else stance = 'stabilizing';

        this.onDragStance(stance);
    }

    endPress() {
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.onTap();
        }
        this.dragging = false;
    }

    cancelPress() {
        if (this.longPressTimeout) clearTimeout(this.longPressTimeout);
        this.dragging = false;
    }
}
