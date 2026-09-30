export interface InputState {
  moveX: number; // -1 (left) to 1 (right)
  moveZ: number; // -1 (forward) to 1 (backward)
  isSprinting: boolean;
  isJumping: boolean;
  isShooting: boolean;
  reloadPressed: boolean;
  interactPressed: boolean;
  healPressed: boolean;
  switchWeaponSlot: number | null; // 1, 2, 3
  pausePressed: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
}

export class InputManager {
  public state: InputState = {
    moveX: 0,
    moveZ: 0,
    isSprinting: false,
    isJumping: false,
    isShooting: false,
    reloadPressed: false,
    interactPressed: false,
    healPressed: false,
    switchWeaponSlot: null,
    pausePressed: false,
    lookDeltaX: 0,
    lookDeltaY: 0,
  };

  private keysDown: Set<string> = new Set();
  public isPointerLocked: boolean = false;
  private canvasElement: HTMLElement | null = null;
  public mouseSensitivity: number = 1.0;

  // Mobile virtual joystick state
  public joystickActive: boolean = false;
  public joystickVector: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.setupKeyboard();
  }

  public attachCanvas(canvas: HTMLElement) {
    this.canvasElement = canvas;
    this.setupMouse(canvas);
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keysDown.add(e.code);

      if (e.code === 'KeyR') this.state.reloadPressed = true;
      if (e.code === 'KeyE') this.state.interactPressed = true;
      if (e.code === 'KeyH') this.state.healPressed = true;
      if (e.code === 'Digit1') this.state.switchWeaponSlot = 1;
      if (e.code === 'Digit2') this.state.switchWeaponSlot = 2;
      if (e.code === 'Digit3') this.state.switchWeaponSlot = 3;
      if (e.code === 'Escape') this.state.pausePressed = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });
  }

  private setupMouse(canvas: HTMLElement) {
    // Click on canvas to lock mouse
    canvas.addEventListener('click', () => {
      if (!this.isPointerLocked && document.pointerLockElement !== canvas) {
        try {
          canvas.requestPointerLock?.();
        } catch {
          // ignore
        }
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvasElement;
    });

    // Mouse move for aim
    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.state.lookDeltaX += e.movementX * 0.002 * this.mouseSensitivity;
        this.state.lookDeltaY += e.movementY * 0.002 * this.mouseSensitivity;
      }
    });

    // Left click shoot
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.state.isShooting = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.state.isShooting = false;
      }
    });
  }

  public update() {
    // 1. Keyboard WASD
    let kx = 0;
    let kz = 0;

    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) kz -= 1;
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) kz += 1;
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) kx -= 1;
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) kx += 1;

    // Merge keyboard with mobile virtual joystick
    if (this.joystickActive) {
      this.state.moveX = this.joystickVector.x;
      this.state.moveZ = this.joystickVector.y;
    } else {
      this.state.moveX = kx;
      this.state.moveZ = kz;
    }

    // Sprinting: Shift key or Joystick pushed past 0.8
    const joyMagnitude = Math.sqrt(this.joystickVector.x ** 2 + this.joystickVector.y ** 2);
    this.state.isSprinting = this.keysDown.has('ShiftLeft') || this.keysDown.has('ShiftRight') || joyMagnitude > 0.85;

    // Jump
    this.state.isJumping = this.keysDown.has('Space');
  }

  // Consume one-shot action triggers after each frame tick
  public postUpdate() {
    this.state.reloadPressed = false;
    this.state.interactPressed = false;
    this.state.healPressed = false;
    this.state.switchWeaponSlot = null;
    this.state.pausePressed = false;
    this.state.lookDeltaX = 0;
    this.state.lookDeltaY = 0;
  }

  // Mobile trigger helpers
  public triggerMobileShoot(isShooting: boolean) {
    this.state.isShooting = isShooting;
  }

  public triggerMobileReload() {
    this.state.reloadPressed = true;
  }

  public triggerMobileJump() {
    this.state.isJumping = true;
  }

  public triggerMobileHeal() {
    this.state.healPressed = true;
  }

  public triggerMobileInteract() {
    this.state.interactPressed = true;
  }

  public triggerMobileSwitchWeapon() {
    if (this.state.switchWeaponSlot === null) {
      this.state.switchWeaponSlot = 1;
    }
  }

  public addTouchLook(dx: number, dy: number) {
    this.state.lookDeltaX += dx * 0.004 * this.mouseSensitivity;
    this.state.lookDeltaY += dy * 0.004 * this.mouseSensitivity;
  }
}
