import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Svg, Rect as SvgRect } from "react-native-svg";

interface DetectedBarcode {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  timestamp: number;
  // Raw expo-camera values
  rawX: number;
  rawY: number;
  rawWidth: number;
  rawHeight: number;
}

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedBarcodes, setScannedBarcodes] = useState<DetectedBarcode[]>([]);
  const [uniqueBarcodes, setUniqueBarcodes] = useState<Set<string>>(new Set());
  const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });
  const cameraRef = useRef<CameraView>(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  const handleBarcodeScanned = (result: any) => {
    // Handle barcode detection
    try {
      if (result && result.data) {
        const now = Date.now();

        // Avoid duplicate scans within 800ms
        if (scannedBarcodes.length > 0) {
          const lastScan = scannedBarcodes[scannedBarcodes.length - 1];
          if (
            now - lastScan.timestamp < 800 &&
            lastScan.value === result.data
          ) {
            return;
          }
        }

        // Check if barcode is unique
        const isUnique = !uniqueBarcodes.has(result.data);
        if (isUnique) {
          setUniqueBarcodes((prev) => new Set([...prev, result.data]));
        }

        // Calculate bounds from result
        // Apply 90° rotation + scaling transformation
        let x = 0,
          y = 0,
          width = 100,
          height = 100;

        if (
          result.bounds &&
          cameraLayout.width > 0 &&
          cameraLayout.height > 0
        ) {
          const camWidth = cameraLayout.width;
          const camHeight = cameraLayout.height;
          const previewWidth = screenWidth;
          const previewHeight = screenHeight;

          // Get raw coordinates from camera
          const x_cam = result.bounds.origin?.x || 0;
          const y_cam = result.bounds.origin?.y || 0;
          const w_cam = result.bounds.size?.width || 100;
          const h_cam = result.bounds.size?.height || 100;

          // Step 2: Apply scaling
          x = previewWidth - y_cam + h_cam; //* (previewWidth / camWidth);
          y = x_cam; //* (previewHeight / camHeight);
          width = h_cam; //* (previewWidth / camWidth);
          height = w_cam; //* (previewHeight / camHeight);
        }

        console.log(
          `x=${x.toFixed(1)}, y=${y.toFixed(1)}, width=${width.toFixed(
            1
          )}, height=${height.toFixed(
            1
          )}, camWidth=${cameraLayout.width.toFixed(
            1
          )}, camHeight=${cameraLayout.height.toFixed(1)},
          screenWidth=${screenWidth}, screenHeight=${screenHeight}`
        );

        const newBarcode: DetectedBarcode = {
          x,
          y,
          width,
          height,
          value: result.data,
          timestamp: now,
          // Store raw values for comparison
          rawX: result.bounds?.origin?.x || 0,
          rawY: result.bounds?.origin?.y || 0,
          rawWidth: result.bounds?.size?.width || 0,
          rawHeight: result.bounds?.size?.height || 0,
        };

        console.log(
          `CAMERA BOUNDS: x[0-${cameraLayout.width}] y[0-${cameraLayout.height}] | ` +
            `RAW (x_cam, y_cam): (${
              scannedBarcodes.length > 0
                ? scannedBarcodes[0].rawX.toFixed(1)
                : "N/A"
            }, ${
              scannedBarcodes.length > 0
                ? scannedBarcodes[0].rawY.toFixed(1)
                : "N/A"
            }) | ` +
            `TRANSFORMED (x, y): (${x.toFixed(1)}, ${y.toFixed(1)}) | ` +
            `VALUE: ${result.data}`
        );
        console.log(
          `SCREEN SPACE: x[0-${screenWidth}] y[0-${screenHeight}] | WIDTH: ${width.toFixed(
            1
          )} HEIGHT: ${height.toFixed(1)}`
        );

        setScannedBarcodes([newBarcode]);
      }
    } catch (error) {
      console.error("Error processing barcode:", error);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to access the camera
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        autofocus="on"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setCameraLayout({ width, height });
        }}
        onBarcodeScanned={(result) => {
          // CornerPoints - find min/max
          if (result?.cornerPoints) {
            const xValues = result.cornerPoints.map((p: any) => p.x);
            const yValues = result.cornerPoints.map((p: any) => p.y);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
          }

          handleBarcodeScanned(result);
        }}
        barcodeScannerSettings={{
          barcodeTypes: ["datamatrix"],
        }}
      >
        {/* Overlay SVG for drawing rectangles */}
        <Svg
          style={styles.overlay}
          width={screenWidth}
          height={screenHeight}
          pointerEvents="none"
        >
          {scannedBarcodes.map((barcode, index) => (
            <SvgRect
              key={index}
              x={barcode.x}
              y={barcode.y}
              width={barcode.width}
              height={barcode.height}
              stroke="#00FF00"
              strokeWidth="3"
              fill="none"
            />
          ))}
        </Svg>

        {/* Debug Info - Sol üst köşe */}
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            Camera: {cameraLayout.width.toFixed(0)} x{" "}
            {cameraLayout.height.toFixed(0)}
          </Text>
          <Text style={styles.debugText}>
            Screen: {screenWidth} x {screenHeight}
          </Text>
          {cameraLayout.width > 0 && (
            <>
              <Text style={styles.debugText}>
                Ratio X: {(screenWidth / cameraLayout.width).toFixed(3)}
              </Text>
              <Text style={styles.debugText}>
                Ratio Y: {(screenHeight / cameraLayout.height).toFixed(3)}
              </Text>
            </>
          )}
        </View>

        {/* Counter - Sağ üst köşe */}
        <View style={styles.counterBox}>
          <Text style={styles.counterNumber}>{uniqueBarcodes.size}</Text>
          <Text style={styles.counterLabel}>Unique</Text>
        </View>

        {/* Display detected barcode info */}
        {scannedBarcodes.length > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText} numberOfLines={1}>
              Value: {scannedBarcodes[0].value}
            </Text>
            <Text style={styles.infoText}>
              TRANSFORMED - X: {Math.round(scannedBarcodes[0].x)}, Y:{" "}
              {Math.round(scannedBarcodes[0].y)}
            </Text>
            <Text style={styles.infoText}>
              TRANSFORMED - W: {Math.round(scannedBarcodes[0].width)}, H:{" "}
              {Math.round(scannedBarcodes[0].height)}
            </Text>
            <Text style={styles.infoText}>
              RAW - X: {Math.round(scannedBarcodes[0].rawX)}, Y:{" "}
              {Math.round(scannedBarcodes[0].rawY)}
            </Text>
            <Text style={styles.infoText}>
              RAW - W: {Math.round(scannedBarcodes[0].rawWidth)}, H:{" "}
              {Math.round(scannedBarcodes[0].rawHeight)}
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  infoBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
    borderRadius: 8,
    zIndex: 20,
  },
  infoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  counterBox: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 200, 83, 0.9)",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 25,
    borderWidth: 2,
    borderColor: "#00FF00",
  },
  counterNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  counterLabel: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  debugBox: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(255, 100, 100, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    zIndex: 25,
  },
  debugText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 2,
  },
});
