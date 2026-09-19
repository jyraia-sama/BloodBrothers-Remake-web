// ============================================================
//  AIDE AU DÉFILEMENT
//  Rend un container défilable quand son contenu dépasse la
//  zone visible : molette (desktop) + flèches (souris/tactile).
// ============================================================

/**
 * @param {Phaser.Scene} scene
 * @param {Phaser.GameObjects.Container} container  Le container à faire défiler.
 * @param {{x:number,y:number,width:number,height:number}} viewport  Zone visible (coordonnées monde).
 * @param {number} contentHeight  Hauteur totale du contenu du container.
 * @param {{step?: number}} options
 * @returns {{ scrollBy: Function, maxScroll: number, destroy: Function }}
 */
export function makeScrollable(scene, container, viewport, contentHeight, options = {}) {
  const { x, y, width, height } = viewport;
  const step = options.step || 100;
  const maxScroll = Math.max(0, contentHeight - height);

  // Masque : seul le contenu à l'intérieur du viewport est visible
  const maskShape = scene.make.graphics({});
  maskShape.fillStyle(0xffffff);
  maskShape.fillRect(x - width / 2, y - height / 2, width, height);
  container.setMask(maskShape.createGeometryMask());

  let scrollY = 0;
  const applyScroll = () => { container.y = -scrollY; };

  const scrollBy = (delta) => {
    if (maxScroll <= 0) return;
    scrollY = Phaser.Math.Clamp(scrollY + delta, 0, maxScroll);
    applyScroll();
  };

  const setScroll = (value) => {
    scrollY = Phaser.Math.Clamp(value, 0, maxScroll);
    applyScroll();
  };

  const getScroll = () => scrollY;

  if (options.initialScroll) {
    setScroll(options.initialScroll);
  }

  let onWheel = null;
  let arrowUp = null;
  let arrowDown = null;

  if (maxScroll > 0) {
    const inViewport = (pointer) =>
      pointer.x >= x - width / 2 && pointer.x <= x + width / 2 &&
      pointer.y >= y - height / 2 && pointer.y <= y + height / 2;

    onWheel = (pointer, gameObjects, deltaX, deltaY) => {
      if (!inViewport(pointer)) return;
      scrollBy(deltaY * 0.4);
    };
    scene.input.on('wheel', onWheel);

    // Flèches (fonctionnent aussi bien à la souris qu'au tactile)
    arrowUp = scene.add.text(x + width / 2 + 18, y - height / 2 + 12, '▲', {
      fontSize: '16px', color: '#aaaaaa', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    arrowDown = scene.add.text(x + width / 2 + 18, y + height / 2 - 12, '▼', {
      fontSize: '16px', color: '#aaaaaa', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    arrowUp.on('pointerdown', () => scrollBy(-step));
    arrowDown.on('pointerdown', () => scrollBy(step));
    arrowUp.on('pointerover', () => arrowUp.setColor('#ffffff'));
    arrowUp.on('pointerout', () => arrowUp.setColor('#aaaaaa'));
    arrowDown.on('pointerover', () => arrowDown.setColor('#ffffff'));
    arrowDown.on('pointerout', () => arrowDown.setColor('#aaaaaa'));
  }

  const destroy = () => {
    if (onWheel) scene.input.off('wheel', onWheel);
    if (arrowUp) arrowUp.destroy();
    if (arrowDown) arrowDown.destroy();
    maskShape.destroy();
  };

  scene.events.once('shutdown', destroy);

  return { scrollBy, setScroll, getScroll, maxScroll, destroy };
}