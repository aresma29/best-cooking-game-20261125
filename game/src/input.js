// DAPUR KILAT — input: keyboard + mouse, turned into one plain action object.
// The world reads this each tick; the autopilot in shots.js writes it directly.
export function createInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
    interactPressed: false,
    pausePressed: false,
    mutePressed: false,
    anyKeyPressed: false,
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,
    moveTarget: null,
    pendingInteract: false,
  };
}

const KEYMAP = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  KeyE: 'interact',
  Space: 'interact',
};

export function attachInput(input, canvas) {
  window.addEventListener('keydown', (event) => {
    const field = KEYMAP[event.code];
    if (field) {
      if (!event.repeat) {
        if (field === 'interact') input.interactPressed = true;
        input.anyKeyPressed = true;
      }
      input[field] = true;
      event.preventDefault();
      return;
    }
    if (event.code === 'KeyP' || event.code === 'Escape') {
      if (!event.repeat) input.pausePressed = true;
    }
    if (event.code === 'KeyM') {
      if (!event.repeat) input.mutePressed = true;
    }
    if (event.code === 'Space' || event.code === 'Enter') {
      if (!event.repeat) input.anyKeyPressed = true;
    }
  });
  window.addEventListener('keyup', (event) => {
    const field = KEYMAP[event.code];
    if (field) input[field] = false;
  });
  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = false;
    input.interact = false;
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((event.clientX - rect.left) / rect.width) * 1280;
    input.mouseY = ((event.clientY - rect.top) / rect.height) * 720;
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((event.clientX - rect.left) / rect.width) * 1280;
    input.mouseY = ((event.clientY - rect.top) / rect.height) * 720;
    input.mouseClicked = true;
    input.anyKeyPressed = true;
  });
}

export function endFrameInput(input) {
  // NOTE: interactPressed is NOT cleared here — the world consumes it inside
  // update(), so a tap is never lost between ticks (see world.js).
  input.pausePressed = false;
  input.mutePressed = false;
  input.anyKeyPressed = false;
  input.mouseClicked = false;
}
