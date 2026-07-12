// Cursor-tracked 3D tilt + shine on cards - vanilla-JS port of the technique from the
// react-animation-studio "3d-animations" skill (their TiltCard/ShinyTiltCard use Framer Motion;
// this site has no React, so it's the same math - mouse offset -> rotateX/rotateY, radial-gradient
// shine following the cursor - done with plain CSS custom properties instead).
(function () {
    const cards = document.querySelectorAll('.exam-card, .cap');
    if (!cards.length || window.matchMedia('(hover: none)').matches) return;   // skip on touch devices

    cards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.style.transition = 'transform 0.15s ease-out';

        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;   // 0..1 across the card
            const py = (e.clientY - r.top) / r.height;
            const rotateY = (px - 0.5) * 14;              // max ~7deg either way
            const rotateX = (0.5 - py) * 14;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
            card.style.setProperty('--shine-x', `${px * 100}%`);
            card.style.setProperty('--shine-y', `${py * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
})();
