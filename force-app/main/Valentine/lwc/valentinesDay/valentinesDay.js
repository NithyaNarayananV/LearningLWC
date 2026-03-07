import { LightningElement, track } from 'lwc';
import Valentine1 from '@salesforce/resourceUrl/Valentine1';
import Valentine2 from '@salesforce/resourceUrl/Valentine2';
import Valentine3 from '@salesforce/resourceUrl/Valentine3';
import Valentine4 from '@salesforce/resourceUrl/Valentine4';
import Valentine5 from '@salesforce/resourceUrl/Valentine5';

export default class ValentinesDay extends LightningElement {
    @track isAsking = true; 
    @track showMessage = false;
    @track noButtonStyle = '';
    @track yesScale = 0.2; 
    @track avatarExpression = '😊';
    @track tiles = [];
    
    clickCount = 0;
    _canvas;
    _ctx;
    _raf = null;

    get yesButtonStyle() {
        return `transform: scale(${this.yesScale}); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
    }

    get backgroundStyle() {
        return `
            --bg1: url(${Valentine1});
            --bg2: url(${Valentine2});
            --bg3: url(${Valentine3});
            --bg4: url(${Valentine4});
            --bg5: url(${Valentine5});
        `;
    }

    connectedCallback() {
        this.tiles = Array.from({ length: 9 }, (_, i) => ({ id: i, value: '?' }));
    }

    renderedCallback() {
        if (!this.isAsking && !this._canvas) {
            this._canvas = this.template.querySelector('.confetti-canvas');
            if (this._canvas) {
                this._ctx = this._canvas.getContext('2d');
                this._resizeCanvas();
                window.addEventListener('resize', this._resizeCanvas);
            }
        }
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._resizeCanvas);
        if (this._raf) cancelAnimationFrame(this._raf);
    }

    handleContainerClick(event) {
        if (this.isAsking && !event.target.classList.contains('yes-btn')) {
            this.yesScale += 0.4; 
        }
    }

    handleMouseMove(event) {
        if (!this.isAsking) return;
        const noBtn = this.template.querySelector('.no-btn');
        if (!noBtn) return;

        const rect = noBtn.getBoundingClientRect();
        const distanceX = event.clientX - (rect.left + rect.width / 2);
        const distanceY = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < 120) {
            const offsetX = (Math.random() * 400 - 200);
            const offsetY = (Math.random() * 400 - 200);
            this.noButtonStyle = `transform: translate(${offsetX}px, ${offsetY}px); transition: transform 0.1s linear;`;
        } else {
            this.noButtonStyle = `transform: translate(0,0); transition: transform 0.3s ease;`;
        }
    }

    handleYesClick(event) {
        event.stopPropagation(); 
        this.isAsking = false; 
    }

    handleTileClick = (event) => {
        const id = parseInt(event.target.dataset.id, 10);
        const index = this.tiles.findIndex(t => t.id === id);
        if (index === -1) return;
        this.clickCount++;
        if (this.clickCount < 9) {
            this.tiles[index] = { ...this.tiles[index], value: 'No 🙈' };
            this.avatarExpression = '😜';
        } else {
            this.tiles = this.tiles.map(tile => ({ ...tile, value: 'Yes 💕' }));
            this.showMessage = true;
            this.avatarExpression = '😍';
            this.popperBlastFromGridCenter();
        }
        this.tiles = [...this.tiles];
    };

    _resizeCanvas = () => {
        if (!this._canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this._canvas.width = Math.floor(window.innerWidth * dpr);
        this._canvas.height = Math.floor(window.innerHeight * dpr);
        this._canvas.style.width = `${window.innerWidth}px`;
        this._canvas.style.height = `${window.innerHeight}px`;
        if (this._ctx) this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    popperBlastFromGridCenter() {
        const gridHolder = this.template.querySelector('.grid-holder');
        let origin = { x: 0.5, y: 0.6 };
        if (gridHolder) {
            const rect = gridHolder.getBoundingClientRect();
            origin = {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
            };
        }
        this._resizeCanvas();
        this._confettiPopper(origin);
    }

    _confettiPopper(origin) {
        if (!this._canvas || !this._ctx) return;
        this._canvas.classList.add('show');
        const ctx = this._ctx;
        const W = this._canvas.width / (window.devicePixelRatio || 1);
        const H = this._canvas.height / (window.devicePixelRatio || 1);
        const ox = origin.x * W;
        const oy = origin.y * H;
        const particles = [];
        const colors = ['#ff4d6d', '#ff8fa3', '#ffb3c1', '#ffd166', '#06d6a0', '#118ab2', '#8338ec', '#ef476f'];
        const rand = (a, b) => a + Math.random() * (b - a);
        const toRad = (deg) => (deg * Math.PI) / 180;
        for (let i = 0; i < 140; i++) {
            const angle = -90 + rand(-35, 35);
            const speed = 10 * rand(0.7, 1.2);
            particles.push({
                x: ox, y: oy, vx: Math.cos(toRad(angle)) * speed, vy: Math.sin(toRad(angle)) * speed,
                life: rand(60, 110), age: 0, w: rand(6, 10), h: rand(6, 12), rot: rand(0, Math.PI * 2),
                vr: rand(-0.2, 0.2), color: colors[(Math.random() * colors.length) | 0],
                scalar: rand(0.7, 1.2), shape: Math.random() < 0.7 ? 'rect' : 'circle'
            });
        }
        const step = () => {
            ctx.clearRect(0, 0, W, H);
            let alive = 0;
            for (let p of particles) {
                p.age++; if (p.age < p.life) alive++;
                p.vx *= 0.988; p.vy *= 0.988; p.vy += 0.22;
                p.x += p.vx; p.y += p.vy; p.rot += p.vr;
                const alpha = Math.max(0, 1 - p.age / p.life);
                ctx.globalAlpha = alpha; ctx.save();
                ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
                const w = p.w * p.scalar; const h = p.h * p.scalar;
                if (p.shape === 'rect') ctx.fillRect(-w/2, -h/2, w, h);
                else { ctx.beginPath(); ctx.arc(0,0, w/2, 0, Math.PI*2); ctx.fill(); }
                ctx.restore();
            }
            if (alive > 0) this._raf = requestAnimationFrame(step);
            else { this._canvas.classList.remove('show'); this._raf = null; }
        };
        this._raf = requestAnimationFrame(step);
    }
}