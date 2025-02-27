/* eslint-disable no-underscore-dangle */
/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppDelegate } from './lappdelegate';
import * as LAppDefine from './lappdefine';
import { LAppGlManager } from './lappglmanager';
import { LAppLive2DManager } from './lapplive2dmanager';

/**
 * Initialize the Live2D application
 */
export function initializeLive2D(): void {
  console.log('Initializing Live2D with resourcePath:', LAppDefine.ResourcesPath);
  console.log('Model directories:', LAppDefine.ModelDir);

  // Clean up any existing instances first
  if (LAppDelegate.getInstance()) {
    // Release existing model resources
    LAppLive2DManager.releaseInstance();
  }

  if (
    !LAppGlManager.getInstance() ||
    !LAppDelegate.getInstance().initialize()
  ) {
    console.error("Failed to initialize Live2D");
    return;
  }

  LAppDelegate.getInstance().run();

  if ((window as any).api?.setIgnoreMouseEvent) {
    const parent = document.getElementById('live2d');

    parent?.addEventListener("pointermove", (e) => {
      const model = LAppLive2DManager.getInstance().getModel(0);
      const view = LAppDelegate.getInstance().getView();

      // Transform screen coordinates to Live2D canvas coordinates
      const x = view?._deviceToScreen.transformX(e.x);
      const y = view?._deviceToScreen.transformY(e.y);

      // Check if mouse is over the Live2D model
      // If not over model (false), we want to ignore mouse events (true)
      (window as any).api.setIgnoreMouseEvent(!model?.anyhitTest(x, y));
    });
  }
}

/**
 * Keep the original window.load handler for backwards compatibility
 * (for the standalone HTML file)
 */
window.addEventListener(
  'load',
  (): void => {
    initializeLive2D();
  },
  { passive: true },
);

/**
 * 終了時の処理
 * 结束时的处理
 */
window.addEventListener(
  'beforeunload',
  (): void => LAppDelegate.releaseInstance(),
  { passive: true },
);

/**
 * Process when changing screen size.
 */
window.addEventListener(
  'resize',
  () => {
    if (LAppDefine.CanvasSize === 'auto') {
      LAppDelegate.getInstance().onResize();
    }
  },
  { passive: true },
);

// Make the initialization function available globally
(window as any).initializeLive2D = initializeLive2D;
