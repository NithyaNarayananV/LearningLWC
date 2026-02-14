import { LightningElement, track } from 'lwc';

export default class ValentinePuzzle extends LightningElement {
    @track tiles = [];
    @track showMessage = false;
    @track avatarExpression = '😊';
    clickCount = 0;

    // internal canvas refs
    _canvas;
    _ctx;
    _raf = null;

    connectedCallback() {
        this.tiles = Array.from({ length: 9 }, (_, i) => ({
            id: i,
            value: '?'
        }));
    }

    renderedCallback() {
        if (!this._canvas) {
            this._canvas = this.template.querySelector('.confetti-canvas');
            if (this._canvas) {
                this._ctx = this._canvas.getContext('2d');
                // Size once; we’ll also resize on each blast in case viewport changed
                this._resizeCanvas();
                // Optional: handle viewport resize
                window.addEventListener('resize', this._resizeCanvas);
            }
        }
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._resizeCanvas);
        if (this._raf) cancelAnimationFrame(this._raf);
    }

    _resizeCanvas = () => {
        if (!this._canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // keep perf sane
        this._canvas.width = Math.floor(window.innerWidth * dpr);
        this._canvas.height = Math.floor(window.innerHeight * dpr);
        this._canvas.style.width = `${window.innerWidth}px`;
        this._canvas.style.height = `${window.innerHeight}px`;
        if (this._ctx) this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing for DPR
    };

    handleTileClick = (event) => {
        const id = parseInt(event.target.dataset.id, 10);
        const index = this.tiles.findIndex(t => t.id === id);
        if (index === -1) return;

        this.clickCount++;

        if (this.clickCount < 9) {
            this.tiles[index] = { ...this.tiles[index], value: 'No 🙈' };
            this.avatarExpression = '😜';
        } else {
            // On the ninth click, set all tiles to "Yes 💕"
            this.tiles = this.tiles.map(tile => ({
                ...tile,
                value: 'Yes 💕'
            }));

            this.showMessage = true;
            this.avatarExpression = '😍';

            // Fire the *vanilla* popper burst—no static resource needed
            this.popperBlastFromGridCenter();
        }

        // reassign to trigger reactivity
        this.tiles = [...this.tiles];
    };

    /**
     * Compute the grid center in viewport percentages (0..1) and trigger a popper burst.
     */
    popperBlastFromGridCenter() {
        // Respect reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const gridHolder = this.template.querySelector('.grid-holder');
        let origin = { x: 0.5, y: 0.6 }; // fallback near center
        if (gridHolder) {
            const rect = gridHolder.getBoundingClientRect();
            origin = {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
            };
        }

        // Recompute canvas size (in case layout changed)
        this._resizeCanvas();

        this._confettiPopper(origin);
    }

    /**
     * Vanilla confetti engine: creates a party‑popper style cone burst with physics.
     * @param {{x:number,y:number}} origin normalized (0..1) viewport coordinates
     */
    _confettiPopper(origin) {
        if (!this._canvas || !this._ctx) return;

        // Make canvas visible during animation
        this._canvas.classList.add('show');

        const ctx = this._ctx;
        const W = this._canvas.width / (window.devicePixelRatio || 1);
        const H = this._canvas.height / (window.devicePixelRatio || 1);

        // Convert normalized origin to canvas pixels
        const ox = origin.x * W;
        const oy = origin.y * H;

        // Parameters for the burst
        const particleCount = 140;
        const baseSpeed = 10;       // initial speed scalar
        const gravity = 0.22;       // downward acceleration
        const drag = 0.012;         // air resistance
        const spreadDeg = 70;       // cone spread
        const baseAngleDeg = -90;   // popper points upward
        const lifeMin = 55, lifeMax = 110; // ticks to live
        const scalarMin = 0.7, scalarMax = 1.2;

        // Valentine/birthday-ish palette (you can tweak)
        const colors = [
            '#ff4d6d', '#ff8fa3', '#ffb3c1',
            '#ffd166', '#06d6a0', '#118ab2',
            '#8338ec', '#ef476f'
        ];

        // Create particles
        const rand = (a, b) => a + Math.random() * (b - a);
        const toRad = (deg) => (deg * Math.PI) / 180;

        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            const angle = baseAngleDeg + rand(-spreadDeg / 2, spreadDeg / 2);
            const speed = baseSpeed * rand(0.7, 1.2);
            const vx = Math.cos(toRad(angle)) * speed;
            const vy = Math.sin(toRad(angle)) * speed;

            particles.push({
                x: ox,
                y: oy,
                vx,
                vy,
                life: rand(lifeMin, lifeMax),
                age: 0,
                w: rand(6, 10),
                h: rand(6, 12),
                rot: rand(0, Math.PI * 2),
                vr: rand(-0.2, 0.2),
                color: colors[(Math.random() * colors.length) | 0],
                scalar: rand(scalarMin, scalarMax),
                shape: Math.random() < 0.7 ? 'rect' : 'circle'
            });
        }

        // Add two side mini‑bursts for popper feel
        const addSideBurst = (angleDeg, count = 40) => {
            for (let i = 0; i < count; i++) {
                const angle = angleDeg + rand(-40, 40);
                const speed = baseSpeed * rand(0.7, 1.05);
                const vx = Math.cos(toRad(angle)) * speed;
                const vy = Math.sin(toRad(angle)) * speed;
                particles.push({
                    x: ox, y: oy, vx, vy,
                    life: rand(lifeMin * 0.8, lifeMax * 0.9),
                    age: 0,
                    w: rand(5, 9),
                    h: rand(5, 9),
                    rot: rand(0, Math.PI * 2),
                    vr: rand(-0.25, 0.25),
                    color: colors[(Math.random() * colors.length) | 0],
                    scalar: rand(0.7, 1.1),
                    shape: Math.random() < 0.8 ? 'rect' : 'circle'
                });
            }
        };
        addSideBurst(-60, 30);
        addSideBurst(-120, 30);

        // Optional: short shimmer trail
        const trailEnd = performance.now() + 700;
        const spawnTrail = () => {
            const now = performance.now();
            if (now > trailEnd) return;
            const angle = baseAngleDeg + rand(-100, 100);
            const speed = baseSpeed * rand(0.5, 0.9);
            particles.push({
                x: ox, y: oy,
                vx: Math.cos(toRad(angle)) * speed,
                vy: Math.sin(toRad(angle)) * speed,
                life: rand(30, 60), age: 0,
                w: rand(4, 7), h: rand(4, 7),
                rot: rand(0, Math.PI * 2), vr: rand(-0.3, 0.3),
                color: colors[(Math.random() * colors.length) | 0],
                scalar: rand(0.6, 0.9),
                shape: 'circle'
            });
            // re‑schedule a few times quickly
            setTimeout(spawnTrail, 60 + Math.random() * 80);
        };
        spawnTrail();

        // Animation loop
        const step = () => {
            // Clear
            ctx.clearRect(0, 0, W, H);

            let alive = 0;

            for (let p of particles) {
                // age
                p.age++;
                if (p.age < p.life) alive++;

                // physics
                p.vx *= (1 - drag);
                p.vy *= (1 - drag);
                p.vy += gravity;

                p.x += p.vx;
                p.y += p.vy;

                p.rot += p.vr;

                // draw
                const alpha = Math.max(0, 1 - p.age / p.life);
                ctx.globalAlpha = alpha;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);

                ctx.fillStyle = p.color;
                const w = p.w * p.scalar;
                const h = p.h * p.scalar;

                if (p.shape === 'rect') {
                    ctx.fillRect(-w / 2, -h / 2, w, h);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, (Math.max(w, h) / 2), 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            ctx.globalAlpha = 1;

            // Continue while any are alive
            if (alive > 0) {
                this._raf = requestAnimationFrame(step);
            } else {
                // Cleanup
                this._canvas.classList.remove('show');
                ctx.clearRect(0, 0, W, H);
                this._raf = null;
            }
        };

        // Start
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = requestAnimationFrame(step);
    }
}
/* 12/Feb/26 
import { LightningElement, track } from 'lwc';

export default class ValentinePuzzle extends LightningElement {
    @track tiles = [];
    @track showMessage = false;
    @track avatarExpression = '😊';
    @track confettiPieces = [];
    clickCount = 0;

    connectedCallback() {
        this.tiles = Array.from({ length: 9 }, (_, i) => ({
            id: i,
            value: '?'
        }));
    }

    handleTileClick(event) {
        const id = parseInt(event.target.dataset.id, 10);
        const index = this.tiles.findIndex(t => t.id === id);
        if (index === -1) return;

        this.clickCount++;

        if (this.clickCount < 9) {
            this.tiles[index] = { ...this.tiles[index], value: 'No 🙈' };
            this.avatarExpression = '😜';
        } else {
            // On the ninth click, set all tiles to "Yes 💕"
            this.tiles = this.tiles.map(tile => ({
                ...tile,
                value: 'Yes 💕'
            }));

            this.showMessage = true;
            this.avatarExpression = '😍';

            // Generate confetti pieces with random angles/distances/colors
            this.confettiPieces = Array.from({ length: 100 }, (_, i) => {
                const angle = Math.random() * 360;
                const distance = 200 + Math.random() * 200;
                const color = `hsl(${Math.random() * 360}, 80%, 50%)`;
                return {
                    id: i,
                    style: `
                        --angle:${angle};
                        --distance:${distance};
                        background:${color};
                    `
                };
            });
        }

        this.tiles = [...this.tiles];
    }
}
*/