# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GS1-DataMatrix Barcode Scanner is a React Native/Expo application for detecting and tracking barcodes in real-time. The app uses the expo-camera module for barcode detection and react-native-svg for rendering an overlay rectangle that marks detected barcodes.

**Key Achievement:** Implemented 90° rotation + scaling coordinate transformation to correctly map camera coordinates (384×735) to screen display coordinates (384×832), enabling accurate barcode position tracking.

## Architecture

### Core Components

**BarcodeScanner.tsx** (`components/BarcodeScanner.tsx`)
- Main scanner component using `expo-camera` for barcode detection
- Implements coordinate transformation to map camera space → screen space
- State management: `scannedBarcodes`, `uniqueBarcodes`, `cameraLayout`, `permission`
- Renders SVG overlay with green rectangles for detected barcodes
- Tracks unique barcodes with counter display (top-right)
- Includes debug information display (top-left)

### Coordinate System

The critical challenge solved in this app is coordinate transformation:

1. **Camera Coordinate Space** (expo-camera native):
   - Resolution: 384×735 (portrait)
   - Returns bounds via `result.bounds.origin` (x, y) and `result.bounds.size` (width, height)

2. **Screen Display Space** (SVG canvas):
   - Resolution: 384×832 (full screen)
   - SVG rect positioned via `x`, `y`, `width`, `height`

3. **Transformation Formula**:
   ```
   // Step 1: Apply 90° rotation
   x_rot = camHeight - y_cam
   y_rot = x_cam
   w_rot = h_cam
   h_rot = w_cam

   // Step 2: Apply scaling
   x_screen = x_rot * (previewWidth / camWidth)
   y_screen = y_rot * (previewHeight / camHeight)
   width_screen = w_rot * (previewWidth / camWidth)
   height_screen = h_rot * (previewHeight / camHeight)
   ```

This compensates for camera sensor orientation differences and resolution scaling.

### File Structure

```
BarcodeScanner/
├── app/
│   ├── (tabs)/
│   │   ├── barcode.tsx         # Scanner tab page (imports BarcodeScanner component)
│   │   ├── _layout.tsx         # Tab navigation setup
│   │   ├── index.tsx           # Home tab
│   │   └── explore.tsx         # Explore tab
│   └── _layout.tsx             # Root layout
├── components/
│   └── BarcodeScanner.tsx       # Core scanner logic (main file to modify)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── BARCODE_SCANNER_GUIDE.md    # Turkish documentation
└── CLAUDE.md                   # This file
```

## Development Commands

```bash
# Start development server (default port 8081)
npm start

# Start on specific port (useful if port is in use)
npm start -- --port 8084

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Lint code
npm lint

# Run on web
npm start --web
```

## Key Dependencies

- **expo-camera** (^17.0.8): Camera access and barcode detection
- **react-native-svg** (^15.12.1): Vector graphics for overlay rectangles
- **react-native-vision-camera** (^4.7.2): High-performance camera module
- **vision-camera-code-scanner** (^0.2.0): Barcode scanning plugin
- **expo-router** (~6.0.13): File-based routing
- **react-native** (0.81.5): Framework

## State Management

**BarcodeScanner.tsx State:**
- `scannedBarcodes`: Array of detected barcode objects with coordinates
- `uniqueBarcodes`: Set of unique barcode values (for counter)
- `cameraLayout`: Camera dimensions {width, height} from onLayout event
- `permission`: Camera permission state from `useCameraPermissions()`

**DetectedBarcode Interface:**
```typescript
interface DetectedBarcode {
  x: number;        // Transformed X coordinate
  y: number;        // Transformed Y coordinate
  width: number;    // Transformed width
  height: number;   // Transformed height
  value: string;    // Barcode value/data
  timestamp: number; // Detection timestamp (for deduplication)
  rawX: number;     // Raw expo-camera X (for debugging)
  rawY: number;     // Raw expo-camera Y (for debugging)
  rawWidth: number; // Raw expo-camera width
  rawHeight: number;// Raw expo-camera height
}
```

## Barcode Detection Flow

1. `CameraView` captures video frames via `onBarcodeScanned` callback
2. `result` parameter contains detected barcode data (bounds, cornerPoints, value)
3. `handleBarcodeScanned()` function:
   - Extracts raw coordinates from `result.bounds`
   - Applies coordinate transformation (90° rotation + scaling)
   - Checks for duplicate scans (800ms debounce)
   - Stores barcode in state via `setScannedBarcodes()`
4. React renders SVG `<SvgRect>` elements based on state
5. Green rectangles appear on screen tracking barcode position

## Common Tasks

### Adding New Features

When adding features (torch control, haptic feedback, multiple barcode tracking, etc.):
1. Check `expo-camera` and `expo-haptics` documentation for API details
2. Add state in `BarcodeScannerScreen()` component
3. Implement logic in `handleBarcodeScanned()` or create new handlers
4. Update `DetectedBarcode` interface if tracking new data
5. Render UI elements (buttons, text, etc.) inside or around CameraView
6. Test on Android and iOS (different behavior possible)

### Debug Console Output

Current console.log (line 90-99) displays:
```
x=123.5, y=45.2, width=89.3, height=67.8, camWidth=384.0, camHeight=735.0, screenWidth=384, screenHeight=832
```

This shows transformed coordinates and dimensions used for SVG rendering.

### Testing Coordinate Transformation

To verify transformation is working:
1. Point camera at barcode → green rectangle should overlay barcode exactly
2. Move camera → rectangle should follow barcode smoothly
3. Rotate camera → rectangle should rotate with barcode
4. Check console logs to verify coordinate values are reasonable

If rectangle is offset, check:
- Camera layout dimensions match actual camera size
- Scaling factors (previewWidth/camWidth, previewHeight/camHeight) are correct
- 90° rotation formula is applied before scaling
- SVG canvas dimensions match screen dimensions

## TypeScript Patterns

Component uses:
- `useRef<CameraView>()` for camera reference
- `useCameraPermissions()` hook from expo-camera
- `useState<DetectedBarcode[]>()` for barcode list
- `useState<Set<string>>()` for unique values
- Optional chaining (`?.`) for safe property access
- Nullish coalescing (`||`) for fallback values

## Performance Notes

- Barcode deduplication: 800ms time window + value comparison prevents rapid duplicate scans
- State updates trigger full re-render of SVG (acceptable for single barcode)
- For multiple barcodes, consider memoization or useMemo optimization
- Console.log statements should be removed in production

## Future Enhancements

Tracked in BARCODE_SCANNER_GUIDE.md:
- QR code support
- Multiple simultaneous barcode detection
- Barcode history/database storage
- Vibration feedback (expo-haptics available)
- Torch/flashlight control
- Performance optimization
- ML-based improvements

## Permissions

App requires `CAMERA` permission. Handled via `useCameraPermissions()` hook with automatic request flow.
